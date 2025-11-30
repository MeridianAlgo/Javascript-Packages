# Publishing Guide for MeridianAlgo.js

This guide covers how to publish the MeridianAlgo packages to both npm and GitHub Packages.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **GitHub Account**: You need a GitHub account with this repository
3. **Authentication Tokens**: 
   - npm token for npm publishing
   - GitHub Personal Access Token (PAT) for GitHub Packages

## Publishing to npm

### Step 1: Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### Step 2: Build All Packages

```bash
pnpm build
```

This will compile all TypeScript packages to JavaScript in the `dist` folders.

### Step 3: Publish All Packages

```bash
pnpm publish:all
```

This will publish all packages under the `@meridianalgo` scope to npm.

### Step 4: Verify Publication

Visit your packages on npm:
- https://www.npmjs.com/package/@meridianalgo/core
- https://www.npmjs.com/package/@meridianalgo/indicators
- https://www.npmjs.com/package/@meridianalgo/data
- (and so on for all packages)

## Publishing to GitHub Packages

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `write:packages` - Upload packages to GitHub Package Registry
   - `read:packages` - Download packages from GitHub Package Registry
   - `delete:packages` - Delete packages from GitHub Package Registry
4. Generate and copy the token

### Step 2: Configure npm for GitHub Packages

Create or update `.npmrc` in your home directory (`~/.npmrc` or `C:\Users\YourName\.npmrc`):

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@meridianalgo:registry=https://npm.pkg.github.com
```

Replace `YOUR_GITHUB_TOKEN` with your actual token.

### Step 3: Update Package Names for GitHub

GitHub Packages requires the scope to match your GitHub username or organization. Update the root `.npmrc`:

```
@MeridianAlgo:registry=https://npm.pkg.github.com
```

### Step 4: Publish to GitHub Packages

```bash
# Build all packages
pnpm build

# Publish each package
pnpm -r publish --registry=https://npm.pkg.github.com --access=public
```

## Publishing to Both Registries

You can publish to both npm and GitHub Packages by running the commands sequentially:

```bash
# Build once
pnpm build

# Publish to npm
pnpm -r publish --registry=https://registry.npmjs.org/ --access=public

# Publish to GitHub Packages
pnpm -r publish --registry=https://npm.pkg.github.com --access=public
```

## Version Management

### Patch Version (Bug Fixes)

```bash
pnpm version:patch
```

This increments the patch version (2.0.0 → 2.0.1) for all packages.

### Minor Version (New Features)

```bash
pnpm version:minor
```

This increments the minor version (2.0.0 → 2.1.0) for all packages.

### Major Version (Breaking Changes)

```bash
pnpm version:major
```

This increments the major version (2.0.0 → 3.0.0) for all packages.

After updating versions, commit the changes and publish:

```bash
git add .
git commit -m "chore: bump version to X.Y.Z"
git push
pnpm build
pnpm publish:all
```

## Troubleshooting

### Error: "You must be logged in to publish packages"

Run `npm login` and enter your credentials.

### Error: "You do not have permission to publish"

Make sure you're logged in with the correct account and have access to the `@meridianalgo` scope.

### Error: "Package already exists"

You're trying to publish a version that already exists. Increment the version number first.

### Error: "ENEEDAUTH"

Your authentication token is missing or expired. Run `npm login` again or update your `.npmrc` file.

## Best Practices

1. **Always build before publishing**: Run `pnpm build` to ensure all packages are compiled
2. **Test before publishing**: Run `pnpm test` to ensure all tests pass
3. **Update CHANGELOG.md**: Document changes in each release
4. **Use semantic versioning**: Follow semver (major.minor.patch) conventions
5. **Tag releases on GitHub**: Create git tags for each release
6. **Write release notes**: Document what's new in each version

## GitHub Release Workflow

After publishing to npm:

1. Create a git tag:
```bash
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0
```

2. Create a GitHub Release:
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the tag you just created
   - Write release notes
   - Publish the release

## Automated Publishing with GitHub Actions

You can automate publishing using GitHub Actions. Create `.github/workflows/publish.yml`:

```yaml
name: Publish Packages

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      
      - run: pnpm -r publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add your npm token as a GitHub secret named `NPM_TOKEN`.

## Support

For issues with publishing:
- npm: https://docs.npmjs.com/
- GitHub Packages: https://docs.github.com/en/packages
- pnpm: https://pnpm.io/

---

**Last Updated**: November 30, 2025  
**Version**: 2.0.0
