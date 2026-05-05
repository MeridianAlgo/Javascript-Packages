# MeridianAlgo CLI

The MeridianAlgo framework includes a Command Line Interface (CLI) for initializing projects and running common tasks.

## Installation

The CLI is available through the main package.

```bash
npm install -g meridianalgo
```

## Commands

### `init`
Initialize a new project with a basic template.

```bash
meridianalgo init my-trading-project
```

### `backtest`
Run a simple backtest from the command line.

```bash
meridianalgo backtest --symbol TSLA --start 2024-01-01 --strategy trend-following
```

*Note: The CLI is currently in early development. Many features require running example scripts directly.*
