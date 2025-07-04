// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StrategyVault
 * @dev A vault contract that represents shares in a specific DeFi strategy
 * Users deposit USDC and receive vault tokens representing their share
 */
contract StrategyVault is ERC20, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public immutable asset; // USDC token
    address public strategy; // Address of the strategy contract
    
    uint256 public totalAssets; // Total USDC managed by this vault
    uint256 public performanceFee; // Performance fee in basis points (100 = 1%)
    uint256 public managementFee; // Management fee in basis points (100 = 1%)
    uint256 public lastFeeCollection; // Timestamp of last fee collection
    
    uint256 public constant MAX_FEE = 2000; // 20% max fee
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    // Events
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event FeesUpdated(uint256 performanceFee, uint256 managementFee);
    event FeesCollected(uint256 performanceFees, uint256 managementFees);

    modifier onlyStrategy() {
        require(msg.sender == strategy, "Only strategy can call");
        _;
    }

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol,
        address _strategy
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        asset = IERC20(_asset);
        strategy = _strategy;
        performanceFee = 1000; // 10%
        managementFee = 200; // 2%
        lastFeeCollection = block.timestamp;
    }

    // Core vault functions
    function deposit(uint256 _assets, address _receiver) external nonReentrant returns (uint256 shares) {
        require(_assets > 0, "Cannot deposit 0 assets");
        
        // Collect management fees before calculating shares
        _collectManagementFees();
        
        // Calculate shares to mint
        shares = previewDeposit(_assets);
        
        // Transfer assets from user
        asset.safeTransferFrom(msg.sender, address(this), _assets);
        
        // Mint shares to receiver
        _mint(_receiver, shares);
        
        // Update total assets
        totalAssets += _assets;
        
        emit Deposit(msg.sender, _receiver, _assets, shares);
    }

    function withdraw(
        uint256 _assets,
        address _receiver,
        address _owner
    ) external nonReentrant returns (uint256 shares) {
        require(_assets > 0, "Cannot withdraw 0 assets");
        require(_assets <= maxWithdraw(_owner), "Insufficient assets");
        
        // Collect management fees before calculating shares
        _collectManagementFees();
        
        // Calculate shares to burn
        shares = previewWithdraw(_assets);
        
        // Check allowance if caller is not owner
        if (msg.sender != _owner) {
            uint256 currentAllowance = allowance(_owner, msg.sender);
            require(currentAllowance >= shares, "Insufficient allowance");
            _approve(_owner, msg.sender, currentAllowance - shares);
        }
        
        // Burn shares from owner
        _burn(_owner, shares);
        
        // Update total assets
        totalAssets -= _assets;
        
        // Transfer assets to receiver
        asset.safeTransfer(_receiver, _assets);
        
        emit Withdraw(msg.sender, _receiver, _owner, _assets, shares);
    }

    function redeem(
        uint256 _shares,
        address _receiver,
        address _owner
    ) external nonReentrant returns (uint256 assets) {
        require(_shares > 0, "Cannot redeem 0 shares");
        require(_shares <= maxRedeem(_owner), "Insufficient shares");
        
        // Collect management fees before calculating assets
        _collectManagementFees();
        
        // Calculate assets to withdraw
        assets = previewRedeem(_shares);
        
        // Check allowance if caller is not owner
        if (msg.sender != _owner) {
            uint256 currentAllowance = allowance(_owner, msg.sender);
            require(currentAllowance >= _shares, "Insufficient allowance");
            _approve(_owner, msg.sender, currentAllowance - _shares);
        }
        
        // Burn shares from owner
        _burn(_owner, _shares);
        
        // Update total assets
        totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.safeTransfer(_receiver, assets);
        
        emit Withdraw(msg.sender, _receiver, _owner, assets, _shares);
    }

    // Strategy functions
    function harvest() external onlyStrategy returns (uint256 profit) {
        uint256 balanceBefore = asset.balanceOf(address(this));
        
        // Strategy would call this after executing yield farming operations
        // and transferring profits back to the vault
        
        uint256 balanceAfter = asset.balanceOf(address(this));
        profit = balanceAfter - balanceBefore;
        
        if (profit > 0) {
            // Collect performance fees
            uint256 fees = (profit * performanceFee) / BASIS_POINTS;
            if (fees > 0) {
                asset.safeTransfer(owner(), fees);
                profit -= fees;
                emit FeesCollected(fees, 0);
            }
            
            totalAssets += profit;
        }
    }

    function reportLoss(uint256 _loss) external onlyStrategy {
        require(_loss <= totalAssets, "Loss exceeds total assets");
        totalAssets -= _loss;
    }

    // Fee management
    function setFees(uint256 _performanceFee, uint256 _managementFee) external onlyOwner {
        require(_performanceFee <= MAX_FEE, "Performance fee too high");
        require(_managementFee <= MAX_FEE, "Management fee too high");
        
        // Collect outstanding management fees before updating
        _collectManagementFees();
        
        performanceFee = _performanceFee;
        managementFee = _managementFee;
        
        emit FeesUpdated(_performanceFee, _managementFee);
    }

    function collectManagementFees() external {
        _collectManagementFees();
    }

    function _collectManagementFees() internal {
        if (totalSupply() == 0) return;
        
        uint256 timePassed = block.timestamp - lastFeeCollection;
        if (timePassed == 0) return;
        
        uint256 annualFee = (totalAssets * managementFee) / BASIS_POINTS;
        uint256 feeAmount = (annualFee * timePassed) / SECONDS_PER_YEAR;
        
        if (feeAmount > 0) {
            // Mint shares to owner representing fee
            uint256 feeShares = (feeAmount * totalSupply()) / totalAssets;
            _mint(owner(), feeShares);
            
            emit FeesCollected(0, feeAmount);
        }
        
        lastFeeCollection = block.timestamp;
    }

    // Admin functions
    function setStrategy(address _newStrategy) external onlyOwner {
        require(_newStrategy != address(0), "Invalid strategy address");
        
        address oldStrategy = strategy;
        strategy = _newStrategy;
        
        emit StrategyUpdated(oldStrategy, _newStrategy);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        asset.safeTransfer(owner(), balance);
        totalAssets = 0;
    }

    // View functions
    function getTotalAssets() external view returns (uint256) {
        return totalAssets;
    }

    function convertToShares(uint256 _assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? _assets : (_assets * supply) / totalAssets;
    }

    function convertToAssets(uint256 _shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? _shares : (_shares * totalAssets) / supply;
    }

    function previewDeposit(uint256 _assets) public view returns (uint256) {
        return convertToShares(_assets);
    }

    function previewWithdraw(uint256 _assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? _assets : ((_assets * supply) + totalAssets - 1) / totalAssets;
    }

    function previewRedeem(uint256 _shares) public view returns (uint256) {
        return convertToAssets(_shares);
    }

    function maxDeposit(address) public pure returns (uint256) {
        return type(uint256).max;
    }

    function maxWithdraw(address _owner) public view returns (uint256) {
        return convertToAssets(balanceOf(_owner));
    }

    function maxRedeem(address _owner) public view returns (uint256) {
        return balanceOf(_owner);
    }

    // APY calculation
    function getCurrentAPY() external view returns (uint256) {
        // This would typically integrate with external price feeds or oracles
        // to calculate the current APY based on recent performance
        
        // Simplified calculation - in production this would be more sophisticated
        uint256 timePassed = block.timestamp - lastFeeCollection;
        if (timePassed == 0 || totalSupply() == 0) return 0;
        
        // Mock APY calculation - replace with real yield data
        return 1200; // 12% APY in basis points
    }

    function getShareValue() external view returns (uint256) {
        return convertToAssets(1e18); // Value of 1 share in assets
    }

    function getVaultInfo() external view returns (
        uint256 _totalAssets,
        uint256 _totalSupply,
        uint256 _sharePrice,
        uint256 _currentAPY,
        uint256 _performanceFee,
        uint256 _managementFee
    ) {
        _totalAssets = totalAssets;
        _totalSupply = totalSupply();
        _sharePrice = _totalSupply > 0 ? convertToAssets(1e18) : 1e18;
        _currentAPY = this.getCurrentAPY();
        _performanceFee = performanceFee;
        _managementFee = managementFee;
    }
}
