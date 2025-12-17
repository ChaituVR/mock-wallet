# Contributing to Mock Wallet

First off, thank you for considering contributing to Mock Wallet! 🎉

Mock Wallet is a community-driven project, and we welcome contributions from everyone. Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser and OS** information
- **Network** being used (Sepolia, Polygon, etc.)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why is this enhancement useful?
- **Proposed solution** - how should it work?
- **Alternatives considered**
- **Mockups** or examples if applicable

### 🚀 Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `bun install`
3. **Make your changes**
4. **Test your changes**: Ensure everything works
5. **Update documentation** if needed
6. **Commit with clear messages**: Use conventional commits
7. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Write clear, descriptive commit messages
- Update relevant documentation
- Add tests if applicable
- Ensure code follows existing style
- Reference related issues in PR description

### 📝 Improving Documentation

Documentation improvements are always welcome! This includes:

- README updates
- Code comments
- Usage examples
- API documentation
- Tutorials and guides

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) 1.0+ (recommended) or Node.js 18+
- Modern web browser
- Git

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mock-wallet.git
cd mock-wallet

# Install dependencies
bun install

# Start development server
bun dev

# Open http://localhost:3000
```

### Project Structure

```
mock-wallet/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with metadata
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── wallet/        # Wallet-specific components
├── lib/               # Utility functions and hooks
│   ├── wallet/        # Wallet logic
│   └── walletconnect/ # WalletConnect integration
└── public/            # Static assets
```

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Web3**: ethers.js v6
- **WalletConnect**: @reown/walletkit
- **UI**: Radix UI primitives

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use const over let where applicable

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement proper error boundaries

### Naming Conventions

- **Files**: kebab-case (e.g., `wallet-setup.tsx`)
- **Components**: PascalCase (e.g., `WalletSetup`)
- **Functions**: camelCase (e.g., `getBalance`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_CHAIN_ID`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add transaction history export
fix: resolve wallet connection issue
docs: update installation guide
style: format code with prettier
refactor: simplify account switching logic
test: add wallet creation tests
chore: update dependencies
```

## Testing

While we don't have automated tests yet (contributions welcome!), please manually test:

1. **Wallet creation** - Create new wallets
2. **Import functionality** - Private key, mnemonic, address
3. **Account switching** - Switch between accounts
4. **Network switching** - Test different chains
5. **WalletConnect** - Connect to test dApps
6. **Transaction signing** - Sign test transactions
7. **Balance updates** - Verify balances refresh

### Test Networks

Always test with testnets:
- Ethereum Sepolia
- Polygon Amoy
- Arbitrum Sepolia
- Optimism Sepolia
- Base Sepolia

Get test tokens from faucets:
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Polygon Faucet](https://faucet.polygon.technology)
- [Arbitrum Faucet](https://faucet.arbitrum.io)

## Areas for Contribution

### High Priority
- [ ] Automated tests (Jest, React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Error handling improvements

### Features
- [ ] Transaction simulation
- [ ] Gas estimation
- [ ] Token balance display
- [ ] ENS name resolution
- [ ] Multiple language support
- [ ] Dark/light theme toggle
- [ ] Export wallet data
- [ ] Import from Ledger/Trezor (view-only)

### Documentation
- [ ] Video tutorials
- [ ] API documentation
- [ ] Integration guides
- [ ] Troubleshooting guide
- [ ] FAQ section

### UI/UX
- [ ] Improved mobile experience
- [ ] Keyboard shortcuts
- [ ] Accessibility audit
- [ ] Animation improvements
- [ ] Loading states

## Getting Help

- 💬 **GitHub Discussions**: Ask questions and share ideas
- 🐛 **GitHub Issues**: Report bugs and request features
- 📧 **Email**: contact@mockwallet.dev
- 🐦 **Twitter**: [@mockwallet](https://twitter.com/mockwallet)

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in documentation
- Appreciated by the community! 🙏

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making Mock Wallet better! 🚀
