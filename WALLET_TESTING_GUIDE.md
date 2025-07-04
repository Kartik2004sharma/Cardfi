# 🦊 MetaMask Wallet Testing Guide

## Quick Test Instructions for Your CardFi Application

Your application is running at: **http://localhost:3001**

### 1. 🏠 Homepage Test
- Visit: `http://localhost:3001`
- Look for the "Connect Wallet" button in the navigation
- Click to connect your MetaMask wallet

### 2. 📊 Dashboard Test  
- Visit: `http://localhost:3001/dashboard`
- After connecting wallet, you should see:
  - ✅ Enhanced MetaMask status display
  - ✅ MetaMask Card dashboard (new feature)
  - ✅ Wallet balance information
  - ✅ Yield strategy overview

### 3. 🌉 Bridge Test (Enhanced LiFi + Circle CCTP v2)
- Visit: `http://localhost:3001/dashboard/bridge`
- Test the enhanced bridge features:
  - ✅ Circle CCTP v2 integration
  - ✅ Cross-chain USDC bridging
  - ✅ Real-time fee estimation
  - ✅ Optimized routing

### 4. 🔧 Integration Tester
- Look for the "Integration Tester" in the dashboard
- This shows the status of all enhanced services

## 🎯 What to Test

### MetaMask Connection
1. **Connect Wallet**: Click "Connect Wallet" in navigation
2. **Account Display**: Should show your wallet address when connected
3. **Network Switching**: Try switching networks in MetaMask
4. **Disconnect/Reconnect**: Test wallet disconnection

### Enhanced Features to Verify
1. **MetaMask Card Integration**:
   - Card activity tracking (demo data if no real card)
   - Spending patterns
   - Rewards tracking

2. **Enhanced Bridge**:
   - USDC bridge options
   - Fee estimation
   - Cross-chain routing
   - Circle CCTP v2 features

3. **Yield Optimization**:
   - Yield recommendations
   - Strategy suggestions
   - Multi-chain opportunities

## 🐛 Troubleshooting

### If Connection Fails:
- Check MetaMask is installed and unlocked
- Ensure you're on a supported network
- Try refreshing the page
- Check browser console for errors

### If Features Don't Load:
- The app includes demo mode fallbacks
- Circle API features will show demo data
- All UI components should still function

### Common Issues:
- **indexedDB errors**: These are WalletConnect warnings and won't affect functionality
- **API key errors**: Circle services will fall back to demo mode
- **Network issues**: Try switching to a different network in MetaMask

## ✅ Success Indicators

You should see:
- ✅ Wallet connects successfully
- ✅ Dashboard shows enhanced MetaMask features
- ✅ Bridge interface loads with Circle CCTP v2 options
- ✅ No critical errors in browser console
- ✅ All UI components render properly

## 🎉 Enhanced Features Now Available

Your application now includes:
- **Enhanced MetaMask SDK** with Card integration
- **Circle CCTP v2** for optimized USDC bridging
- **Advanced yield optimization** across multiple chains
- **Real-time bridge status tracking**
- **Demo mode fallbacks** for testing

Enjoy testing your enhanced CardFi application! 🚀
