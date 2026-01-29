#!/bin/bash

echo "========================================="
echo "Production Build Script for satis.az"
echo "========================================="
echo ""

# Pull latest changes from git
echo "Pulling latest changes from git..."
git pull

if [ $? -ne 0 ]; then
    echo "WARNING: Git pull failed! Please resolve conflicts manually."
    exit 1
fi

echo "Git pull completed"
echo ""

# Clean old build
echo "Cleaning old build..."
rm -rf .next

# Clean and reinstall dependencies
echo "Cleaning node_modules..."
rm -rf node_modules

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "npm install failed!"
    exit 1
fi

# Run the production build
echo "Building production bundle..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Build completed successfully!"
echo ""

# Check if PM2 process exists and handle accordingly
echo "Checking PM2 processes..."
if pm2 list | grep -q "next.satis.az"; then
    echo "Restarting existing PM2 process..."
    pm2 restart next.satis.az
else
    echo "Starting new PM2 process on port 3033..."
    pm2 start npm --name next.satis.az -- start -- -p 3033
fi

# Save PM2 configuration
pm2 save

echo ""
echo "========================================="
echo "Production deployment complete!"
echo "Using API: https://api.satis.az"
echo "========================================="
echo ""
echo "Check status with: pm2 status next.satis.az"
echo "View logs with: pm2 logs next.satis.az"
echo ""
echo "Note: Clear nginx cache in WHM if users see old version"
