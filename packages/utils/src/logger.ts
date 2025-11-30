/**
 * Logging utilities
 */

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  traceId?: string;
  meta?: Record<string, unknown>;
  error?: Error;
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements Logger {
  constructor(
    private minLevel: 'debug' | 'info' | 'warn' | 'error' = 'info',
    private includeTimestamp: boolean = true
  ) {}
  
  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, meta);
    }
  }
  
  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.log('info', message, meta);
    }
  }
  
  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, meta);
    }
  }
  
  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      this.log('error', message, { ...meta, error: error?.message, stack: error?.stack });
    }
  }
  
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }
  
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>): void {
    const timestamp = this.includeTimestamp ? `[${new Date().toISOString()}] ` : '';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    
    const logMessage = `${timestamp}[${level.toUpperCase()}] ${message}${metaStr}`;
    
    switch (level) {
      case 'debug':
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }
}

/**
 * Structured logger with trace ID support
 */
export class StructuredLogger implements Logger {
  private entries: LogEntry[] = [];
  private traceId?: string;
  
  constructor(
    private minLevel: 'debug' | 'info' | 'warn' | 'error' = 'info',
    traceId?: string
  ) {
    this.traceId = traceId || this.generateTraceId();
  }
  
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }
  
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }
  
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }
  
  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, { ...meta, error: error?.message, stack: error?.stack }, error);
  }
  
  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      traceId: this.traceId,
      meta,
      error
    };
    
    this.entries.push(entry);
    
    // Also log to console
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${entry.timestamp.toISOString()}] [${level.toUpperCase()}] [${this.traceId}] ${message}${metaStr}`);
  }
  
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }
  
  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get all log entries
   */
  getEntries(): LogEntry[] {
    return [...this.entries];
  }
  
  /**
   * Clear log entries
   */
  clear(): void {
    this.entries = [];
  }
  
  /**
   * Get trace ID
   */
  getTraceId(): string {
    return this.traceId || '';
  }
}

/**
 * No-op logger (for testing or when logging is disabled)
 */
export class NoOpLogger implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

