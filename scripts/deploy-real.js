const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy Mock USDC
  console.log("\n1. Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  // 2. Deploy YieldManager
  console.log("\n2. Deploying YieldManager...");
  const YieldManager = await ethers.getContractFactory("YieldManager");
  const yieldManager = await YieldManager.deploy(usdcAddress);
  await yieldManager.waitForDeployment();
  const yieldManagerAddress = await yieldManager.getAddress();
  console.log("YieldManager deployed to:", yieldManagerAddress);

  // 3. Deploy StrategyVault (using YieldManager as strategy)
  console.log("\n3. Deploying StrategyVault...");
  const StrategyVault = await ethers.getContractFactory("StrategyVault");
  const vault = await StrategyVault.deploy(
    usdcAddress,
    "CardFi Yield Vault",
    "CFYV",
    yieldManagerAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("StrategyVault deployed to:", vaultAddress);

  // 4. Setup initial state
  console.log("\n4. Setting up initial state...");
  
  // Mint USDC to deployer
  const mintAmount = ethers.parseUnits("100000", 6);
  await usdc.mint(deployer.address, mintAmount);
  console.log("Minted 100,000 USDC to deployer");

  // Add a fake Aave strategy to YieldManager (we use the deployer address as a dummy pool for now)
  await yieldManager.addStrategy(
    "aave-usdc-sepolia",
    "Aave V3",
    deployer.address, // dummy pool
    usdcAddress, // dummy reward token
    500n, // 5% APY
    1000n, // max allocation
    1 // Protocol.AAVE
  );
  console.log("Added Aave V3 strategy to YieldManager");

  // Output to .env.local for frontend
  const envContent = `NEXT_PUBLIC_LOCAL_USDC_ADDRESS=${usdcAddress}
NEXT_PUBLIC_LOCAL_VAULT_ADDRESS=${vaultAddress}
NEXT_PUBLIC_LOCAL_YIELD_MANAGER_ADDRESS=${yieldManagerAddress}
NEXT_PUBLIC_DEMO_MODE=false
`;
  
  fs.writeFileSync(".env.local", envContent);
  console.log("\n=== .env.local created ===");
  console.log(envContent);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
