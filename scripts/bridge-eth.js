const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Bridging from Address:", signer.address);
  
  // Base Sepolia L1 Standard Bridge on Ethereum Sepolia
  const L1_BRIDGE_ADDRESS = "0x3154Cf16ccdb4C6d922629664174b904d80F2C35";
  
  // Amount to bridge: 0.1 ETH
  const bridgeAmount = ethers.parseEther("0.1");
  
  const abi = [
    "function bridgeETH(uint32 _minGasLimit, bytes calldata _extraData) external payable",
    "function depositETH(uint32 _minGasLimit, bytes calldata _extraData) external payable"
  ];
  
  const bridge = new ethers.Contract(L1_BRIDGE_ADDRESS, abi, signer);
  
  console.log("Initiating bridge of 0.1 Sepolia ETH to Base Sepolia...");
  console.log("Waiting for transaction confirmation...");
  
  // Some OP stacks use bridgeETH, some use depositETH. depositETH is the legacy standard, bridgeETH is the new standard. 
  // We'll use depositETH as it's universally backwards compatible for ETH.
  const tx = await bridge.depositETH(200000, "0x", { value: bridgeAmount });
  
  console.log("Transaction sent! Hash:", tx.hash);
  
  await tx.wait();
  console.log("Transaction confirmed on Sepolia!");
  console.log("NOTE: It will take ~3-5 minutes for the funds to appear on Base Sepolia.");
}

main().catch(console.error);
