'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const dotenv = require('dotenv');

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT, '.env.example');

function loadDefaults() {
  const base = {
    APP_ID: '',
    PRIVATE_KEY_PATH: './private-key.pem',
    WEBHOOK_SECRET: '',
    PORT: '3000',
    APP_BASE_URL: '',
    WEBHOOK_PROXY_URL: 'https://smee.io/new',
    GITHUB_CLIENT_ID: '',
    GITHUB_CLIENT_SECRET: '',
  };

  if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    const parsed = dotenv.parse(fs.readFileSync(ENV_EXAMPLE_PATH));
    Object.assign(base, parsed);
  }

  if (fs.existsSync(ENV_PATH)) {
    const parsed = dotenv.parse(fs.readFileSync(ENV_PATH));
    Object.assign(base, parsed);
  }

  return base;
}

function resolveKeyPath(privateKeyPath) {
  if (!privateKeyPath) return '';
  return path.isAbsolute(privateKeyPath)
    ? privateKeyPath
    : path.resolve(ROOT, privateKeyPath);
}

function ensureRelativePath(privateKeyPath) {
  if (!privateKeyPath) return './private-key.pem';
  if (path.isAbsolute(privateKeyPath)) return privateKeyPath;
  if (privateKeyPath.startsWith('./') || privateKeyPath.startsWith('../')) return privateKeyPath;
  return `./${privateKeyPath}`;
}

function generateWebhookSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function renderEnv(values) {
  const lines = [
    `APP_ID=${values.APP_ID}`,
    `PRIVATE_KEY_PATH=${values.PRIVATE_KEY_PATH}`,
    `WEBHOOK_SECRET=${values.WEBHOOK_SECRET}`,
    `PORT=${values.PORT}`,
    `APP_BASE_URL=${values.APP_BASE_URL}`,
    `WEBHOOK_PROXY_URL=${values.WEBHOOK_PROXY_URL}`,
  ];

  if (values.GITHUB_CLIENT_ID) lines.push(`GITHUB_CLIENT_ID=${values.GITHUB_CLIENT_ID}`);
  if (values.GITHUB_CLIENT_SECRET) lines.push(`GITHUB_CLIENT_SECRET=${values.GITHUB_CLIENT_SECRET}`);

  lines.push('');
  return lines.join('\n');
}

async function promptNonEmpty(rl, label, initialValue) {
  let value = initialValue || '';
  while (!value.trim()) {
    const answer = await rl.question(`${label}${initialValue ? ` [${initialValue}]` : ''}: `);
    value = (answer || initialValue || '').trim();
    if (!value) {
      output.write('This field is required.\n');
    }
  }
  return value;
}

async function run() {
  const defaults = loadDefaults();
  const rl = readline.createInterface({ input, output });

  try {
    output.write('\nSecurity Bot Setup Wizard\n');
    output.write('This wizard creates or updates your .env file for local development.\n\n');

    const appId = await promptNonEmpty(rl, 'GitHub App ID', defaults.APP_ID);

    const privateKeyRaw = await promptNonEmpty(
      rl,
      'Private key path (.pem)',
      defaults.PRIVATE_KEY_PATH || './private-key.pem'
    );
    const privateKeyPath = ensureRelativePath(privateKeyRaw);

    let webhookSecret = (await rl.question(
      `Webhook secret [press Enter to auto-generate]${defaults.WEBHOOK_SECRET ? ` (current: ${defaults.WEBHOOK_SECRET})` : ''}: `
    )).trim();
    if (!webhookSecret) {
      webhookSecret = defaults.WEBHOOK_SECRET || generateWebhookSecret();
      output.write('Generated webhook secret.\n');
    }

    const portInput = (await rl.question(`Port [${defaults.PORT || '3000'}]: `)).trim();
    const port = portInput || defaults.PORT || '3000';

    const appBaseUrl = (await rl.question(
      `Public app base URL for shareable install link (optional)${defaults.APP_BASE_URL ? ` [${defaults.APP_BASE_URL}]` : ''}: `
    )).trim() || defaults.APP_BASE_URL || '';

    const smeeInput = (await rl.question(
      `Smee webhook URL [${defaults.WEBHOOK_PROXY_URL || 'https://smee.io/new'}]: `
    )).trim();
    const webhookProxyUrl = smeeInput || defaults.WEBHOOK_PROXY_URL || 'https://smee.io/new';

    const oauthClientId = (await rl.question(
      `GitHub OAuth Client ID (optional)${defaults.GITHUB_CLIENT_ID ? ` [${defaults.GITHUB_CLIENT_ID}]` : ''}: `
    )).trim() || defaults.GITHUB_CLIENT_ID || '';

    const oauthClientSecret = (await rl.question(
      `GitHub OAuth Client Secret (optional)${defaults.GITHUB_CLIENT_SECRET ? ' [hidden]' : ''}: `
    )).trim() || defaults.GITHUB_CLIENT_SECRET || '';

    const absoluteKeyPath = resolveKeyPath(privateKeyPath);
    if (!fs.existsSync(absoluteKeyPath)) {
      output.write(`\nWarning: Private key file was not found at: ${absoluteKeyPath}\n`);
      output.write('The bot cannot start until this path is correct.\n\n');
    }

    const envContent = renderEnv({
      APP_ID: appId,
      PRIVATE_KEY_PATH: privateKeyPath,
      WEBHOOK_SECRET: webhookSecret,
      PORT: String(port),
      APP_BASE_URL: appBaseUrl,
      WEBHOOK_PROXY_URL: webhookProxyUrl,
      GITHUB_CLIENT_ID: oauthClientId,
      GITHUB_CLIENT_SECRET: oauthClientSecret,
    });

    fs.writeFileSync(ENV_PATH, envContent, 'utf8');

    output.write('\nSaved .env successfully.\n');
    output.write('Next step: run npm run test:local to validate startup and webhook connectivity.\n\n');
  } finally {
    rl.close();
  }
}

run().catch((error) => {
  console.error('Setup wizard failed:', error.message);
  process.exitCode = 1;
});
