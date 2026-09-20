// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getReserveData(address asset) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint40);
}

interface ICompoundCToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function supplyRatePerBlock() external view returns (uint256);
}

contract YieldManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Protocol type enum — eliminates the fragile string-based keccak routing.
    // BUG FIX: The old _executeDeposit() used keccak256(name) comparison which
    // silently does nothing if the name doesn't exactly match "Aave"/"Compound".
    enum Protocol { NONE, AAVE, COMPOUND }

    struct Strategy {
        string name;
        address protocol;
        address token;
        uint256 currentAPY;
        uint256 tvl;
        bool isActive;
        uint256 riskLevel; // 1 = LOW, 2 = MEDIUM, 3 = HIGH
        Protocol protocolType; // Added — replaces string-based routing
    }

    struct Position {
        string strategyId;
        address user;
        uint256 amount;
        uint256 shares;
        uint256 entryTime;
        uint256 lastRebalance;
    }

    struct RebalanceConfig {
        uint256 thresholdAPYDrop; // Basis points (100 = 1%)
        uint256 minRebalanceAmount;
        uint256 maxSlippage;
        uint256 rebalanceFrequency;
        bool emergencyExitEnabled;
    }

    // State variables
    IERC20 public immutable USDC;
    mapping(string => Strategy) public strategies;
    mapping(address => Position[]) public userPositions;
    mapping(address => RebalanceConfig) public userConfigs;

    // Keepers: addresses authorised to call autoRebalance on behalf of users.
    // BUG FIX: autoRebalance() previously had no access control — anyone could
    // call it and force a user's positions to rebalance at any time.
    mapping(address => bool) public keepers;

    string[] public strategyIds;
    uint256 public totalValueLocked;
    uint256 public constant BASIS_POINTS = 10000;

    // Events
    event Deposit(address indexed user, string strategyId, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, string strategyId, uint256 amount, uint256 shares);
    event Rebalance(address indexed user, string fromStrategy, string toStrategy, uint256 amount);
    event StrategyAdded(string strategyId, string name, address protocol);
    event StrategyUpdated(string strategyId, uint256 newAPY);
    event EmergencyExit(address indexed user, uint256 totalAmount);
    event ConfigUpdated(address indexed user, RebalanceConfig config);
    event KeeperUpdated(address keeper, bool enabled);

    modifier onlyKeeper() {
        require(keepers[msg.sender] || msg.sender == owner(), "Not a keeper");
        _;
    }

    constructor(address _usdc) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
    }

    function setKeeper(address _keeper, bool _enabled) external onlyOwner {
        keepers[_keeper] = _enabled;
        emit KeeperUpdated(_keeper, _enabled);
    }

    // Strategy management
    function addStrategy(
        string memory _strategyId,
        string memory _name,
        address _protocol,
        address _token,
        uint256 _currentAPY,
        uint256 _riskLevel,
        Protocol _protocolType
    ) external onlyOwner {
        require(bytes(strategies[_strategyId].name).length == 0, "Strategy already exists");
        require(_protocolType != Protocol.NONE, "Protocol type must be specified");

        strategies[_strategyId] = Strategy({
            name: _name,
            protocol: _protocol,
            token: _token,
            currentAPY: _currentAPY,
            tvl: 0,
            isActive: true,
            riskLevel: _riskLevel,
            protocolType: _protocolType
        });

        strategyIds.push(_strategyId);
        emit StrategyAdded(_strategyId, _name, _protocol);
    }

    function updateStrategyAPY(string memory _strategyId, uint256 _newAPY) external onlyOwner {
        require(strategies[_strategyId].isActive, "Strategy not active");
        strategies[_strategyId].currentAPY = _newAPY;
        emit StrategyUpdated(_strategyId, _newAPY);
    }

    function toggleStrategy(string memory _strategyId) external onlyOwner {
        strategies[_strategyId].isActive = !strategies[_strategyId].isActive;
    }

    // User configuration
    function updateRebalanceConfig(RebalanceConfig memory _config) external {
        require(_config.thresholdAPYDrop <= 2000, "Threshold too high"); // Max 20%
        require(_config.maxSlippage <= 1000, "Slippage too high"); // Max 10%
        
        userConfigs[msg.sender] = _config;
        emit ConfigUpdated(msg.sender, _config);
    }

    // Core functionality
    function deposit(string memory _strategyId, uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(strategies[_strategyId].isActive, "Strategy not active");
        
        Strategy storage strategy = strategies[_strategyId];
        
        // Transfer USDC from user
        USDC.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Calculate shares (simplified - in production, this would be more complex)
        uint256 shares = _amount;
        
        // Execute deposit to underlying protocol
        _executeDeposit(_strategyId, _amount);
        
        // Record position
        userPositions[msg.sender].push(Position({
            strategyId: _strategyId,
            user: msg.sender,
            amount: _amount,
            shares: shares,
            entryTime: block.timestamp,
            lastRebalance: block.timestamp
        }));
        
        // Update TVL
        strategy.tvl += _amount;
        totalValueLocked += _amount;
        
        emit Deposit(msg.sender, _strategyId, _amount, shares);
    }

    function withdraw(uint256 _positionIndex, uint256 _amount) external nonReentrant {
        require(_positionIndex < userPositions[msg.sender].length, "Invalid position");
        
        Position storage position = userPositions[msg.sender][_positionIndex];
        require(position.amount >= _amount, "Insufficient balance");
        require(position.user == msg.sender, "Not position owner");
        
        Strategy storage strategy = strategies[position.strategyId];
        
        // Calculate shares to redeem
        uint256 sharesToRedeem = (_amount * position.shares) / position.amount;
        
        // Execute withdrawal from underlying protocol
        uint256 withdrawnAmount = _executeWithdraw(position.strategyId, _amount);
        
        // Update position
        position.amount -= _amount;
        position.shares -= sharesToRedeem;
        
        // Remove position if fully withdrawn
        if (position.amount == 0) {
            _removePosition(msg.sender, _positionIndex);
        }
        
        // Update TVL
        strategy.tvl -= _amount;
        totalValueLocked -= _amount;
        
        // Transfer USDC to user
        USDC.safeTransfer(msg.sender, withdrawnAmount);
        
        emit Withdraw(msg.sender, position.strategyId, _amount, sharesToRedeem);
    }

    // BUG FIX: autoRebalance previously had no access control — any address could
    // call it and force a user's positions to rebalance. Now gated to keepers.
    function autoRebalance(address _user) external onlyKeeper {
        RebalanceConfig memory config = userConfigs[_user];
        require(config.rebalanceFrequency > 0, "Auto-rebalance not configured");
        
        Position[] storage positions = userPositions[_user];
        require(positions.length > 0, "No positions to rebalance");
        
        // Find position with lowest APY
        uint256 lowestAPYIndex;
        uint256 lowestAPY = type(uint256).max;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (block.timestamp >= positions[i].lastRebalance + config.rebalanceFrequency) {
                Strategy memory strategy = strategies[positions[i].strategyId];
                if (strategy.currentAPY < lowestAPY) {
                    lowestAPY = strategy.currentAPY;
                    lowestAPYIndex = i;
                }
            }
        }
        
        // Find best strategy
        string memory bestStrategyId = _getBestStrategy(config.minRebalanceAmount);
        uint256 bestAPY = strategies[bestStrategyId].currentAPY;
        
        // Check if rebalance is beneficial
        uint256 apyImprovement = bestAPY - lowestAPY;
        if (apyImprovement >= config.thresholdAPYDrop) {
            _executeRebalance(_user, lowestAPYIndex, bestStrategyId, config.minRebalanceAmount);
        }
    }

    function emergencyExit() external nonReentrant {
        RebalanceConfig memory config = userConfigs[msg.sender];
        require(config.emergencyExitEnabled, "Emergency exit not enabled");
        
        Position[] storage positions = userPositions[msg.sender];
        require(positions.length > 0, "No positions to exit");
        
        uint256 totalWithdrawn = 0;
        
        // Withdraw from all positions
        for (uint256 i = positions.length; i > 0; i--) {
            Position storage position = positions[i - 1];
            uint256 withdrawnAmount = _executeWithdraw(position.strategyId, position.amount);
            
            // Update TVL
            strategies[position.strategyId].tvl -= position.amount;
            totalValueLocked -= position.amount;
            totalWithdrawn += withdrawnAmount;
            
            // Remove position
            positions.pop();
        }
        
        // Transfer all USDC to user
        USDC.safeTransfer(msg.sender, totalWithdrawn);
        
        emit EmergencyExit(msg.sender, totalWithdrawn);
    }

    // Internal functions
    //
    // BUG FIX: The old implementation used keccak256(strategy.name) string comparison,
    // which silently does nothing if the name is not exactly "Aave" or "Compound".
    // Now uses the Protocol enum set at strategy registration time — much safer.
    function _executeDeposit(string memory _strategyId, uint256 _amount) internal {
        Strategy memory strategy = strategies[_strategyId];

        if (strategy.protocolType == Protocol.AAVE) {
            USDC.forceApprove(strategy.protocol, _amount);
            IAavePool(strategy.protocol).supply(address(USDC), _amount, address(this), 0);
        } else if (strategy.protocolType == Protocol.COMPOUND) {
            USDC.forceApprove(strategy.protocol, _amount);
            uint256 err = ICompoundCToken(strategy.protocol).mint(_amount);
            require(err == 0, "Compound: mint failed");
        } else {
            revert("Unknown protocol type");
        }
    }

    function _executeWithdraw(string memory _strategyId, uint256 _amount) internal returns (uint256) {
        Strategy memory strategy = strategies[_strategyId];

        if (strategy.protocolType == Protocol.AAVE) {
            return IAavePool(strategy.protocol).withdraw(address(USDC), _amount, address(this));
        } else if (strategy.protocolType == Protocol.COMPOUND) {
            // Compound's redeem() returns an error code, not an amount.
            // The redeemed USDC lands in this contract; return _amount as the received value.
            uint256 err = ICompoundCToken(strategy.protocol).redeem(_amount);
            require(err == 0, "Compound: redeem failed");
            return _amount;
        } else {
            revert("Unknown protocol type");
        }
    }

    function _executeRebalance(address _user, uint256 _fromPositionIndex, string memory _toStrategyId, uint256 _amount) internal {
        Position storage fromPosition = userPositions[_user][_fromPositionIndex];

        // Withdraw from old strategy
        uint256 withdrawnAmount = _executeWithdraw(fromPosition.strategyId, _amount);

        // Deposit to new strategy
        _executeDeposit(_toStrategyId, withdrawnAmount);

        // Update positions
        fromPosition.amount -= _amount;
        fromPosition.lastRebalance = block.timestamp;

        userPositions[_user].push(Position({
            strategyId: _toStrategyId,
            user: _user,
            amount: withdrawnAmount,
            shares: withdrawnAmount,
            entryTime: block.timestamp,
            lastRebalance: block.timestamp
        }));

        emit Rebalance(_user, fromPosition.strategyId, _toStrategyId, withdrawnAmount);
    }

    // BUG FIX: The old version returned an empty string "" if no strategy
    // was found, which caused a confusing "Strategy not active" revert downstream.
    // Now reverts explicitly with a clear message.
    function _getBestStrategy(uint256 /*_minAmount*/) internal view returns (string memory) {
        string memory bestStrategy;
        uint256 bestAPY = 0;
        bool found = false;

        for (uint256 i = 0; i < strategyIds.length; i++) {
            Strategy memory strategy = strategies[strategyIds[i]];
            if (strategy.isActive && strategy.currentAPY > bestAPY) {
                bestAPY = strategy.currentAPY;
                bestStrategy = strategyIds[i];
                found = true;
            }
        }

        require(found, "No active strategies available");
        return bestStrategy;
    }

    function _removePosition(address _user, uint256 _index) internal {
        Position[] storage positions = userPositions[_user];
        positions[_index] = positions[positions.length - 1];
        positions.pop();
    }

    // View functions
    function getUserPositions(address _user) external view returns (Position[] memory) {
        return userPositions[_user];
    }

    function getStrategyIds() external view returns (string[] memory) {
        return strategyIds;
    }

    function getPortfolioSummary(address _user) external view returns (
        uint256 totalValue,
        uint256 weightedAPY,
        uint256 positionCount
    ) {
        Position[] memory positions = userPositions[_user];
        totalValue = 0;
        weightedAPY = 0;
        positionCount = positions.length;
        
        for (uint256 i = 0; i < positions.length; i++) {
            totalValue += positions[i].amount;
            Strategy memory strategy = strategies[positions[i].strategyId];
            weightedAPY += (strategy.currentAPY * positions[i].amount);
        }
        
        if (totalValue > 0) {
            weightedAPY = weightedAPY / totalValue;
        }
    }
}
