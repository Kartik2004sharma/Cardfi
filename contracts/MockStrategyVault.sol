// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockStrategyVault  
 * @dev A simplified vault for testing the DeFi app
 * This version includes real yield simulation and proper event emissions
 */
contract MockStrategyVault is ERC20, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset; // USDC token
    
    uint256 private _totalAssets; // Total USDC managed by vault
    uint256 public performanceFee = 1000; // 10% in basis points
    uint256 public managementFee = 200; // 2% annual in basis points
    uint256 public lastFeeCollection;
    uint256 public lastYieldUpdate;
    uint256 public currentAPY = 1200; // 12% APY in basis points
    
    uint256 public constant MAX_FEE = 2000; // 20% max fee
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

    // Events
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event YieldGenerated(uint256 amount, uint256 newAPY);
    event FeesCollected(uint256 performanceFees, uint256 managementFees);

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        asset = IERC20(_asset);
        lastFeeCollection = block.timestamp;
        lastYieldUpdate = block.timestamp;
    }

    // Main deposit function
    function deposit(uint256 _assets, address _receiver) external nonReentrant returns (uint256 shares) {
        require(_assets > 0, "Cannot deposit 0 assets");
        
        // Simulate yield generation and collect fees
        _simulateYield();
        _collectManagementFees();
        
        // Calculate shares to mint
        shares = previewDeposit(_assets);
        
        // Transfer assets from user
        asset.safeTransferFrom(msg.sender, address(this), _assets);
        
        // Mint shares to receiver
        _mint(_receiver, shares);
        
        // Update total assets
        _totalAssets += _assets;
        
        emit Deposit(msg.sender, _receiver, _assets, shares);
    }

    // Redeem shares for assets
    function redeem(
        uint256 _shares,
        address _receiver,
        address _owner
    ) external nonReentrant returns (uint256 assets) {
        require(_shares > 0, "Cannot redeem 0 shares");
        require(_shares <= maxRedeem(_owner), "Insufficient shares");
        
        // Simulate yield and collect fees
        _simulateYield();
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
        _totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.safeTransfer(_receiver, assets);
        
        emit Withdraw(msg.sender, _receiver, _owner, assets, _shares);
    }

    // Simulate yield generation (for demo purposes)
    function _simulateYield() internal {
        uint256 timePassed = block.timestamp - lastYieldUpdate;
        if (timePassed > 3600 && _totalAssets > 0) { // Generate yield every hour
            uint256 hourlyYield = (_totalAssets * currentAPY) / (BASIS_POINTS * 24 * 365);
            uint256 actualYield = (hourlyYield * timePassed) / 3600;
            
            if (actualYield > 0) {
                _totalAssets += actualYield;
                
                // Randomly vary APY between 8% and 15% for demo
                uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 700;
                currentAPY = 800 + randomFactor; // 8% to 15%
                
                emit YieldGenerated(actualYield, currentAPY);
            }
            
            lastYieldUpdate = block.timestamp;
        }
    }

    // Collect management fees
    function _collectManagementFees() internal {
        if (totalSupply() == 0) return;
        
        uint256 timePassed = block.timestamp - lastFeeCollection;
        if (timePassed == 0) return;
        
        uint256 annualFee = (_totalAssets * managementFee) / BASIS_POINTS;
        uint256 feeAmount = (annualFee * timePassed) / SECONDS_PER_YEAR;
        
        if (feeAmount > 0) {
            uint256 feeShares = (feeAmount * totalSupply()) / _totalAssets;
            _mint(owner(), feeShares);
            
            emit FeesCollected(0, feeAmount);
        }
        
        lastFeeCollection = block.timestamp;
    }

    // Manual yield generation for testing
    function generateYield() external {
        _simulateYield();
    }

    // View functions
    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }

    function convertToShares(uint256 _assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? _assets : (_assets * supply) / _totalAssets;
    }

    function convertToAssets(uint256 _shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        return supply == 0 ? _shares : (_shares * _totalAssets) / supply;
    }

    function previewDeposit(uint256 _assets) public view returns (uint256) {
        return convertToShares(_assets);
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

    function getCurrentAPY() external view returns (uint256) {
        return currentAPY;
    }

    function getShareValue() external view returns (uint256) {
        return convertToAssets(1e18);
    }

    function getVaultInfo() external view returns (
        uint256 totalAssetsResult,
        uint256 _totalSupply,
        uint256 _sharePrice,
        uint256 _currentAPY,
        uint256 _performanceFee,
        uint256 _managementFee
    ) {
        totalAssetsResult = _totalAssets;
        _totalSupply = totalSupply();
        _sharePrice = _totalSupply > 0 ? convertToAssets(1e18) : 1e18;
        _currentAPY = currentAPY;
        _performanceFee = performanceFee;
        _managementFee = managementFee;
    }

    // Admin functions
    function setFees(uint256 _performanceFee, uint256 _managementFee) external onlyOwner {
        require(_performanceFee <= MAX_FEE, "Performance fee too high");
        require(_managementFee <= MAX_FEE, "Management fee too high");
        
        _collectManagementFees();
        
        performanceFee = _performanceFee;
        managementFee = _managementFee;
    }

    function setAPY(uint256 _newAPY) external onlyOwner {
        currentAPY = _newAPY;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        asset.safeTransfer(owner(), balance);
        _totalAssets = 0;
    }
}
