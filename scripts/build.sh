#!/bin/bash

echo "🚀 Starting Amana Marketing Dashboard build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf dist
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build output available in .next directory"
echo "🌐 Ready for deployment!"