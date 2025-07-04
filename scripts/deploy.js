const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy Mock USDC first
  console.log("\n1. Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("Mock USDC deployed to:", await usdc.getAddress());

  // Deploy Mock Strategy Vault (simpler version)
  console.log("\n2. Deploying Mock Strategy Vault...");
  const MockStrategyVault = await ethers.getContractFactory("MockStrategyVault");
  const vault = await MockStrategyVault.deploy(
    await usdc.getAddress(),
    "CardFi Yield Vault",
    "CARDFI"
  );
  await vault.waitForDeployment();
  console.log("Mock Strategy Vault deployed to:", await vault.getAddress());

  // Setup initial state
  console.log("\n3. Setting up initial state...");
  
  // Mint some USDC to the deployer for testing
  const mintAmount = ethers.parseUnits("100000", 6); // 100,000 USDC
  await usdc.mint(deployer.address, mintAmount);
  console.log("Minted 100,000 USDC to deployer");

  // Add some initial liquidity to the vault for testing
  const initialDeposit = ethers.parseUnits("10000", 6); // 10,000 USDC
  await usdc.approve(await vault.getAddress(), initialDeposit);
  await vault.deposit(initialDeposit, deployer.address);
  console.log("Added 10,000 USDC initial liquidity to vault");

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("Mock USDC:", await usdc.getAddress());
  console.log("Mock Strategy Vault:", await vault.getAddress());
  
  console.log("\n=== Update your .env.local file ===");
  const networkName = (await ethers.provider.getNetwork()).name;
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log(`NEXT_PUBLIC_LOCAL_USDC_ADDRESS=${await usdc.getAddress()}`);
    console.log(`NEXT_PUBLIC_LOCAL_VAULT_ADDRESS=${await vault.getAddress()}`);
  } else {
    console.log(`NEXT_PUBLIC_${networkName.toUpperCase()}_USDC_ADDRESS=${await usdc.getAddress()}`);
    console.log(`NEXT_PUBLIC_${networkName.toUpperCase()}_VAULT_ADDRESS=${await vault.getAddress()}`);
  }

  console.log("\n=== Test the contracts ===");
  console.log("1. Start local node: npx hardhat node");
  console.log("2. Deploy: npx hardhat run scripts/deploy.js --network localhost");
  console.log("3. Add network to MetaMask: Chain ID 31337, RPC http://localhost:8545");
  console.log("4. Import test account to MetaMask using private key from hardhat node");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
