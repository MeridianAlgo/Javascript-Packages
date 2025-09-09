# Contributing to MeridianAlgo.js

Thank you for your interest in contributing to MeridianAlgo.js! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 14.0.0)
- npm or yarn
- TypeScript knowledge
- Understanding of technical analysis concepts

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Javascript-Packages.git
   cd Javascript-Packages
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📋 Contribution Guidelines

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comprehensive JSDoc comments for all public functions
- Maintain consistent indentation (2 spaces)
- Use single quotes for strings
- Always end statements with semicolons

### Testing Requirements

- All new features must include comprehensive tests
- Maintain 100% test coverage
- Test edge cases and error conditions
- Use descriptive test names that explain the expected behavior

### Documentation Standards

- Update README.md for new features
- Add JSDoc comments for all public functions
- Include usage examples in documentation
- Update API documentation for breaking changes

## 🔧 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Implement your feature or fix
- Add comprehensive tests
- Update documentation
- Ensure all tests pass

### 3. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new technical indicator"
git commit -m "fix: resolve calculation error in RSI"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for new indicator"
```

### 4. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 📊 Adding New Indicators

### Indicator Structure

When adding new indicators, follow this structure:

```typescript
/**
 * Indicator Name
 * 
 * Brief description of what the indicator does and its use cases.
 * 
 * @param data - Array of price data (typically closing prices)
 * @param period - Number of periods for calculation
 * @param [optionalParam] - Optional parameter with default value
 * @returns Array of indicator values with same length as input data
 * 
 * @throws {IndicatorError} When data is invalid or period is invalid
 * 
 * @example
 * ```typescript
 * const prices = [100, 102, 101, 103, 105];
 * const result = Indicators.newIndicator(prices, 5);
 * console.log('New Indicator:', result);
 * ```
 * 
 * @see {@link https://example.com} Reference link if available
 */
static newIndicator(data: number[], period: number, optionalParam: number = 1): number[] {
  try {
    this._validateInput(data, period, 1);
    
    if (data.length < period) {
      return [];
    }
    
    const result: number[] = [];
    
    // Implementation here
    for (let i = period - 1; i < data.length; i++) {
      // Calculate indicator value
      const value = /* calculation */;
      result.push(value);
    }
    
    // Pad the beginning with NaN to match input length
    const padLength = data.length - result.length;
    return new Array(padLength).fill(NaN).concat(result);
    
  } catch (error) {
    if (error instanceof IndicatorError) throw error;
    throw new IndicatorError(`Error in New Indicator calculation: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

### Test Structure

```typescript
describe('New Indicator', () => {
  it('calculates correctly with valid data', () => {
    const result = Indicators.newIndicator(testData.prices, 5);
    
    expect(result).toHaveLength(testData.prices.length);
    expect(result[4]).toBeGreaterThanOrEqual(0);
  });

  it('handles insufficient data', () => {
    const shortData = [1, 2, 3];
    const result = Indicators.newIndicator(shortData, 5);
    
    expect(result).toEqual([]);
  });

  it('throws error for invalid input', () => {
    expect(() => {
      Indicators.newIndicator([], 5);
    }).toThrow(IndicatorError);
  });
});
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Expected Behavior** - What you expected to happen
4. **Actual Behavior** - What actually happened
5. **Environment** - Node.js version, OS, package version
6. **Code Sample** - Minimal code that reproduces the issue

## 💡 Feature Requests

When requesting features, please include:

1. **Use Case** - Why is this feature needed?
2. **Proposed Solution** - How should it work?
3. **Alternatives** - Other solutions you've considered
4. **Additional Context** - Any other relevant information

## 📚 Documentation Contributions

We welcome contributions to improve documentation:

- Fix typos and grammatical errors
- Improve code examples
- Add more use cases and examples
- Translate documentation to other languages
- Improve API documentation

## 🔍 Code Review Process

All submissions require review. We use GitHub pull requests for this purpose.

### Review Criteria

- **Functionality** - Does the code work as intended?
- **Testing** - Are there adequate tests?
- **Documentation** - Is the code well-documented?
- **Performance** - Is the code efficient?
- **Style** - Does it follow our coding standards?

### Review Process

1. Automated tests must pass
2. Code review by maintainers
3. Address feedback and make changes
4. Final approval and merge

## 🏷️ Release Process

We follow semantic versioning (SemVer):

- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release notes
4. Publish to npm
5. Create GitHub release

## 📞 Getting Help

If you need help:

- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - meridianalgo@gmail.com
- **Website** - https://meridianalgo.org

## 📄 License

By contributing to MeridianAlgo.js, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- GitHub contributors page

Thank you for contributing to MeridianAlgo.js! 🚀
