# Core Package

The `@meridianalgo/core` package provides the foundation for the MeridianAlgo framework, including the plugin system, configuration management, and logging.

## Framework Instance

The `Meridian` class is the central orchestrator of the framework. You can create an instance using the `createMeridian` factory function.

```typescript
import { createMeridian } from '@meridianalgo/core';

const meridian = createMeridian({
  logLevel: 'info'
});
```

## Plugin System

MeridianAlgo uses a modular architecture where functionality is added via plugins.

### Using Plugins

```typescript
import { indicatorsPlugin } from '@meridianalgo/indicators';

meridian.use(indicatorsPlugin);

console.log('Available indicators:', meridian.listIndicators());
```

### Creating a Plugin

You can extend the framework by creating your own plugins.

```typescript
import { MeridianPlugin, MeridianContext } from '@meridianalgo/core';

const myPlugin: MeridianPlugin = {
  id: 'my-custom-plugin',
  version: '1.0.0',
  init(ctx: MeridianContext) {
    ctx.logger.info('Initializing my custom plugin');
  },
  provides: {
    strategies: {
      'my-strategy': (params) => { /* ... */ }
    }
  }
};

meridian.use(myPlugin);
```

## Core Types

The package also defines standard interfaces used across the framework:

- `Bar`: Standard OHLCV bar representation.
- `Signal`: Entry/Exit signals for strategies.
- `Position`: Representation of an open or closed trade.
- `Order`: Order request structure.

## Configuration

The framework can be configured with:

- `logLevel`: 'debug' | 'info' | 'warn' | 'error'
- `env`: 'development' | 'production' | 'test'
- Custom parameters for specific plugins.

## Logging

A standardized logging interface is provided to all plugins through the `MeridianContext`.

```typescript
init(ctx: MeridianContext) {
  ctx.logger.debug('Debug info');
  ctx.logger.info('Status update');
  ctx.logger.warn('Potential issue');
  ctx.logger.error('Critical failure');
}
```
