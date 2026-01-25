# Developer Setup

This guide is for developers who want to build, test, or contribute to the MeridianAlgo source code.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **npm** or **pnpm** (preferred).

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/MeridianAlgo/Javascript-Packages.git
cd Javascript-Packages
pnpm install
```

## Build Process

MeridianAlgo is written in TypeScript. To compile the project to JavaScript:

```bash
pnpm run build
```

This will:
1. Clear the `dist` directory.
2. Compile TypeScript files using `tsc`.
3. Resolve path aliases using `tsc-alias`.

## Running Tests

We use **Jest** for all unit and integration tests.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

## Linting

To ensure code quality and consistency:

```bash
# Run ESLint
pnpm run lint

# Automatically fix linting issues
pnpm run lint:fix
```

## Running Examples

There are several built-in examples in the `examples/` directory to demonstrate functionality:

```bash
# Basic backtest demo
pnpm run example:basic

# Advanced features (ML, etc.)
pnpm run example:advanced

# Risk management demo
pnpm run example:risk
```

## Project Structure

- `src/`: Core library source code.
- `dist/`: Compiled JavaScript output.
- `examples/`: Reference implementations for users.
- `docs/`: Markdown-based documentation.
