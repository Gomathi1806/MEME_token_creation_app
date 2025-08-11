# TokenFactory Deployment Instructions

## REQUIRED: Deploy TokenFactory Contract Only

**You only need to deploy ONE contract: `TokenFactory.sol`**

❌ **DO NOT deploy**: SimpleTokenFactory.sol (it's just an alternative)
❌ **DO NOT deploy**: HybridLiquidityPool.sol (it's optional advanced features)
✅ **DEPLOY THIS**: TokenFactory.sol

## Constructor Parameters

The TokenFactory contract needs only **1 parameter**:

### Parameter:
- **`_platformWallet`** (address): Your wallet address to receive platform fees

### Example:
```
_platformWallet: 0x1234567890123456789012345678901234567890
```

## Step-by-Step Deployment:

### 1. In your deployment tool (Remix, Hardhat, etc.):
- Select **"TokenFactory"** contract (not SimpleTokenFactory or HybridLiquidityPool)
- Enter your wallet address as `_platformWallet`
- Deploy with some ETH for gas

### 2. After Deployment:
- Copy the deployed contract address
- Update `src/config/wagmi.ts`:
  ```typescript
  export const CONTRACTS = {
    TOKEN_FACTORY: '0xYOUR_DEPLOYED_ADDRESS_HERE',
    // ... other contracts (leave as is)
  }
  ```

### 3. Verify Contract:
- Verify on BaseScan with the same constructor parameter
- This makes your contract readable and trustworthy

## How It Works:

1. **Users call `createToken()`** with token details
2. **TokenFactory creates MemeToken** automatically
3. **Platform collects 0.001 ETH fee**
4. **Returns new token address**

## What You DON'T Need:

❌ **SimpleTokenFactory** - Just an alternative version
❌ **HybridLiquidityPool** - Advanced features (optional)
❌ **BadgeNFT** - Social features (optional)

## Test After Deployment:

1. Connect wallet to your app
2. Try creating a test token
3. Check if transaction succeeds
4. Verify token appears in dashboard

**That's it! Just deploy TokenFactory.sol and you're ready to go! 🚀**