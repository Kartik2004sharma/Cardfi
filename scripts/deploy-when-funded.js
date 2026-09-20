const { ethers } = require("hardhat");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Monitoring Base Sepolia balance for:", signer.address);

  while (true) {
    const balance = await ethers.provider.getBalance(signer.address);
    if (balance > 0n) {
      console.log(`Funds arrived! Current balance: ${ethers.formatEther(balance)} ETH`);
      break;
    }
    console.log("Still waiting for bridge transfer... checking again in 15 seconds");
    await sleep(15000);
  }

  console.log("Proceeding with deployment...");
  // Now we run the deployment script logic natively here so we don't have to spawn a new process
  require("./deploy-real.js")();
}

main().catch(console.error);
