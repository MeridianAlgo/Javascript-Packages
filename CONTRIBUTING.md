# Contributing to MeridianAlgo

Thank you for your interest in contributing to MeridianAlgo! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/meridianalgo.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Building

```bash
# Build the package
pnpm build
```

### Testing

```bash
# Run all tests
pnpm test
```

### Linting

```bash
# Lint the source code
pnpm lint
```

## Adding New Features

1. Implement functionality in `src/` under the appropriate module (e.g., `src/indicators/`).
2. Export public API in `src/index.ts`.
3. Add tests in a `*.test.ts` file alongside your code.
4. Update documentation in the `docs/` folder.


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
