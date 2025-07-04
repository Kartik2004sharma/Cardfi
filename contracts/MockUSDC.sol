// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @dev A mock USDC token for testing purposes
 * This contract mimics the behavior of USDC with 6 decimals
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {
        // Mint initial supply to deployer (100M USDC)
        _mint(msg.sender, 100_000_000 * 10**6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function faucet() external {
        // Anyone can mint 1000 USDC for testing
        _mint(msg.sender, 1000 * 10**6);
    }

    function faucetCustom(uint256 amount) external {
        // Anyone can mint custom amount USDC for testing (max 100k)
        require(amount <= 100_000 * 10**6, "Amount too large");
        _mint(msg.sender, amount);
    }
}
