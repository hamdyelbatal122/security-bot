# Security Bot

[![CI](https://github.com/hamdyelbatal122/security-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/hamdyelbatal122/security-bot/actions)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Security Bot is a GitHub App built with Probot that performs automated security review on pull request diffs.

It scans changed lines against OWASP-style risk patterns, publishes inline review comments with remediation advice, posts a summary report, and applies severity labels.

## Features

- Pull request scanning on opened, synchronize, and reopened events.
- Inline review comments on risky changed lines.
- Summary security report comment per pull request.
- Auto labels by severity: security:critical, security:high, security:medium, security:clean.
- Repository bootstrap automation on repository creation.
- Direct-push monitoring on the default branch for high and critical findings.

## Architecture

- Event handlers are defined in [index.js](index.js).
- Detection rules and reporting helpers are in [src/security-scanner.js](src/security-scanner.js).
- Repository automation and labeling are in [src/repo-automation.js](src/repo-automation.js).
- App permissions and subscribed events are declared in [app.yml](app.yml).

## Quick Start (Professional Setup)

1. Install dependencies.

```bash
npm install
```

2. Run the interactive setup wizard.

```bash
npm run setup
```

3. Validate local configuration.

```bash
npm run test:local
```

4. Start the bot.

```bash
npm run server
```

## Connect the Bot to Your GitHub Account

Use the GitHub App manifest flow to create and bind the app to your account quickly.

1. Start the bot.
2. Print the manifest URLs.

```bash
npm run connect:url
```

3. Open the Local URL in your browser.
4. Create the GitHub App from the manifest.
5. Install the app on your account and select the repository you want to test.

This eliminates repeated manual setup and keeps app configuration consistent with your codebase.

## Make Account Linking Easy for Other People

To let other GitHub users create their own app from your hosted bot instance, set APP_BASE_URL to your public bot URL.

Example in .env:

```env
APP_BASE_URL=https://security-bot.your-domain.com
```

Then run:

```bash
npm run connect:url
```

The command prints a Public (shareable) manifest URL. Share that URL with other users so they can create and install the app in their own accounts without manual variable copying.

## See What the Bot Does Locally

Run a local scan demo without GitHub webhooks.

```bash
npm run demo:scan
```

This command scans [test/vulnerable-example.js](test/vulnerable-example.js) and prints:

- Total findings.
- The pull request summary comment preview.
- A preview of inline review comments.

## End-to-End Real Test on GitHub

1. Ensure the app is installed on your repository.
2. Start webhook forwarding (if using Smee).

```bash
npx smee -u YOUR_SMEE_URL -t http://localhost:3000/api/webhook
```

3. Start Security Bot.

```bash
npm run server
```

4. Push a test branch with an intentionally risky line.

```bash
git checkout -b test/security-bot
echo 'const password = "super-secret-123";' > security-test.js
git add security-test.js
git commit -m "test: trigger security bot"
git push -u origin test/security-bot
```

5. Open a pull request and verify outcomes:

- Inline security comment appears on the changed line.
- Summary report comment is posted.
- Severity label is applied.

## Scripts

- npm run setup: Interactive environment setup wizard.
- npm run setup:quick: Setup and local configuration validation.
- npm run test:local: Validate required runtime environment values.
- npm run connect:url: Print the GitHub App manifest connection URL.
- npm run demo:scan: Run a local scanner demo against vulnerable fixture code.
- npm run server: Start Probot.
- npm run dev: Start with nodemon.
- npm run lint: Syntax checks for source and helper scripts.

## Troubleshooting

### Port is already in use

- Change PORT in .env.
- Re-run npm run server.

### Private key file not found

- Ensure PRIVATE_KEY_PATH points to a real .pem file.
- Run npm run test:local for immediate validation.

### Webhooks not arriving

- Ensure the GitHub App is installed on the target repository.
- Ensure your webhook forwarding URL is active and reachable.
- Ensure WEBHOOK_SECRET in .env matches your GitHub App webhook secret.

## License

MIT
