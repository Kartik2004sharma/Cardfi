const { ethers } = require("hardhat");

async function main() {
  const yieldManagerAddress = "0x113C2ebC0bC3701ed1312A7B2De01FE50F55acF9";
  const usdcAddress = "0xbB54f8Ede12cD317620238A81aD3a3f6D9042794";
  
  const [deployer] = await ethers.getSigners();
  const YieldManager = await ethers.getContractAt("YieldManager", yieldManagerAddress);
  
  console.log("Adding Aave V3 strategy...");
  const tx = await YieldManager.addStrategy(
    "aave-usdc-sepolia",
    "Aave V3",
    deployer.address, // dummy pool
    usdcAddress, 
    500n, 
    1000n, 
    1 
  );
  await tx.wait();
  console.log("Strategy added!");
}

main().catch(console.error);
