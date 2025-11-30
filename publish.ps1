# Quick Publish Script for MeridianAlgo.js
# This script helps you publish packages to npm

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "MeridianAlgo.js Publishing Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to npm
Write-Host "Checking npm authentication..." -ForegroundColor Yellow
$npmWhoami = npm whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to npm" -ForegroundColor Red
    Write-Host "Please run: npm login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in as: $npmWhoami" -ForegroundColor Green
Write-Host ""

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
pnpm clean
Write-Host "✅ Clean complete" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build all packages
Write-Host "Building all packages..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Ask for confirmation
Write-Host "Ready to publish all packages to npm" -ForegroundColor Cyan
Write-Host "This will publish 12 packages under @meridianalgo scope" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Do you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Publishing cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Publishing packages..." -ForegroundColor Yellow

# Publish all packages
pnpm -r publish --access public --no-git-checks

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✅ Successfully published all packages!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your packages are now available on npm:" -ForegroundColor Cyan
    Write-Host "  https://www.npmjs.com/package/@meridianalgo/core" -ForegroundColor White
    Write-Host "  https://www.npmjs.com/package/@meridianalgo/indicators" -ForegroundColor White
    Write-Host "  https://www.npmjs.com/package/@meridianalgo/data" -ForegroundColor White
    Write-Host "  ... and 9 more packages" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Create a GitHub release (v2.0.0)" -ForegroundColor White
    Write-Host "  2. Share on social media" -ForegroundColor White
    Write-Host "  3. Monitor for issues and feedback" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Publishing failed" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
