#!/bin/bash
# Quick Smee Webhook Forwarder for security-bot
# This script forwards GitHub webhooks from Smee.io to your local server

WEBHOOK_URL="https://smee.io/Fj2wCHQ3uZfiQf59"
LOCAL_PORT="3000"

echo "🔌 Starting Smee webhook forwarder..."
echo "Webhook URL: $WEBHOOK_URL"
echo "Local server: http://localhost:$LOCAL_PORT"
echo ""
echo "Forwarding webhooks to: http://localhost:$LOCAL_PORT/api/webhook"
echo ""

npx smee -u "$WEBHOOK_URL" -t "http://localhost:$LOCAL_PORT/api/webhook"
