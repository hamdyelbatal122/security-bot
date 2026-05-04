# 🚀 Local Development & Testing Guide

This guide walks you through setting up **security-bot** for local development and testing with GitHub webhooks, following the [GitHub Apps Quickstart](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/quickstart).

---

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- Git
- GitHub account
- `smee-client` installed globally: `npm install -g smee-client`

---

## Step 1: Clone & Setup

```bash
git clone https://github.com/hamdyelbatal122/security-bot.git
cd security-bot

# Install dependencies
npm install
```

---

## Step 2: Create a Test Repository

Create a new repository on GitHub where you'll test the app:

1. Go to [github.com/new](https://github.com/new)
2. Create a repo: `security-bot-test` (or any name)
3. Initialize with a README
4. Note the URL for later

---

## Step 3: Register a GitHub App

### Option A: Quick Register (Recommended for Local Testing)

```bash
npm start
```

Then:
1. Open http://localhost:3000
2. Click "Register GitHub App"
3. Follow the prompts
4. Save your App ID and Webhook Secret

### Option B: Manual Registration

1. Go to GitHub → Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in:
   - **App name**: `security-bot-dev` (or similar)
   - **Homepage URL**: `https://github.com/hamdyelbatal122/security-bot`
   - **Webhook URL**: You'll set this in Step 4
   - **Webhook Secret**: Generate a random string (min 32 chars)
   - **Repository permissions**:
     - `pull_requests`: Read & write
     - `issues`: Read & write
     - `contents`: Read
   - **Subscribe to events**: Pull request
   - **Install location**: Only on this account

4. Generate a private key and download it
5. Copy the file to your project: `cp ~/Downloads/your-app-name*.pem ./private-key.pem`

---

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file:
   ```env
   APP_ID=YOUR_APP_ID                          # From GitHub App settings
   PRIVATE_KEY_PATH=./private-key.pem         # Path to your private key
   WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET         # Random string you created
   WEBHOOK_PROXY_URL=https://smee.io/Fj2wCHQ3uZfiQf59  # Your Smee channel
   PORT=3000
   ```

---

## Step 5: Install the App on Your Test Repository

1. Go to your app's settings page (GitHub → Settings → Developer settings → GitHub Apps → Your app)
2. Click "Public page"
3. Click "Install"
4. Select "Only select repositories"
5. Choose your test repo (`security-bot-test`)
6. Click "Install"

---

## Step 6: Start the Development Server

**Terminal 1** — Start the Smee forwarder:

```bash
npx smee -u https://smee.io/Fj2wCHQ3uZfiQf59 -t http://localhost:3000/api/webhook
```

You should see:
```
Forwarding https://smee.io/Fj2wCHQ3uZfiQf59 to http://localhost:3000/api/webhook
Connected https://smee.io/Fj2wCHQ3uZfiQf59
```

**Terminal 2** — Start the app server:

```bash
npm run server
```

You should see:
```
> security-bot@1.0.0 server
> npm start

> security-bot@1.0.0 start
> probot run ./index.js

security-bot is running 🚀
```

---

## Step 7: Test the App

1. Open your test repository
2. Create a new branch: `git checkout -b test-pr`
3. Add a test file with a security issue (e.g., hardcoded password):
   ```javascript
   // test.js
   const password = "super-secret-password-12345";
   ```

4. Commit and push:
   ```bash
   git add test.js
   git commit -m "test: add security issue"
   git push origin test-pr
   ```

5. Open a Pull Request in the web UI

### Verify It Works

**In Terminal 1 (Smee):**
You should see a `pull_request` event logged

**In Terminal 2 (App Server):**
You should see:
```
Scanning PR #1 in YOUR_USERNAME/security-bot-test
Found 1 security issue(s) in PR #1
```

**In Your PR:**
The app should post:
- ✅ Inline review comments on the affected line
- ✅ A summary comment with the security findings
- ✅ A label: `security:critical` or appropriate severity

---

## Step 8: Stop the Servers

Press `Ctrl+C` in both terminals to stop:
1. Smee forwarder
2. App server

---

## 🐛 Troubleshooting

### "Connection refused" on http://localhost:3000

The app server isn't running. Make sure you're running `npm run server` in Terminal 2.

### No webhook events in Smee

1. Verify `WEBHOOK_PROXY_URL` in `.env` is correct
2. Check the app's webhook settings on GitHub
3. The webhook URL on GitHub should be `https://smee.io/your-channel-id`

### "Invalid webhook signature"

Check that `WEBHOOK_SECRET` in `.env` matches the one in your GitHub App settings.

### Private key not found

Verify `PRIVATE_KEY_PATH` in `.env` points to the correct file (should be `./private-key.pem` in the project root).

### "Unauthorized" errors in logs

Your App ID or private key is incorrect. Re-check both in your `.env` file and GitHub App settings.

---

## 📝 Making Changes

While the servers are running:

1. Edit files (e.g., `src/security-scanner.js`)
2. If using `npm run dev`, the server auto-reloads
3. If using `npm run server`, you need to stop and restart

### Testing a New Security Rule

1. Add your rule to `src/security-scanner.js` in the `RULES` array
2. Create a test file in your PR with code matching your rule
3. Open/update the PR and watch for your new detection

---

## 🚀 Ready for Production?

See the [main README.md](README.md) for deployment options and best practices.

---

## 📚 Additional Resources

- [GitHub Apps Quickstart](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/quickstart)
- [Probot Documentation](https://probot.github.io)
- [Building GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/guides/building-a-github-app-that-responds-to-webhook-events)
- [Smee.io](https://smee.io)
