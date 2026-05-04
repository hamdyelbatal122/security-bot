#!/bin/bash
# Local Development Setup for security-bot
# Usage: bash LOCAL_SETUP.sh

echo "🚀 security-bot Local Setup"
echo "================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check smee-client
if ! command -v smee &> /dev/null; then
    echo "📦 Installing smee-client globally..."
    npm install -g smee-client
fi
echo "✅ smee-client is ready"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your GitHub App credentials:"
    echo "   - APP_ID"
    echo "   - WEBHOOK_SECRET"
    echo "   - PRIVATE_KEY_PATH"
else
    echo "✅ .env file exists"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env with your GitHub App credentials"
echo "2. Run: npm run server (in Terminal 1)"
echo "3. In another terminal, run: npx smee -u <YOUR_SMEE_URL> -t http://localhost:3000/api/webhook"
echo "4. Create a test PR in your test repository"
echo ""
echo "📖 For detailed instructions, see QUICKSTART.md"
