# 🔐 security-bot

A GitHub App built with [Probot](https://probot.github.io) that automatically scans every Pull Request for **OWASP Top 10** security vulnerabilities, posts inline review comments with actionable fixes, and manages repository setup.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔍 **Security Scanning** | Every PR is scanned for 14 security rules covering OWASP Top 10 |
| 💬 **Inline Comments** | Issues are flagged directly on the affected lines in the PR review |
| 🏷️ **Auto Labels** | PRs are labeled `security:critical`, `security:high`, `security:medium`, or `security:clean` |
| 🛡️ **Branch Protection** | New repositories get branch protection applied to `main`/`master` automatically |
| 📋 **Welcome Issues** | New repos receive a welcome issue explaining the workflow |
| 🚨 **Direct Push Alerts** | Direct pushes to the default branch with security issues trigger an alert issue |

---

## Security Rules

| Rule | Severity | Category | Description |
|------|----------|----------|-------------|
| SEC001 | 🟠 HIGH | Broken Access Control | Path traversal via unsanitized input |
| SEC002 | 🔴 CRITICAL | Cryptographic Failure | Hardcoded secret / API key |
| SEC003 | 🟠 HIGH | Cryptographic Failure | Weak hashing (MD5 / SHA1) |
| SEC004 | 🔴 CRITICAL | SQL Injection | Raw SQL with string interpolation |
| SEC005 | 🔴 CRITICAL | Command Injection | Shell execution with unsanitized input |
| SEC006 | 🟠 HIGH | XSS | Unescaped output written to HTML |
| SEC007 | 🟡 MEDIUM | Security Misconfiguration | Debug output left in code |
| SEC008 | 🟠 HIGH | Security Misconfiguration | SSL/TLS verification disabled |
| SEC009 | 🟠 HIGH | Weak Authentication | Insecure random number generation |
| SEC010 | 🟡 MEDIUM | Sensitive Data Exposure | Credentials potentially logged |
| SEC011 | 🔴 CRITICAL | Code Injection | `eval()` or `new Function()` usage |
| SEC012 | 🟠 HIGH | SSRF | Unvalidated URL passed to HTTP request |
| SEC013 | 🟠 HIGH | Insecure Deserialization | Unsafe object deserialization |
| SEC014 | 🔴 CRITICAL | NoSQL Injection | User input in MongoDB query operators |

---

## Setup

### 1. Create the GitHub App

Go to **GitHub → Settings → Developer settings → GitHub Apps → New GitHub App** and fill in:

- **Homepage URL**: `https://github.com/hamdyelbatal122/security-bot`
- **Webhook URL**: Your deployed app URL + `/api/github/webhooks`
- **Webhook Secret**: A strong random string
- Upload the `app.yml` contents as the app configuration

Or use the Probot manifest flow:

```bash
npm start
# Open http://localhost:3000 and click "Register GitHub App"
```

### 2. Configure environment

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

```env
APP_ID=your_app_id
PRIVATE_KEY_PATH=private-key.pem
WEBHOOK_SECRET=your_webhook_secret
```

### 3. Install & run

```bash
npm install
npm start
```

---

## Development

```bash
# Install dependencies
npm install

# Run with auto-reload
npm run dev
```

---

## License

[MIT](LICENSE)
