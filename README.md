# 🔐 Mock Wallet - Professional Web3 Developer Testing Tool

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **The ultimate Web3 development wallet for testing, debugging, and building decentralized applications. Feature-rich, multi-account support, and WalletConnect integration.**

## 🌟 Overview

Mock Wallet is a professional-grade Web3 testing wallet designed specifically for blockchain developers, dApp creators, and Web3 enthusiasts. Built with modern technologies and best practices, it provides a comprehensive suite of tools for testing Ethereum-based applications across multiple networks.

### 🎯 Perfect For

- **Blockchain Developers** - Test smart contracts and dApps efficiently
- **Web3 Developers** - Debug WalletConnect integrations seamlessly  
- **QA Engineers** - Perform comprehensive dApp testing
- **Smart Contract Auditors** - Analyze transaction flows
- **DeFi Developers** - Test protocol interactions safely
- **NFT Creators** - Verify minting and trading workflows
- **Educators** - Teach blockchain development concepts

## ✨ Key Features

### 🎨 Multi-Account Management
- **Unlimited Wallets** - Create and manage multiple test accounts
- **HD Wallet Support** - Hierarchical deterministic wallet generation
- **Account Switcher** - Switch between accounts instantly with drag-and-drop reordering
- **Address Impersonation** - View dApps as any Ethereum address without private keys
- **Watch-Only Mode** - Monitor addresses for portfolio tracking or UI testing
- **CSV Import/Export** - Bulk wallet management for teams

### 🔗 WalletConnect v2 Integration
- **Universal dApp Connection** - Connect to any WalletConnect-enabled dApp
- **Real-time Session Management** - Monitor active connections with session duration tracking
- **Agent Mode (Auto-Approve)** - Automatically approve all sessions and requests for CI/CD and E2E testing
- **WC URI Auto-Connect** - Pass `?wc=URI` to auto-pair with a dApp via URL parameter
- **Multi-session Support** - Connect to multiple dApps simultaneously
- **Request Signing** - Sign transactions, messages, and typed data
- **Export Request Logs** - Download WalletConnect request history as JSON for debugging
- **Disconnect All Sessions** - Bulk disconnect all active sessions with one click
- **Toast Notifications** - Real-time visual feedback for Agent Mode auto-approvals
- **Command Palette Integration** - Toggle Agent Mode via Cmd/Ctrl+K

### 🌐 Multi-Chain Support
- **Ethereum** (Mainnet & Sepolia Testnet)
- **Polygon** (Mainnet & Amoy Testnet)
- **Arbitrum** (One & Sepolia Testnet)
- **Optimism** (Mainnet & Sepolia Testnet)
- **Base** (Mainnet & Sepolia Testnet)
- **Custom RPC** Support for any EVM chain

### 🚀 Developer Features
- **URL Import** - Auto-import wallets via URL parameters
- **Transaction History** - Track all wallet interactions
- **Balance Monitoring** - Real-time balance updates
- **Network Switching** - Seamless chain transitions
- **Private Key Import** - Import from private keys or mnemonic phrases

### 🎨 User Experience
- **Brutalist Design** - Bold, functional interface
- **Dark Mode** - Easy on the eyes for long coding sessions
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Keyboard Shortcuts** - Efficient navigation
- **Progressive Web App** - Install as desktop/mobile app

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/ChaituVR/mock-wallet.git
cd mock-wallet

# Install dependencies
bun install

# Start development server
bun dev
```

Visit `http://localhost:3000` to see your wallet in action!

## 📖 Usage Guide

### Creating Your First Wallet

1. **Click "Create New Wallet"** - Generates a new HD wallet with seed phrase
2. **Save Your Seed Phrase** - Store it securely (for test purposes only)
3. **Start Testing** - Your wallet is ready to use!

### Importing a Wallet

```typescript
// Via URL (great for CI/CD)
https://mockwallet.dev/?pk=0x...&chainId=11155111&projectId=...

// Via Private Key
Import → Paste private key → Import

// Via Mnemonic
Import → Paste 12/24 word phrase → Import

// Watch-Only Mode
Import → Paste Ethereum address (0x...) → Import
```

### Connecting to dApps

1. **Set Reown Project ID** - Get free ID from [cloud.reown.com](https://cloud.reown.com)
2. **Copy WalletConnect URI** - From your dApp
3. **Paste in Mock Wallet** - Click "PAIR"
4. **Approve Connection** - Review and approve

### Multi-Account Testing

1. **Add Account** - Create additional accounts from same seed
2. **Import Different Wallets** - Mix multiple seed phrases
3. **Switch Accounts** - Click account dropdown, select account
4. **Drag to Reorder** - Organize accounts by dragging grip icon
5. **Auto-Switch** - Connected dApps update automatically

## 🏗️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Web3**: [ethers.js](https://docs.ethers.org) v6
- **WalletConnect**: [@reown/walletkit](https://docs.reown.com)
- **UI Components**: [Radix UI](https://www.radix-ui.com)
- **Runtime**: [Bun](https://bun.sh) (50x faster than npm)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)

## 🔒 Security

### For Testing Only

⚠️ **Important**: Mock Wallet is designed for **development and testing purposes only**. 

- Never use it with real funds or mainnet assets
- Private keys are stored in browser localStorage (insecure)
- No encryption or security hardening
- Not audited for production use

### Best Practices

✅ Use testnet tokens only
✅ Generate new wallets for each test project  
✅ Clear data regularly in browser settings
✅ Never share seed phrases or private keys
✅ Use separate wallets for mainnet testing

## 🌍 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 90+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## 📱 Mobile Support

Mock Wallet is fully responsive and works great on mobile devices:
- iOS Safari 14+
- Chrome Mobile 90+
- Firefox Mobile 90+

Install as PWA for native app experience!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app) by Vercel
- Inspired by the Web3 developer community
- Powered by [Reown](https://reown.com) (formerly WalletConnect)
- Design inspired by brutalist web design principles

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ChaituVR/mock-wallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ChaituVR/mock-wallet/discussions)
- **Twitter**: [@mockwallet](https://twitter.com/mockwallet)

## 🗺️ Roadmap

- [ ] Multi-signature wallet support
- [ ] Transaction simulation
- [ ] Gas optimization tools
- [ ] Custom token support
- [ ] ENS name resolution
- [ ] IPFS integration
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features

## ⭐ Star History

If you find Mock Wallet useful, please consider giving it a star on GitHub!

---

**Made with ❤️ for the Web3 community**

#web3 #ethereum #blockchain #wallet #developer-tools #walletconnect #testnet #dapp #smart-contracts #defi #nft #testing #development
