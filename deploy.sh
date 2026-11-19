#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 GAON SE PRODUCTION VPS DEPLOYMENT SCRIPT"
echo "=========================================================="

# 1. Stop existing PM2 servers if running
echo "1. Stopping ongoing PM2 processes..."
pm2 stop all || true
pm2 delete all || true

# 2. Install dependencies for each server
echo "2. Installing production dependencies..."
cd userserver && npm install --omit=dev && cd ..
cd adminserver && npm install --omit=dev && cd ..
cd deliveryserver && npm install --omit=dev && cd ..
cd superadminserver && npm install --omit=dev && cd ..

# 3. Start all 4 servers via PM2 Ecosystem
echo "3. Starting all 4 servers via PM2 Ecosystem..."
pm2 start ecosystem.config.cjs

# 4. Save PM2 list so it restarts on VPS boot
pm2 save
pm2 startup || true

echo "=========================================================="
echo "✅ All 4 servers started successfully under PM2:"
echo "   - userserver        (Port 4000) -> https://api.gaonse.in"
echo "   - adminserver       (Port 5000) -> https://adminapi.gaonse.in"
echo "   - deliveryserver    (Port 4001) -> https://deliveryapi.gaonse.in"
echo "   - superadminserver  (Port 5001) -> https://superadmin.gaonse.in"
echo "=========================================================="
pm2 status
