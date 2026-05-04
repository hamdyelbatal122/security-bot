'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  return dotenv.parse(fs.readFileSync(envPath));
}

function getPort(env) {
  if (process.env.PORT) return String(process.env.PORT);
  if (env.PORT) return String(env.PORT);
  return '3000';
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return '';
  return baseUrl.replace(/\/$/, '');
}

function buildManifestConnectUrl(baseUrl) {
  return `https://github.com/settings/apps/new?manifest_url=${baseUrl}/api/github/app-manifest`;
}

function main() {
  const env = loadEnvFile();
  const port = getPort(env);
  const localBaseUrl = `http://localhost:${port}`;
  const publicBaseUrl = normalizeBaseUrl(process.env.APP_BASE_URL || env.APP_BASE_URL || '');

  console.log('GitHub App Connection URLs');
  console.log('==========================');
  console.log('Local:');
  console.log(buildManifestConnectUrl(localBaseUrl));
  console.log('');

  if (publicBaseUrl) {
    console.log('Public (shareable):');
    console.log(buildManifestConnectUrl(publicBaseUrl));
    console.log('');
  }

  console.log('Steps:');
  console.log('1) Start the bot with npm run server');
  console.log('2) Open one URL above in your browser');
  console.log('3) Create and install the app on your repository');
  console.log('4) For other users, share only the Public URL (set APP_BASE_URL first)');
}

main();
