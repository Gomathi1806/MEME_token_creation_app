# MemeCoin Creator Toolkit - Base Network DApp

A comprehensive decentralized application for creating, launching, and managing meme coins on the Base network with just 3 clicks.

## Features

### Core Functionality
- **3-Click Token Creation**: Deploy ERC-20 tokens with automated minting, liquidity pool creation, and locking
- **Base Network Integration**: Built specifically for Base with optimized gas costs and fast transactions
- **Automated Verification**: Tokens are automatically verified on BaseScan
- **Liquidity Management**: Automatic LP creation and time-locked liquidity protection

### Advanced Features
- **AI-Powered Name Generator**: Smart meme name suggestions based on trending patterns
- **Social Badge NFTs**: Earn achievement badges as NFTs for successful launches and milestones
- **Telegram Bot Integration**: Create community management bots with price alerts and commands
- **Real-time Analytics**: Track token performance, holder counts, and trading volume
- **Responsive Design**: Beautiful, modern interface optimized for all devices

## Smart Contracts

### TokenFactory.sol
- Deploys new ERC-20 meme tokens
- Manages liquidity pool creation
- Handles token locking mechanisms
- Tracks creator statistics

### BadgeNFT.sol
- Mints achievement badges as NFTs
- Tracks user accomplishments
- Provides social proof for successful creators

## Setup Instructions

### Prerequisites
1. Node.js 18+ installed
2. MetaMask or compatible Web3 wallet
3. Base network added to your wallet
4. Test ETH on Base Sepolia (for testing)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd memecoin-creator-toolkit

# Install dependencies
npm install

# Start development server
npm run dev
```

### Smart Contract Deployment

1. **Deploy TokenFactory Contract**:
   ```bash
   # Deploy to Base Sepolia testnet first
   npx hardhat deploy --network base-sepolia --contract TokenFactory
   
   # Deploy to Base mainnet
   npx hardhat deploy --network base --contract TokenFactory
   ```

2. **Deploy BadgeNFT Contract**:
   ```bash
   npx hardhat deploy --network base-sepolia --contract BadgeNFT
   npx hardhat deploy --network base --contract BadgeNFT
   ```

3. **Update Contract Addresses**:
   - Update `src/config/wagmi.ts` with deployed contract addresses
   - Replace placeholder addresses in the `CONTRACTS` object

### Configuration

1. **WalletConnect Project ID**:
   - Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Update `projectId` in `src/config/wagmi.ts`

2. **Base Network Setup**:
   - The app is pre-configured for Base mainnet and Base Sepolia testnet
   - Ensure your wallet has Base network added

## Usage

### Creating a Token
1. Connect your wallet using the "Connect Wallet" button
2. Navigate to "Create Token" tab
3. Fill in token details (name, symbol, supply)
4. Add social links and branding
5. Set liquidity amount and lock period
6. Click "Deploy Token Now" and confirm transaction

### Managing Tokens
1. Go to "Dashboard" to view your created tokens
2. Monitor real-time statistics and performance
3. View contract addresses and transaction hashes
4. Access BaseScan links for detailed blockchain data

### Earning Badges
1. Visit "Social Badge NFTs" section
2. Complete achievements like creating tokens, reaching volume milestones
3. Mint earned badges as NFTs
4. Share your achievements on social media

### Telegram Integration
1. Go to "Telegram Bot" section
2. Create a new bot using @BotFather on Telegram
3. Configure bot features and commands
4. Deploy bot with automated price alerts and community management

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons

### Web3 Integration
- **Wagmi** for Ethereum interactions
- **Viem** for low-level blockchain operations
- **RainbowKit** for wallet connection
- **TanStack Query** for data fetching

### Smart Contracts
- **Solidity 0.8.19**
- **OpenZeppelin** contracts for security
- **Hardhat** for development and deployment

## Security Features

- **Reentrancy Protection**: All contracts use OpenZeppelin's ReentrancyGuard
- **Access Control**: Proper ownership and permission management
- **Liquidity Locking**: Automatic LP token locking prevents rug pulls
- **Input Validation**: Comprehensive validation on all user inputs

## Gas Optimization

- Optimized for Base network's low gas costs
- Efficient contract bytecode
- Batch operations where possible
- Minimal external calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.memecoin-toolkit.com](https://docs.memecoin-toolkit.com)
- Discord: [discord.gg/memecoin-toolkit](https://discord.gg/memecoin-toolkit)
- Twitter: [@MemeToolkit](https://twitter.com/MemeToolkit)

## Roadmap

- [ ] Advanced trading features
- [ ] Cross-chain deployment
- [ ] DAO governance integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard