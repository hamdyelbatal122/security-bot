# 🔧 Manual GitHub App Registration

If you want to manually register the GitHub App (instead of using the Probot flow), follow these steps:

---

## Quick Steps

### 1. Go to GitHub App Creation

1. GitHub → Your profile → Settings
2. Developer settings → GitHub Apps
3. "New GitHub App"

### 2. Fill in the Form

| Field | Value |
|-------|-------|
| **App name** | `security-bot-dev` or `your-username-security-bot` |
| **Homepage URL** | `https://github.com/hamdyelbatal122/security-bot` |
| **Webhook URL** | `https://smee.io/Fj2wCHQ3uZfiQf59` ← Your Smee URL |
| **Webhook secret** | Generate random string (save it!) |
| **Permissions** | See below |
| **Events** | `pull_request` |
| **Install location** | "Only on this account" |

### 3. Set Permissions

Under "Repository permissions":

- ✅ **Pull requests** → Read & write
- ✅ **Issues** → Read & write  
- ✅ **Contents** → Read
- ✅ **Administration** → Read & write

### 4. Subscribe to Events

✅ Check **Pull request**

### 5. Save & Get Credentials

After creating the app:

1. **Copy the App ID** → goes in `.env` as `APP_ID`
2. **Generate a private key** → Download and save as `./private-key.pem`
3. **Copy Webhook secret** → goes in `.env` as `WEBHOOK_SECRET`

### 6. Update `.env`

```bash
cp .env.example .env
```

Then edit `.env`:

```env
APP_ID=123456                          # Your app ID (numbers only)
WEBHOOK_SECRET=your_random_secret_here # String you generated
PRIVATE_KEY_PATH=./private-key.pem    # Path to your private key
WEBHOOK_PROXY_URL=https://smee.io/Fj2wCHQ3uZfiQf59  # Your Smee channel
PORT=3000
```

### 7. Install the App

On your app's page:

1. Click "Public page"
2. Click "Install"
3. Select "Only select repositories"
4. Choose a test repository (or create one)
5. Click "Install"

---

## Testing

See [QUICKSTART.md](QUICKSTART.md) for the full testing flow.

---

## Troubleshooting

### "Invalid webhook signature"
Your `WEBHOOK_SECRET` doesn't match. Re-check it on GitHub.

### "Unauthorized" errors
Your `APP_ID` or `PRIVATE_KEY_PATH` is wrong. Verify both.

### No webhooks received
- Confirm your Smee URL in app settings matches your `.env`
- Run: `npx smee -u YOUR_URL -t http://localhost:3000/api/webhook`
- Check Smee dashboard at your Smee URL

---

## Reference

- [GitHub Docs: Creating a GitHub App](https://docs.github.com/en/apps/creating-github-apps/creating-github-apps/creating-a-github-app)
- [GitHub Docs: Managing private keys for GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
