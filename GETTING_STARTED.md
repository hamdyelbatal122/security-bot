# ⚡ Get Started in 5 Minutes

The fastest way to test **security-bot** locally.

---

## 🚀 TL;DR

```bash
# 1. Setup
bash LOCAL_SETUP.sh

# 2. Configure .env with your app credentials
nano .env

# 3. Terminal 1: Start Smee forwarder
bash start-smee.sh

# 4. Terminal 2: Start app server
npm run server

# 5. Open a test PR and watch it scan! 🎉
```

---

## ❓ First Time?

### Option A: Auto-Setup (Recommended)

```bash
bash LOCAL_SETUP.sh
```

This will:
- ✅ Check for Node.js and smee-client
- ✅ Install dependencies  
- ✅ Create `.env` file
- ✅ Print next steps

Then follow the instructions it prints.

### Option B: Manual Steps

See [QUICKSTART.md](QUICKSTART.md) for the full guide.

---

## 📝 What You Need

1. **GitHub Account** (with the app installed)
2. **Test Repository** (create one if you don't have it)
3. **.env credentials**:
   - `APP_ID` — from GitHub App settings
   - `WEBHOOK_SECRET` — random string you created
   - `PRIVATE_KEY_PATH` — path to your private key PEM file

---

## 🧪 Test It

Create a test branch with a security issue:

```bash
cd /path/to/test-repo
git checkout -b test-security

# Create a file with a hardcoded password (to trigger SEC002)
echo "const password = 'super-secret-123';" > bad-code.js

git add bad-code.js
git commit -m "test: security issue"
git push origin test-security
```

Then:
1. Open a Pull Request in the web UI
2. Watch your server logs for: `Scanning PR #1...`
3. Check the PR for comments, labels, and inline reviews ✨

---

## 🛑 Stuck?

- **No webhook events?** → Check Smee URL in `.env` matches your app settings
- **"Unauthorized" errors?** → Re-check `APP_ID` and `PRIVATE_KEY_PATH`
- **Need details?** → See [QUICKSTART.md](QUICKSTART.md) or [REGISTER_APP.md](REGISTER_APP.md)

---

## 📚 Full Guides

- [QUICKSTART.md](QUICKSTART.md) — Complete setup guide
- [REGISTER_APP.md](REGISTER_APP.md) — Manual app registration
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to add features
- [README.md](README.md) — Feature overview

---

Enjoy! 🎉
