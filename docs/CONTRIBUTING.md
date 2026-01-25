# Contributing to MeridianAlgo

First off, thank you for considering contributing to MeridianAlgo! It's people like you that make MeridianAlgo such a great tool.

## How Can I Contribute?

### Reporting Bugs
- Use the **GitHub Issues** tab.
- Describe the bug in detail and provide a minimal code snippet to reproduce it.

### Suggesting Enhancements
- Open a GitHub Issue and label it as `enhancement`.
- Explain why the feature would be useful and how it should work.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. Install dependencies: `pnpm install`.
3. If you've added code that should be tested, add tests.
4. If you've changed APIs, update the documentation.
5. Ensure the test suite passes: `pnpm test`.
6. Make sure your code lints: `pnpm run lint`.
7. Submit the pull request.

## Style Guide

- We use **TypeScript** for everything.
- Follow the existing coding style (see `.eslintrc.js`).
- Use descriptive variable and function names.
- Document complex mathematical logic with JSDoc comments.

## Mathematical Contributions

If you are contributing a new quantitative indicator or model:
- Provide a reference to the mathematical paper or standard definition.
- Include unit tests with "gold standard" values (e.g., values verified against Python's `pandas-ta` or `statsmodels`).

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**.
