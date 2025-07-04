// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./YieldVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YieldVaultFactory
 * @dev Factory contract for creating and managing YieldVault instances
 */
contract YieldVaultFactory is Ownable {
    // Events
    event VaultCreated(
        address indexed vault,
        address indexed asset,
        address indexed strategy,
        string name
    );
    event VaultStatusUpdated(address indexed vault, bool active);

    // State variables
    mapping(address => bool) public isVault;
    mapping(address => bool) public isActiveVault;
    address[] public allVaults;
    
    // Supported assets and strategies
    mapping(address => bool) public supportedAssets;
    mapping(address => bool) public supportedStrategies;
    
    // Default parameters
    struct VaultParams {
        uint256 managementFee; // basis points
        uint256 performanceFee; // basis points
        uint256 minDeposit;
        uint256 minWithdraw;
    }
    
    VaultParams public defaultParams = VaultParams({
        managementFee: 200,  // 2%
        performanceFee: 1000, // 10%
        minDeposit: 1e6,     // 1 USDC
        minWithdraw: 1e6     // 1 USDC
    });

    constructor() {}

    /**
     * @dev Create a new yield vault
     */
    function createVault(
        address asset,
        address strategy,
        string memory name
    ) external onlyOwner returns (address vault) {
        require(supportedAssets[asset], "Asset not supported");
        require(strategy == address(0) || supportedStrategies[strategy], "Strategy not supported");
        require(bytes(name).length > 0, "Name cannot be empty");

        // Deploy new vault
        vault = address(new YieldVault(asset, strategy, name));
        
        // Update registry
        isVault[vault] = true;
        isActiveVault[vault] = true;
        allVaults.push(vault);
        
        emit VaultCreated(vault, asset, strategy, name);
    }

    /**
     * @dev Add supported asset
     */
    function addSupportedAsset(address asset) external onlyOwner {
        require(asset != address(0), "Invalid asset address");
        supportedAssets[asset] = true;
    }

    /**
     * @dev Remove supported asset
     */
    function removeSupportedAsset(address asset) external onlyOwner {
        supportedAssets[asset] = false;
    }

    /**
     * @dev Add supported strategy
     */
    function addSupportedStrategy(address strategy) external onlyOwner {
        require(strategy != address(0), "Invalid strategy address");
        supportedStrategies[strategy] = true;
    }

    /**
     * @dev Remove supported strategy
     */
    function removeSupportedStrategy(address strategy) external onlyOwner {
        supportedStrategies[strategy] = false;
    }

    /**
     * @dev Set vault active status
     */
    function setVaultStatus(address vault, bool active) external onlyOwner {
        require(isVault[vault], "Not a valid vault");
        isActiveVault[vault] = active;
        emit VaultStatusUpdated(vault, active);
    }

    /**
     * @dev Update default parameters
     */
    function updateDefaultParams(
        uint256 managementFee,
        uint256 performanceFee,
        uint256 minDeposit,
        uint256 minWithdraw
    ) external onlyOwner {
        require(managementFee <= 2000, "Management fee too high"); // Max 20%
        require(performanceFee <= 2000, "Performance fee too high"); // Max 20%
        
        defaultParams = VaultParams({
            managementFee: managementFee,
            performanceFee: performanceFee,
            minDeposit: minDeposit,
            minWithdraw: minWithdraw
        });
    }

    /**
     * @dev Get all vaults
     */
    function getAllVaults() external view returns (address[] memory) {
        return allVaults;
    }

    /**
     * @dev Get active vaults
     */
    function getActiveVaults() external view returns (address[] memory activeVaults) {
        uint256 activeCount = 0;
        
        // Count active vaults
        for (uint256 i = 0; i < allVaults.length; i++) {
            if (isActiveVault[allVaults[i]]) {
                activeCount++;
            }
        }
        
        // Build active vaults array
        activeVaults = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allVaults.length; i++) {
            if (isActiveVault[allVaults[i]]) {
                activeVaults[index] = allVaults[i];
                index++;
            }
        }
    }

    /**
     * @dev Get vault count
     */
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @dev Get vault info
     */
    function getVaultInfo(address vault) external view returns (
        bool exists,
        bool active,
        address asset,
        address strategy,
        uint256 totalAssets,
        uint256 totalShares
    ) {
        if (!isVault[vault]) {
            return (false, false, address(0), address(0), 0, 0);
        }
        
        YieldVault vaultContract = YieldVault(vault);
        
        exists = true;
        active = isActiveVault[vault];
        asset = address(vaultContract.asset());
        strategy = vaultContract.strategy();
        totalAssets = vaultContract.totalAssets();
        totalShares = vaultContract.totalShares();
    }
}
