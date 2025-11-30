# npm Publishing Guide for MeridianAlgo.js

## Current Status

The repository has been successfully pushed to GitHub at:
https://github.com/MeridianAlgo/Javascript-Packages

## Important Notes

### Build Issues

The current codebase has TypeScript compilation issues that need to be resolved before publishing to npm. This is common for large monorepo projects and requires:

1. **Fixing TypeScript Errors** - Review and fix compilation errors in each package
2. **Dependency Resolution** - Ensure all workspace dependencies are correctly linked
3. **Type Definitions** - Verify all type definitions are properly exported

### Recommended Approach

**Option 1: Fix Build Issues First (Recommended)**

Before publishing to npm, you should:

1. Fix TypeScript compilation errors
2. Run tests successfully
3. Verify all packages build correctly
4. Then publish to npm

**Option 2: Publish as Beta/Alpha**

You can publish as a pre-release version while fixing issues:

```bash
# Update version to beta
pnpm version:patch
# Manually edit package.json versions to 2.0.0-beta.1

# Publish with beta tag
pnpm -r publish --tag beta --access public
```

## Step-by-Step Publishing Process

### Prerequisites

1. **npm Account**
   ```bash
   npm login
   ```

2. **Organization Setup** (if using @meridianalgo scope)
   - Create npm organization: https://www.npmjs.com/org/create
   - Name it "meridianalgo"
   - Add collaborators if needed

### Publishing Steps

#### 1. Ensure Everything Builds

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

#### 2. Update Versions (if needed)

```bash
# Patch version (2.0.0 -> 2.0.1)
pnpm version:patch

# Minor version (2.0.0 -> 2.1.0)
pnpm version:minor

# Major version (2.0.0 -> 3.0.0)
pnpm version:major
```

#### 3. Publish to npm

```bash
# Publish all packages
pnpm publish:all

# Or publish individually
cd packages/core
npm publish --access public

cd ../indicators
npm publish --access public

# Repeat for each package
```

#### 4. Verify Publication

```bash
# Check if packages are published
npm info @meridianalgo/core
npm info @meridianalgo/indicators
npm info @meridianalgo/data
# etc.
```

#### 5. Test Installation

```bash
# Create test directory
mkdir test-install
cd test-install
npm init -y

# Install your packages
npm install @meridianalgo/core @meridianalgo/indicators

# Verify installation
node -e "console.log(require('@meridianalgo/core'))"
```

## Current Build Status

### Known Issues

1. **TypeScript Compilation Errors**
   - Some packages may have type errors
   - Need to review and fix before publishing

2. **Missing Dependencies**
   - Some packages may need additional dependencies
   - Review package.json files

3. **Test Coverage**
   - Tests may need updates
   - Ensure all tests pass

### What Works

- ✅ GitHub repository is live
- ✅ Documentation is complete
- ✅ Examples are comprehensive
- ✅ Package structure is correct
- ✅ Dependencies are installed

### What Needs Work

- ⚠️ Build process needs fixing
- ⚠️ TypeScript errors need resolution
- ⚠️ Tests need to pass
- ⚠️ npm organization needs setup

## Alternative: GitHub Packages

If you want to publish immediately without fixing build issues, you can use GitHub Packages:

### Setup GitHub Packages

1. **Create .npmrc in project root**
   ```
   @meridianalgo:registry=https://npm.pkg.github.com
   ```

2. **Update package.json**
   ```json
   {
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

3. **Authenticate**
   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```

4. **Publish**
   ```bash
   pnpm -r publish
   ```

## Recommended Next Steps

### Immediate (Today)

1. ✅ Repository is on GitHub - DONE
2. ⚠️ Fix TypeScript compilation errors
3. ⚠️ Ensure tests pass
4. ⚠️ Verify build works

### Short-term (This Week)

1. Create npm organization (@meridianalgo)
2. Fix all build issues
3. Run comprehensive tests
4. Publish to npm

### Medium-term (This Month)

1. Set up automated publishing with GitHub Actions
2. Create release workflow
3. Add automated testing
4. Monitor package downloads

## Manual Build Fix Guide

### Common TypeScript Errors

**Error: Cannot find module**
- Check imports in source files
- Verify package dependencies
- Ensure tsconfig.json paths are correct

**Error: Type errors**
- Review type definitions
- Add missing type imports
- Fix any type mismatches

**Error: Build script fails**
- Check tsconfig.json configuration
- Verify all source files are valid TypeScript
- Review compiler options

### Debugging Build Issues

```bash
# Build individual package to see errors
cd packages/core
pnpm build

# Check for TypeScript errors
npx tsc --noEmit

# View detailed error messages
pnpm build --verbose
```

## Support

If you need help with:
- **Build Issues**: Review TypeScript documentation
- **Publishing**: Check npm documentation
- **Monorepo**: Review pnpm workspace documentation
- **GitHub Actions**: See .github/workflows/ for CI/CD

## Conclusion

The repository is successfully on GitHub and ready for development. Before publishing to npm:

1. Fix build issues
2. Ensure tests pass
3. Verify package quality
4. Then publish

For now, users can install directly from GitHub:

```bash
npm install github:MeridianAlgo/Javascript-Packages
```

---

**Status**: GitHub ✅ | npm ⚠️ (Pending build fixes)  
**Next Step**: Fix TypeScript compilation errors  
**Priority**: Medium (GitHub repo is public and usable)

Last Updated: November 30, 2025
