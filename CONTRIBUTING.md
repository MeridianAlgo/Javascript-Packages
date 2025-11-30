# Contributing to MeridianAlgo

Thank you for your interest in contributing to MeridianAlgo! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/meridianalgo-js.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Building

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/indicators
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/indicators
pnpm test
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd packages/indicators
pnpm lint
```

## Code Style

- Use TypeScript for all code
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(indicators): add VWAP indicator

Implement Volume Weighted Average Price indicator with
configurable period and volume weighting.

Closes #123
```

## Pull Request Process

1. Update documentation for any API changes
2. Add tests for new functionality
3. Ensure all tests pass: `pnpm test`
4. Ensure code builds: `pnpm build`
5. Update CHANGELOG.md with your changes
6. Submit pull request with clear description

## Adding New Packages

1. Create package directory: `packages/new-package/`
2. Add `package.json` with proper dependencies
3. Add `tsconfig.json` extending base config
4. Implement functionality in `src/`
5. Export public API in `src/index.ts`
6. Add tests in `src/*.test.ts`
7. Update root workspace in `package.json`
8. Update documentation

## Testing Guidelines

- Write unit tests for all new functionality
- Aim for high test coverage
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

Example:
```typescript
describe('MyClass', () => {
  it('should calculate correctly', () => {
    const instance = new MyClass();
    const result = instance.calculate([1, 2, 3]);
    expect(result).toEqual([expected]);
  });

  it('should handle edge cases', () => {
    const instance = new MyClass();
    expect(() => instance.calculate([])).toThrow();
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Include code examples where appropriate
- Update API reference in docs/

## Questions?

- Check existing issues and discussions
- Open a new issue for bugs or feature requests
- Join our GitHub Discussions for questions

## Code of Conduct

- Be respectful and professional
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to MeridianAlgo!
