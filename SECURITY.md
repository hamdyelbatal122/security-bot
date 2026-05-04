# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in security-bot, **please report it responsibly** by emailing [maintainer@example.com] instead of using the public issue tracker.

**Do NOT** open a public issue for security vulnerabilities. This allows us to patch the issue before attackers become aware of it.

### When Reporting

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

We will acknowledge your report within 48 hours and aim to provide updates every 5 days.

---

## Security Considerations for Users

### 1. Secure GitHub App Credentials

- **Private Key**: Store your private key securely. Never commit it to version control.
- **Webhook Secret**: Use a strong, random webhook secret (at least 32 characters).
- **Environment Variables**: Never hardcode credentials. Use `.env` files (not committed).

### 2. Permissions

Grant the minimum necessary permissions:

- ✅ `contents: read` — Read repository content
- ✅ `pull_requests: write` — Post PR reviews
- ✅ `issues: write` — Create and label issues
- ✅ `checks: write` — Post check runs
- ✅ `administration: write` — Manage branch protection
- ✅ `metadata: read` — Read repository metadata

Don't grant:
- ❌ `admin` scope (unless absolutely necessary)
- ❌ Access to secrets or environment variables

### 3. Webhook Security

- Always use **HTTPS** for webhook URLs
- Use a strong **webhook secret**
- GitHub will validate the `X-Hub-Signature-256` header — Probot does this automatically

### 4. Data Privacy

- The bot only reads code diffs, never stores them permanently
- Comments and labels are posted publicly on GitHub (visible to repo collaborators)
- No data is sent to external services

---

## Supported Versions

| Version | Supported          |
|---------|-------------------|
| 1.0.x   | ✅ (latest)       |
| < 1.0   | ❌ (unsupported)  |

---

## Dependencies

We regularly update dependencies to patch security vulnerabilities. Check:

- `npm audit` — Find vulnerabilities
- GitHub's **Dependabot** — Auto security updates

Run:
```bash
npm audit fix
```

---

## Best Practices for Deployment

1. **Use environment variables** for all secrets
2. **Enable GitHub Apps security features** (requiring code owner approval, etc.)
3. **Monitor logs** for errors or suspicious activity
4. **Keep Node.js updated** to the latest LTS version
5. **Review access logs** on your deployment platform regularly

---

## Contact

- 📧 Email: [maintainer@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/hamdyelbatal122/security-bot/issues)
- 📋 Discussions: [GitHub Discussions](https://github.com/hamdyelbatal122/security-bot/discussions)

---

Thank you for helping keep security-bot secure! 🔐
