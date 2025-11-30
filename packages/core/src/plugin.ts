/**
 * Plugin system for MeridianAlgo framework
 */

import { MeridianConfig } from './config';
import { Logger } from './logger';

// Plugin interface
export interface MeridianPlugin {
  id: string;
  version?: string;
  init?(ctx: MeridianContext): Promise<void> | void;
  provides: Partial<{
    dataAdapters: Record<string, any>;
    indicators: Record<string, any>;
    strategies: Record<string, any>;
    models: Record<string, any>;
    brokers: Record<string, any>;
    optimizers: Record<string, any>;
    visualizers: Record<string, any>;
  }>;
}

// Context passed to plugins
export interface MeridianContext {
  config: MeridianConfig;
  logger: Logger;
  cache?: any;
  storage?: any;
}

// Main framework class
export class Meridian {
  private plugins: Map<string, MeridianPlugin> = new Map();
  private dataAdapters: Map<string, any> = new Map();
  private indicators: Map<string, any> = new Map();
  private strategies: Map<string, any> = new Map();
  private models: Map<string, any> = new Map();
  private brokers: Map<string, any> = new Map();
  private optimizers: Map<string, any> = new Map();
  private visualizers: Map<string, any> = new Map();
  
  constructor(private config: MeridianConfig, private logger: Logger) {}
  
  use(plugin: MeridianPlugin): this {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }
    
    this.plugins.set(plugin.id, plugin);
    
    // Register provided capabilities
    if (plugin.provides.dataAdapters) {
      Object.entries(plugin.provides.dataAdapters).forEach(([id, adapter]) => {
        this.dataAdapters.set(id, adapter);
      });
    }
    
    if (plugin.provides.indicators) {
      Object.entries(plugin.provides.indicators).forEach(([id, indicator]) => {
        this.indicators.set(id, indicator);
      });
    }
    
    if (plugin.provides.strategies) {
      Object.entries(plugin.provides.strategies).forEach(([id, strategy]) => {
        this.strategies.set(id, strategy);
      });
    }
    
    if (plugin.provides.models) {
      Object.entries(plugin.provides.models).forEach(([id, model]) => {
        this.models.set(id, model);
      });
    }
    
    if (plugin.provides.brokers) {
      Object.entries(plugin.provides.brokers).forEach(([id, broker]) => {
        this.brokers.set(id, broker);
      });
    }
    
    if (plugin.provides.optimizers) {
      Object.entries(plugin.provides.optimizers).forEach(([id, optimizer]) => {
        this.optimizers.set(id, optimizer);
      });
    }
    
    if (plugin.provides.visualizers) {
      Object.entries(plugin.provides.visualizers).forEach(([id, visualizer]) => {
        this.visualizers.set(id, visualizer);
      });
    }
    
    // Initialize plugin
    if (plugin.init) {
      const ctx: MeridianContext = {
        config: this.config,
        logger: this.logger
      };
      plugin.init(ctx);
    }
    
    return this;
  }
  
  getDataAdapter(id: string): any {
    const adapter = this.dataAdapters.get(id);
    if (!adapter) {
      throw new Error(`Data adapter ${id} not found`);
    }
    return adapter;
  }
  
  getIndicator(id: string): any {
    const indicator = this.indicators.get(id);
    if (!indicator) {
      throw new Error(`Indicator ${id} not found`);
    }
    return indicator;
  }
  
  getStrategy(id: string): any {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error(`Strategy ${id} not found`);
    }
    return strategy;
  }
  
  getModel(id: string): any {
    const model = this.models.get(id);
    if (!model) {
      throw new Error(`Model ${id} not found`);
    }
    return model;
  }
  
  getBroker(id: string): any {
    const broker = this.brokers.get(id);
    if (!broker) {
      throw new Error(`Broker ${id} not found`);
    }
    return broker;
  }
  
  getOptimizer(id: string): any {
    const optimizer = this.optimizers.get(id);
    if (!optimizer) {
      throw new Error(`Optimizer ${id} not found`);
    }
    return optimizer;
  }
  
  getVisualizer(id: string): any {
    const visualizer = this.visualizers.get(id);
    if (!visualizer) {
      throw new Error(`Visualizer ${id} not found`);
    }
    return visualizer;
  }
  
  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
  
  listDataAdapters(): string[] {
    return Array.from(this.dataAdapters.keys());
  }
  
  listIndicators(): string[] {
    return Array.from(this.indicators.keys());
  }
  
  listStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Factory function
export function createMeridian(config?: Partial<MeridianConfig>): Meridian {
  const defaultConfig: MeridianConfig = {
    logLevel: 'info',
    ...config
  };
  
  const logger: Logger = {
    debug: (msg: string) => console.debug(msg),
    info: (msg: string) => console.info(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string) => console.error(msg)
  };
  
  return new Meridian(defaultConfig, logger);
}
