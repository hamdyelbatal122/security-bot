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

## 🚀 تشغيل المشروع

هذا القسم يحتوي كل ما تحتاجه لتشغيل البوت محلياً من الصفر، وربطه بـ GitHub App، ثم اختباره على Pull Request حقيقي.

### 1. المتطلبات

- Node.js `18+` أو `20+`
- `npm`
- حساب GitHub
- GitHub App على حسابك
- ملف private key بصيغة `.pem`
- قناة Smee للـ webhooks

التحقق من البيئة:

```bash
node -v
npm -v
```

### 2. تحميل المشروع

```bash
git clone https://github.com/hamdyelbatal122/security-bot.git
cd security-bot
npm install
```

### 3. إنشاء GitHub App

من GitHub افتح:

`Settings` → `Developer settings` → `GitHub Apps` → `New GitHub App`

املأ الحقول الأساسية كالتالي:

- `GitHub App name`: اسم فريد مثل `hamdy-security-bot`
- `Homepage URL`: `https://github.com/hamdyelbatal122/security-bot`
- `Webhook URL`: `https://smee.io/Fj2wCHQ3uZfiQf59`
- `Webhook secret`: قيمة سرية عشوائية تحفظها عندك
- `Where can this GitHub App be installed?`: `Only on this account`

الصلاحيات المطلوبة:

- `Contents`: `Read-only`
- `Pull requests`: `Read and write`
- `Issues`: `Read and write`
- `Checks`: `Read and write`
- `Administration`: `Read and write`
- `Metadata`: `Read-only`

الأحداث المطلوبة:

- `Pull request`
- `Push`
- `Repository`

بعد إنشاء الـ App:

1. انسخ `App ID`
2. اضغط `Generate a private key`
3. انقل ملف الـ `.pem` إلى جذر المشروع

مثال:

```bash
mv ~/Downloads/*.pem ./private-key.pem
```

### 4. إعداد ملف البيئة

أنشئ ملف `.env` من المثال:

```bash
cp .env.example .env
```

املأه بهذه القيم:

```env
APP_ID=123456
PRIVATE_KEY_PATH=./private-key.pem
WEBHOOK_SECRET=replace-with-your-secret
PORT=3000
WEBHOOK_PROXY_URL=https://smee.io/Fj2wCHQ3uZfiQf59
```

شرح المتغيرات:

- `APP_ID`: رقم الـ GitHub App
- `PRIVATE_KEY_PATH`: مسار ملف الـ private key الذي نزلته من GitHub
- `WEBHOOK_SECRET`: نفس القيمة التي وضعتها في إعدادات GitHub App
- `PORT`: المنفذ المحلي لتشغيل Probot
- `WEBHOOK_PROXY_URL`: قناة Smee لتحويل الـ webhooks إلى جهازك المحلي

### 5. تثبيت التطبيق على Repository

بعد إنشاء الـ GitHub App:

1. افتح صفحة الـ App
2. اختر `Install App`
3. اختر الحساب الخاص بك
4. اختر `Only select repositories`
5. اختر repository تريد تجربته عليه
6. أكمل التثبيت

### 6. تشغيل Smee و Probot

افتح نافذتين Terminal.

النافذة الأولى لتشغيل webhook forwarding:

```bash
npx smee -u https://smee.io/Fj2wCHQ3uZfiQf59 -t http://localhost:3000/api/webhook
```

المخرجات المتوقعة:

```text
Forwarding https://smee.io/Fj2wCHQ3uZfiQf59 to http://localhost:3000/api/webhook
Connected https://smee.io/Fj2wCHQ3uZfiQf59
```

النافذة الثانية لتشغيل البوت:

```bash
npm run server
```

المخرجات المتوقعة:

```text
security-bot is running
Listening on http://localhost:3000
```

إذا ظهر `setup mode` فهذا معناه أن واحداً من هذه القيم لم يتم ضبطه بشكل صحيح:

- `APP_ID`
- `PRIVATE_KEY_PATH`
- `WEBHOOK_SECRET`

### 7. اختبار البوت فعلياً

أنشئ repository تجريبي أو استخدم repository لديك ومثبت عليه الـ App، ثم:

```bash
git checkout -b test-security-bot
printf "const password = 'super-secret-123';\n" > test.js
git add test.js
git commit -m "test: trigger security scan"
git push origin test-security-bot
```

بعدها افتح Pull Request.

المفروض أن البوت يقوم بالآتي:

- يقرأ diff الخاص بالـ PR
- يكتشف الـ hardcoded secret
- يضيف inline review comment
- يضيف summary comment
- يضيف label مناسب مثل `security:critical`

### 8. أوامر التشغيل المهمة

```bash
# تشغيل السيرفر
npm run server

# تشغيل التطوير مع reload
npm run dev

# فحص syntax للملفات
npm run lint
```

### 9. المشاكل الشائعة

#### `Private key does not exists at path`

السبب:

- ملف الـ `.pem` غير موجود
- أو `PRIVATE_KEY_PATH` في `.env` غير صحيح

الحل:

```bash
ls -l ./private-key.pem
```

إذا لم يكن الملف موجوداً، نزّله من إعدادات الـ GitHub App ثم أعد تشغيل السيرفر.

#### `Port 3000 is already in use`

السبب:

- يوجد process أخرى تشغل نفس المنفذ

الحل:

```bash
PORT=3001 npm run server
```

وفي هذه الحالة شغّل Smee على نفس المنفذ:

```bash
npx smee -u https://smee.io/Fj2wCHQ3uZfiQf59 -t http://localhost:3001/api/webhook
```

#### لا تصل أي webhooks

راجع التالي:

- الـ App مثبت على نفس الـ repository
- `Webhook URL` في GitHub App هو نفس رابط Smee
- أمر Smee شغال فعلاً
- السيرفر المحلي شغال بدون errors

#### `Invalid webhook signature`

السبب:

- `WEBHOOK_SECRET` في `.env` لا يطابق GitHub App settings

الحل:

- حدّث القيمة في `.env`
- أعد تشغيل السيرفر

### 10. التشغيل في الإنتاج

للتشغيل على سيرفر حقيقي:

```bash
npm install
npm run lint
npm start
```

في الإنتاج لا تستخدم Smee. بدلاً من ذلك:

- اجعل `Webhook URL` يشير مباشرة إلى سيرفرك
- خزن القيم السرية في متغيرات بيئة آمنة
- لا ترفع ملف `.pem` إلى git نهائياً

الحد الأدنى المطلوب في الإنتاج:

```env
APP_ID=123456
PRIVATE_KEY_PATH=/absolute/path/to/private-key.pem
WEBHOOK_SECRET=replace-with-your-secret
PORT=3000
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
