# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@mockwallet.dev (or create a private security advisory on GitHub).

## Important Notice

⚠️ **Mock Wallet is designed for testing and development purposes only.**

### Security Considerations

1. **Not for Production Use**
   - This wallet is not audited for security
   - Private keys are stored in browser localStorage (insecure)
   - No encryption is applied to stored data

2. **Use Only with Test Networks**
   - Never use with real funds
   - Only use with testnet tokens
   - Do not use on Ethereum mainnet with valuable assets

3. **Data Storage**
   - All wallet data is stored locally in your browser
   - Data persists until you clear browser data
   - No server-side storage or backups

4. **Best Practices**
   - Generate new wallets for each test project
   - Clear browser data regularly
   - Never share seed phrases or private keys
   - Use separate wallets for mainnet testing

## Responsible Disclosure

We appreciate the security research community and believe that responsible disclosure of security vulnerabilities helps us ensure the security and privacy of our users.

If you believe you've found a security issue in our product, we encourage you to notify us. We welcome working with you to resolve the issue promptly.

## Acknowledgments

We would like to thank the following security researchers for their contributions:
- TBD

---

**Remember**: This is a development tool. Treat all keys and seeds as compromised. Never reuse them with real funds.
