# 🔐 security-bot

[![CI](https://github.com/hamdyelbatal122/security-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/hamdyelbatal122/security-bot/actions)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub App](https://img.shields.io/badge/GitHub-App-blue)](https://docs.github.com/en/developers/apps)

> **Automated security code review for every Pull Request.** Scans for OWASP Top 10 vulnerabilities, posts inline review comments with actionable fixes, and applies severity labels — all hands-free.

**Built with [Probot](https://probot.github.io)** • **14 Security Rules** • **Zero Configuration** (mostly)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Scanning** | 14 OWASP Top 10 detection rules automatically scan every PR diff |
| 💬 **Inline Comments** | Issues flagged directly on the affected code lines with fix guidance |
| 🏷️ **Auto Labels** | PRs labeled by severity: `security:critical` 🔴 / `security:high` 🟠 / `security:medium` 🟡 / `security:clean` 🟢 |
| 🛡️ **Branch Protection** | New repos auto-configured with branch protection + required PR reviews |
| 📋 **Onboarding** | New repos get a welcome issue with workflow instructions |
| 🚨 **Push Alerts** | Direct pushes to main with critical/high issues trigger security alerts |
| 🚀 **Zero Config** | Just install the app — it handles everything automatically |

---

## 🚨 Security Rules

| Rule | Severity | Category | Pattern Detected |
|------|----------|----------|------------------|
| SEC001 | 🟠 HIGH | Broken Access Control | Path traversal (`../`, `..\\`) |
| SEC002 | 🔴 CRITICAL | Crypto Failure | Hardcoded secrets (password, API key, token) |
| SEC003 | 🟠 HIGH | Crypto Failure | Weak hashing (MD5, SHA1) |
| SEC004 | 🔴 CRITICAL | SQL Injection | String interpolation in SQL queries |
| SEC005 | 🔴 CRITICAL | Command Injection | Shell execution (`exec`, `system`, `eval`) |
| SEC006 | 🟠 HIGH | XSS | Unescaped HTML output (`innerHTML`, `outerHTML`) |
| SEC007 | 🟡 MEDIUM | Misc Config | Debug output (`var_dump`, `console.log`, `dd()`) |
| SEC008 | 🟠 HIGH | Misc Config | Disabled SSL verification |
| SEC009 | 🟠 HIGH | Weak Auth | Insecure RNG (`Math.random()`, `rand()`) |
| SEC010 | 🟡 MEDIUM | Data Exposure | Credentials in logs |
| SEC011 | 🔴 CRITICAL | Code Injection | `eval()` / `new Function()` |
| SEC012 | 🟠 HIGH | SSRF | Unvalidated HTTP requests |
| SEC013 | 🟠 HIGH | Deserialization | Unsafe object deserialization |
| SEC014 | 🔴 CRITICAL | NoSQL Injection | MongoDB operators in user input |

---

## 🚀 Quick Start

### 1️⃣ Install the App

1. Go to [GitHub App Marketplace](https://github.com/marketplace) or [create manually](https://github.com/settings/apps/new)
2. Select repositories to install on
3. Grant permissions (contents, pull_requests, issues, administration)
4. Done! The bot is now active.

### 2️⃣ Local Development

```bash
# Clone the repository
git clone https://github.com/hamdyelbatal122/security-bot.git
cd security-bot

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Fill in: APP_ID, WEBHOOK_SECRET, PRIVATE_KEY_PATH

# Start Smee forwarding in one terminal
npx smee -u https://smee.io/Fj2wCHQ3uZfiQf59 -t http://localhost:3000/api/webhook

# Start the app in another terminal
npm run server
```

If you have not generated and downloaded your GitHub App private key yet, Probot will enter setup mode at `http://localhost:3000`. Once the private key exists locally, restart the server.

### 3️⃣ Required Local Credentials

You need these three values from your GitHub App settings page:

- `APP_ID`
- `WEBHOOK_SECRET`
- `PRIVATE_KEY_PATH` pointing to your downloaded `.pem` file

Example:

```env
APP_ID=123456
WEBHOOK_SECRET=replace-with-your-secret
PRIVATE_KEY_PATH=./private-key.pem
WEBHOOK_PROXY_URL=https://smee.io/Fj2wCHQ3uZfiQf59
PORT=3000
```

### 4️⃣ Deployment

Deploy to **Heroku**, **Railway**, **Vercel**, or your own server:

```bash
# Using npm
npm install
npm start
```

Environment variables:
```env
APP_ID=                 # From GitHub App settings
PRIVATE_KEY_PATH=       # Path to your private-key.pem
WEBHOOK_SECRET=         # Your webhook secret
```

---

## 📋 How It Works

### Event Flow

```
GitHub Event
    ↓
Pull Request opened/synchronized/reopened
    ↓
Bot fetches file diffs
    ↓
Scan each line against 14 rules
    ↓
Post inline review comments
    ↓
Apply severity label
    ↓
Post summary comment
```

### Example Inline Comment

```
🔴 [SEC002] CRITICAL — Hardcoded secret, password, or API key detected

Category: Cryptographic Failure
Fix: Never hardcode credentials. Use environment variables or a secrets manager (e.g., .env, AWS Secrets Manager, Vault).
```

---

## ⚙️ Configuration

The app works **out of the box** with sensible defaults. To customize:

### Branch Protection Settings

Edit `src/repo-automation.js` → `BRANCH_PROTECTION`:

```javascript
const BRANCH_PROTECTION = {
  required_pull_request_reviews: {
    required_approving_review_count: 1,  // Change this
    dismiss_stale_reviews: true,
  },
  // ...
};
```

### Security Labels

Edit `src/repo-automation.js` → `LABELS` to customize colors and descriptions.

### Add Custom Rules

Edit `src/security-scanner.js` → `RULES` array:

```javascript
{
  id: 'SEC015',
  severity: 'HIGH',
  category: 'Your Category',
  description: 'What you're detecting',
  pattern: /your-regex-here/gi,
  advice: 'How to fix it',
},
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add new rule"`
4. Push and open a PR
5. All tests must pass

---

## 📄 License

[MIT License](LICENSE) — Created by [hamdyelbatal122](https://github.com/hamdyelbatal122)

---

## 🔗 Resources

- 📚 [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 🤖 [Probot Documentation](https://probot.github.io)
- 🔐 [GitHub App Security Best Practices](https://docs.github.com/en/developers/apps/building-github-apps/security-best-practices-for-github-apps)
- 📖 [GitHub REST API](https://docs.github.com/en/rest)

---

## 💡 FAQ

**Q: Does the bot modify my code?**  
A: No. It only posts comments and labels. It never modifies files.

**Q: Can I disable specific rules?**  
A: Not yet, but you can edit `src/security-scanner.js` to comment out rules.

**Q: What if I get false positives?**  
A: You can dismiss the review comment, and the bot won't object. If it's a recurring issue, open an issue or PR to improve the rule.

**Q: Can I use this on private repositories?**  
A: Yes! Install the app on private repos too.

**Q: Why do I get `Private key does not exists at path`?**  
A: Your `.env` points to `PRIVATE_KEY_PATH`, but the `.pem` file is not present yet. Generate a private key from your GitHub App settings, place it in the repo root, then restart `npm run server`.

---

## 📞 Support

- 🐛 [Report bugs](https://github.com/hamdyelbatal122/security-bot/issues)
- 💬 [Ask questions](https://github.com/hamdyelbatal122/security-bot/discussions)
- 🌟 Star this repo if you find it useful!
