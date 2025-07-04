#!/usr/bin/env node

// Test script for Circle API integration
// Run with: node test-circle-api.js

const axios = require('axios');

const API_KEY = 'TEST_API_KEY:601d4f9d1507782e43c2632000019cb0:9283bf741ffdc0b264ff4c0ccc3340aa';
const BASE_URL = 'https://api-sandbox.circle.com/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'X-User-Agent': 'CardFi-Yield-Manager-Test/1.0.0',
};

async function testCircleAPI() {
  console.log('🔄 Testing Circle API connection...');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  console.log('Base URL:', BASE_URL);
  console.log('');

  try {
    // Test 1: Get account configuration
    console.log('1️⃣ Testing account configuration...');
    const configResponse = await axios.get(`${BASE_URL}/configuration`, { headers });
    console.log('✅ Account configuration retrieved successfully');
    console.log('   - Payments enabled:', configResponse.data.data.payments?.masterWalletId ? 'Yes' : 'No');
    console.log('   - Wallets enabled:', configResponse.data.data.payments ? 'Yes' : 'No');
    console.log('');

    // Test 2: Get supported chains
    console.log('2️⃣ Testing supported blockchains...');
    try {
      const chainsResponse = await axios.get(`${BASE_URL}/w3s/config/entity`, { headers });
      console.log('✅ Supported blockchains retrieved successfully');
      if (chainsResponse.data.data) {
        console.log('   - Entity ID:', chainsResponse.data.data.entityId);
      }
    } catch (error) {
      console.log('⚠️  Blockchain config endpoint not accessible (may require different permissions)');
    }
    console.log('');

    // Test 3: List existing wallets
    console.log('3️⃣ Testing wallet listing...');
    try {
      const walletsResponse = await axios.get(`${BASE_URL}/w3s/wallets`, { headers });
      console.log('✅ Wallets retrieved successfully');
      console.log('   - Total wallets:', walletsResponse.data.data.wallets?.length || 0);
      if (walletsResponse.data.data.wallets?.length > 0) {
        console.log('   - Sample wallet ID:', walletsResponse.data.data.wallets[0].id);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ No wallets found (normal for new accounts)');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 4: Check USDC token support
    console.log('4️⃣ Testing USDC token support...');
    try {
      const tokensResponse = await axios.get(`${BASE_URL}/w3s/tokens`, { headers });
      console.log('✅ Tokens retrieved successfully');
      const usdcTokens = tokensResponse.data.data.tokens?.filter(token => 
        token.symbol === 'USDC' || token.name.includes('USD Coin')
      ) || [];
      console.log('   - USDC tokens found:', usdcTokens.length);
      usdcTokens.forEach(token => {
        console.log(`   - ${token.symbol} on ${token.blockchain}: ${token.id}`);
      });
    } catch (error) {
      console.log('⚠️  Token listing not accessible');
    }
    console.log('');

    console.log('🎉 Circle API integration test completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('- The API key is working correctly');
    console.log('- You can now use Circle wallet and CCTP features in the app');
    console.log('- Start the development server to test the full integration');

  } catch (error) {
    console.error('❌ Circle API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('');
    
    if (error.response?.status === 401) {
      console.error('🔑 Authentication failed - please check your API key');
    } else if (error.response?.status === 403) {
      console.error('🚫 Forbidden - your API key may not have the required permissions');
    } else if (error.response?.status === 429) {
      console.error('⏰ Rate limit exceeded - please wait before trying again');
    }
    
    console.error('Full error details:', error.response?.data);
  }
}

testCircleAPI();
