// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// NOTE: YieldVault is a legacy contract kept for reference only.
// The active vault used in production is StrategyVault.sol.
// YieldVault.sol will be consolidated into StrategyVault.sol in a future cleanup.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title YieldVault
 * @dev Legacy vault — use StrategyVault for new deployments.
 */
contract YieldVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount, uint256 shares);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event FeesUpdated(uint256 managementFee, uint256 performanceFee);
    event Harvest(uint256 profit, uint256 fees);

    // State variables
    IERC20 public immutable asset; // USDC token
    address public strategy; // Current yield strategy
    
    uint256 public totalShares;
    mapping(address => uint256) public userShares;
    
    // Fee structure (basis points: 1% = 100 BP)
    uint256 public managementFee = 200; // 2% annual
    uint256 public performanceFee = 1000; // 10% on profits
    uint256 public constant MAX_FEE = 2000; // 20% max
    
    uint256 public lastHarvest;
    uint256 public totalProfit;
    
    // Minimum amounts
    uint256 public minDeposit = 1e6; // 1 USDC (6 decimals)
    uint256 public minWithdraw = 1e6; // 1 USDC

    constructor(
        address _asset,
        address _strategy,
        string memory _name
    ) Ownable(msg.sender) {
        asset = IERC20(_asset);
        strategy = _strategy;
        lastHarvest = block.timestamp;
    }

    /**
     * @dev Deposit USDC to earn yield
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= minDeposit, "Amount too small");
        require(amount > 0, "Cannot deposit 0");

        // Calculate shares to mint
        uint256 shares = totalShares == 0 ? amount : (amount * totalShares) / totalAssets();
        
        // Update state
        userShares[msg.sender] += shares;
        totalShares += shares;
        
        // Transfer USDC from user
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        // Deploy to strategy if available
        if (strategy != address(0) && asset.balanceOf(address(this)) > 0) {
            _deployToStrategy();
        }
        
        emit Deposit(msg.sender, amount, shares);
    }

    /**
     * @dev Withdraw USDC from vault
     */
    function withdraw(uint256 shares) public nonReentrant {
        require(shares > 0, "Cannot withdraw 0 shares");
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        
        // Calculate USDC amount
        uint256 amount = (shares * totalAssets()) / totalShares;
        require(amount >= minWithdraw, "Amount too small");
        
        // Update state
        userShares[msg.sender] -= shares;
        totalShares -= shares;
        
        // Withdraw from strategy if needed
        uint256 vaultBalance = asset.balanceOf(address(this));
        if (amount > vaultBalance && strategy != address(0)) {
            _withdrawFromStrategy(amount - vaultBalance);
        }
        
        // Transfer USDC to user
        asset.safeTransfer(msg.sender, amount);
        
        emit Withdraw(msg.sender, amount, shares);
    }

    /**
     * @dev Withdraw all user's shares
     */
    function withdrawAll() external {
        uint256 shares = userShares[msg.sender];
        require(shares > 0, "No shares to withdraw");
        withdraw(shares);
    }

    /**
     * @dev Get total assets under management
     */
    function totalAssets() public view returns (uint256) {
        uint256 vaultBalance = asset.balanceOf(address(this));
        uint256 strategyBalance = strategy != address(0) ? _getStrategyBalance() : 0;
        return vaultBalance + strategyBalance;
    }

    /**
     * @dev Get user's USDC balance
     */
    function balanceOf(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (userShares[user] * totalAssets()) / totalShares;
    }

    /**
     * @dev Get current APY (annual percentage yield)
     */
    function getCurrentAPY() external view returns (uint256) {
        if (strategy == address(0)) return 0;
        // This would call the strategy's APY function
        // For now, return a mock APY
        return 800; // 8% APY
    }

    /**
     * @dev Harvest profits from strategy
     */
    function harvest() external {
        require(strategy != address(0), "No strategy set");
        require(block.timestamp >= lastHarvest + 1 hours, "Too soon to harvest");
        
        uint256 balanceBefore = totalAssets();
        
        // Call strategy harvest (implementation depends on strategy)
        // IStrategy(strategy).harvest();
        
        uint256 balanceAfter = totalAssets();
        
        if (balanceAfter > balanceBefore) {
            uint256 profit = balanceAfter - balanceBefore;
            uint256 fees = (profit * performanceFee) / 10000;
            
            totalProfit += profit;
            lastHarvest = block.timestamp;
            
            emit Harvest(profit, fees);
        }
    }

    /**
     * @dev Deploy funds to strategy
     */
    function _deployToStrategy() internal {
        if (strategy == address(0)) return;
        
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.safeTransfer(strategy, balance);
            // IStrategy(strategy).deposit(balance);
        }
    }

    /**
     * @dev Withdraw funds from strategy
     */
    function _withdrawFromStrategy(uint256 amount) internal {
        if (strategy == address(0)) return;
        
        // IStrategy(strategy).withdraw(amount);
        // For now, assume strategy transfers back the funds
    }

    /**
     * @dev Get strategy balance
     */
    function _getStrategyBalance() internal view returns (uint256) {
        if (strategy == address(0)) return 0;
        // return IStrategy(strategy).balanceOf(address(this));
        // For now, assume strategy holds the balance
        return 0;
    }

    // Admin functions
    function setStrategy(address _strategy) external onlyOwner {
        address oldStrategy = strategy;
        strategy = _strategy;
        emit StrategyUpdated(oldStrategy, _strategy);
    }

    function setFees(uint256 _managementFee, uint256 _performanceFee) external onlyOwner {
        require(_managementFee <= MAX_FEE, "Management fee too high");
        require(_performanceFee <= MAX_FEE, "Performance fee too high");
        
        managementFee = _managementFee;
        performanceFee = _performanceFee;
        
        emit FeesUpdated(_managementFee, _performanceFee);
    }

    function setMinAmounts(uint256 _minDeposit, uint256 _minWithdraw) external onlyOwner {
        minDeposit = _minDeposit;
        minWithdraw = _minWithdraw;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency function to withdraw all funds from strategy
    function emergencyWithdraw() external onlyOwner {
        if (strategy != address(0)) {
            // IStrategy(strategy).emergencyWithdraw();
        }
    }
}
