# HybridLiquidityPool Deployment Guide

## Contract Constructor Parameters

When deploying `HybridLiquidityPool.sol`, you need these 5 parameters:

### 1. `_token` (address)
- **Description**: The meme token contract address
- **Example**: `0x1234567890123456789012345678901234567890`
- **How to get**: Deploy your token first using TokenFactory, then use that address

### 2. `_baseToken` (address) 
- **Description**: The base token for trading pairs (usually WETH)
- **Base Mainnet WETH**: `0x4200000000000000000000000000000000000006`
- **Base Sepolia WETH**: `0x4200000000000000000000000000000000000006`

### 3. `_name` (string)
- **Description**: Name for the LP token
- **Example**: `"DOGE-ETH LP"`
- **Format**: `"[TOKEN_SYMBOL]-ETH LP"`

### 4. `_symbol` (string)
- **Description**: Symbol for the LP token  
- **Example**: `"DOGE-ETH-LP"`
- **Format**: `"[TOKEN_SYMBOL]-ETH-LP"`

### 5. `_lockPeriod` (uint256)
- **Description**: Lock period in seconds
- **Examples**:
  - 30 days: `2592000`
  - 90 days: `7776000` 
  - 180 days: `15552000`
  - 365 days: `31536000`

## Deployment Steps

### Step 1: Deploy Your Token First
```solidity
// Use TokenFactory to create your token
TokenFactory.createToken("DogeCoin", "DOGE", 1000000000, 1000000000000000000, 31536000)
```

### Step 2: Deploy HybridLiquidityPool
```solidity
// Constructor parameters example:
_token: 0x[YOUR_TOKEN_ADDRESS]           // From step 1
_baseToken: 0x4200000000000000000000000000000000000006  // WETH on Base
_name: "DOGE-ETH LP"                     // LP token name
_symbol: "DOGE-ETH-LP"                   // LP token symbol  
_lockPeriod: 31536000                    // 1 year in seconds
```

### Step 3: Update Contract Addresses
Add the deployed address to your `src/config/wagmi.ts`:

```typescript
export const CONTRACTS = {
  TOKEN_FACTORY: '0x[YOUR_TOKEN_FACTORY_ADDRESS]',
  BADGE_NFT: '0x[YOUR_BADGE_NFT_ADDRESS]', 
  HYBRID_LIQUIDITY_POOL: '0x[YOUR_HYBRID_POOL_ADDRESS]', // Add this
  // ... other addresses
} as const;
```

## Common Deployment Values

### For Testing (Base Sepolia):
- **Base Token**: `0x4200000000000000000000000000000000000006` (WETH)
- **Lock Period**: `2592000` (30 days)
- **Name**: `"TEST-ETH LP"`
- **Symbol**: `"TEST-ETH-LP"`

### For Production (Base Mainnet):
- **Base Token**: `0x4200000000000000000000000000000000000006` (WETH)  
- **Lock Period**: `31536000` (1 year)
- **Name**: `"[YOUR_TOKEN]-ETH LP"`
- **Symbol**: `"[YOUR_TOKEN]-ETH-LP"`

## Verification

After deployment, verify the contract on BaseScan with the same constructor parameters.

## Integration

Once deployed, the pool will automatically:
- ✅ Handle liquidity provision
- ✅ Execute swaps with dynamic pricing
- ✅ Apply social multipliers
- ✅ Implement bonding curves
- ✅ Lock liquidity for specified period