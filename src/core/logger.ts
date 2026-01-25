/**
 * Logger interface
 */

export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, meta?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, meta?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, meta?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, meta?: any): void;
}

export class ConsoleLogger implements Logger {
  constructor(private level: 'debug' | 'info' | 'warn' | 'error' = 'info') {}
  
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
      console.info(`[INFO] ${message}`, meta || '');
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
      console.warn(`[WARN] ${message}`, meta || '');
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-explicit-any
      console.error(`[ERROR] ${message}`, meta || '');
    }
  }
}
