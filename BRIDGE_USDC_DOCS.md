# USDC Bridge Function - LiFi Integration

This document explains the `bridgeUSDC()` function that bridges USDC tokens from Ethereum Sepolia to Polygon Mumbai using the LiFi SDK.

## Overview

The function is located in `lib/integrations/lifi/bridge.ts` and provides a simple interface to bridge USDC between testnets.

## Function Signature

```typescript
async bridgeUSDC(signer: Signer, amount: string): Promise<{ txHash: string }>
```

### Parameters

- `signer`: An ethers.js Signer object (from wagmi)
- `amount`: Amount in USDC as a string (e.g., "1.0" for 1 USDC)

### Returns

- Promise that resolves to an object containing the transaction hash

## Token Addresses

- **Sepolia USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **Mumbai USDC**: `0x0FA8781a83E46826621b3BC094Ea2A0212e71B23`

## Chain IDs

- **Ethereum Sepolia**: `11155111`
- **Polygon Mumbai**: `80001`

## Usage Example

### In a React Component

```typescript
import { useAccount, useWalletClient } from 'wagmi'
import { lifiService } from '@/lib/integrations/lifi/bridge'

function BridgeComponent() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const handleBridge = async () => {
    if (!walletClient || !isConnected) return

    try {
      // Convert walletClient to ethers signer (simplified)
      const signer = {
        getAddress: async () => address,
        // Add other signer methods as needed
      } as any

      const result = await lifiService.bridgeUSDC(signer, "1.0")
      console.log('Bridge transaction:', result.txHash)
    } catch (error) {
      console.error('Bridge failed:', error)
    }
  }

  return (
    <button onClick={handleBridge}>
      Bridge 1 USDC
    </button>
  )
}
```

### Direct Usage

```typescript
import { lifiService } from '@/lib/integrations/lifi/bridge'

// Assuming you have a signer from wagmi
const bridgeResult = await lifiService.bridgeUSDC(signer, "5.0")
console.log('Transaction hash:', bridgeResult.txHash)
```

## How It Works

1. **Route Discovery**: Uses `lifi.getRoutes()` to find available bridging routes
2. **Route Execution**: Executes the best route using `lifi.executeRoute()`
3. **Chain Detection**: Automatically uses Sepolia (11155111) as source and Mumbai (80001) as destination
4. **Token Resolution**: Automatically resolves USDC addresses for both chains
5. **Amount Formatting**: Converts amount to proper decimals (USDC has 6 decimals)

## Error Handling

The function will throw errors in these cases:

- No routes found for bridging
- Invalid amount or signer
- Network connectivity issues
- Insufficient balance or allowance

## Prerequisites

1. **Wallet Connection**: User must have MetaMask or compatible wallet connected
2. **Network**: User should be on Ethereum Sepolia initially
3. **USDC Balance**: User must have sufficient USDC on Sepolia
4. **USDC Allowance**: User must approve USDC spending for the bridge contract

## Testing

Visit `/test-bridge` to see a working example of the bridge functionality.

## Dependencies

- `@lifi/sdk`: For cross-chain bridging
- `ethers`: For wallet integration
- `wagmi`: For wallet connection
- `viem`: For blockchain interactions

## Notes

- This function specifically bridges from Sepolia to Mumbai
- For other chain combinations, use the generic `getRoutes()` and `executeRoute()` methods
- The function uses a 3% slippage tolerance
- Bridge transactions may take several minutes to complete
- Always monitor transaction status using the returned transaction hash

## Example Bridge Scenarios

1. **Small Amount**: `bridgeUSDC(signer, "1.0")` - Bridge 1 USDC
2. **Large Amount**: `bridgeUSDC(signer, "100.0")` - Bridge 100 USDC
3. **Decimal Amount**: `bridgeUSDC(signer, "5.5")` - Bridge 5.5 USDC

## Chain Switching

The function will automatically handle chain switching if the user is not on Sepolia. Make sure your app's wagmi configuration includes both Sepolia and Mumbai networks.
