#!/bin/bash

# MeridianAlgo Setup Script

echo " Setting up MeridianAlgo..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
echo " Installing pnpm..."
npm install -g pnpm
fi

# Install dependencies
echo " Installing dependencies..."
pnpm install

# Build all packages
echo " Building all packages..."
pnpm build

# Run tests
echo " Running tests..."
pnpm test

echo " Setup complete!"
echo ""
echo "Next steps:"
echo " - Run examples: pnpm example:basic"
echo " - Read docs: cat docs/QUICK-START.md"
echo " - Start developing: pnpm dev"
