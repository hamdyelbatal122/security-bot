'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function getPort() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (process.env.PORT) return String(process.env.PORT);

  if (fs.existsSync(envPath)) {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    if (parsed.PORT) return String(parsed.PORT);
  }

  return '3000';
}

function main() {
  const port = getPort();
  const url = `https://github.com/settings/apps/new?manifest_url=http://localhost:${port}/api/github/app-manifest`;

  console.log('GitHub App Connection URL');
  console.log('=========================');
  console.log(url);
  console.log('');
  console.log('Steps:');
  console.log('1) Start the bot with npm run server');
  console.log('2) Open the URL above in your browser');
  console.log('3) Create and install the app on your repository');
}

main();
