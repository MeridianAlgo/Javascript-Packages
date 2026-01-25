/**
 * Configuration types for MeridianAlgo
 */

export interface MeridianConfig {
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile?: string;
  
  // Caching
  cache?: {
    type: 'memory' | 'redis' | 'disk';
    ttl?: number;
    maxSize?: number;
    redis?: { host: string; port: number; };
  };
  
  // Storage
  storage?: {
    type: 'sqlite' | 'postgres' | 'file';
    path?: string;
    connection?: string;
  };
  
  // Execution
  execution?: {
    mode: 'paper' | 'live';
    broker?: string;
    credentials?: Record<string, string>;
  };
  
  // Risk limits
  risk?: {
    maxPositions?: number;
    maxLeverage?: number;
    maxDrawdown?: number;
    maxPositionSize?: number;
  };
}
