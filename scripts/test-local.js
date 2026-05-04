'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ENV_PATH = path.join(process.cwd(), '.env');

function readEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('.env file is missing. Run npm run setup first.');
  }
  return dotenv.parse(fs.readFileSync(ENV_PATH));
}

function validateRequired(env) {
  const required = ['APP_ID', 'PRIVATE_KEY_PATH', 'WEBHOOK_SECRET'];
  const missing = required.filter((name) => !env[name] || !String(env[name]).trim());
  if (missing.length > 0) {
    throw new Error(`Missing required variables: ${missing.join(', ')}`);
  }
}

function validatePrivateKeyPath(env) {
  const configuredPath = env.PRIVATE_KEY_PATH;
  const absolutePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(process.cwd(), configuredPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Private key file not found at ${absolutePath}`);
  }
}

function main() {
  const env = readEnv();
  validateRequired(env);
  validatePrivateKeyPath(env);

  const port = env.PORT || '3000';
  console.log('Local configuration looks good.');
  console.log(`APP_ID: ${env.APP_ID}`);
  console.log(`PRIVATE_KEY_PATH: ${env.PRIVATE_KEY_PATH}`);
  console.log(`PORT: ${port}`);
  console.log(`APP_BASE_URL: ${env.APP_BASE_URL || 'not set'}`);
  console.log(`WEBHOOK_PROXY_URL: ${env.WEBHOOK_PROXY_URL || 'not set'}`);
  console.log('Run npm run server to start the bot.');
}

try {
  main();
} catch (error) {
  console.error(`Configuration check failed: ${error.message}`);
  process.exitCode = 1;
}
