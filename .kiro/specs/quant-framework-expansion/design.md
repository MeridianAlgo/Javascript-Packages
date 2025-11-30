# Design Document

## Overview

This design document outlines the architecture for transforming meridianalgo-js from a technical indicators library into a comprehensive quantitative finance framework. The design follows a modular, plugin-based architecture that maintains backward compatibility while enabling extensive customization and scalability.

### Design Principles

1. **Modularity**: Each capability (data, indicators, strategies, backtesting, etc.) is a separate package
2. **Zero-dependency core**: Core indicators remain dependency-free for maximum portability
3. **Plugin architecture**: Extensible system for adding data sources, brokers, models, and visualizations
4. **Type safety**: Full TypeScript support with comprehensive type definitions
5. **Tree-shakeable**: Only bundle what you use
6. **Consistent API**: Unified interfaces across all modules
7. **Performance**: Vectorized operations, worker pools, and efficient data structures
8. **Testability**: Comprehensive test coverage with mocks for external services

## Architecture

### Monorepo Structure

```
meridianalgo-js/
├── packages/
│   ├── core/                 # Plugin system, types, config, lifecycle
│   ├── data/                 # Market data adapters, caching, normalization
│   ├── indicators/           # Technical indicators (existing + new)
│   ├── strategies/           # Strategy templates and composition
│   ├── backtest/             # Backtesting engines
│   ├── risk/                 # Risk metrics and stress testing
│   ├── portfolio/            # Portfolio optimization
│   ├── models/               # ML and time series models
│   ├── execution/            # Paper/live trading, broker adapters
│   ├── optimize/             # Parameter optimization
│   ├── visualize/            # Charts and dashboards
│   ├── metrics/              # Performance analytics
│   ├── pipeline/             # DAG orchestration, feature stores
│   ├── compliance/           # Audit trails, policies
│   ├── cli/                  # Command-line tools
│   └── utils/                # Math, stats, time utilities
├── apps/
│   ├── dashboard/            # React + Plotly realtime UI
│   └── notebooks/            # Example notebooks
├── examples/
├── docs/
├── pnpm-workspace.yaml
└── turbo.json
```


### Package Dependencies

```
core (no deps)
  ↓
utils (depends on: core)
  ↓
indicators (depends on: core, utils)
  ↓
data (depends on: core, utils)
  ↓
strategies (depends on: core, indicators, utils)
  ↓
backtest (depends on: core, data, strategies, utils)
  ↓
risk (depends on: core, utils)
portfolio (depends on: core, utils, risk)
models (depends on: core, utils)
execution (depends on: core, data, strategies)
optimize (depends on: core, backtest)
visualize (depends on: core, utils)
metrics (depends on: core, utils, risk)
pipeline (depends on: core, data, utils)
compliance (depends on: core, utils)
cli (depends on: all)
```

## Components and Interfaces

### 1. Core Package (@meridianalgo/core)

The core package provides the foundation for the entire framework.

#### Core Types

```typescript
// Bar data structure
export interface Bar {
  t: Date;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  symbol?: string;
}

// Time series data
export type Series = number[];

// Signal structure
export interface Signal {
  t: Date;
  value: number;  // -1 (sell), 0 (neutral), +1 (buy), or continuous
  strength?: number;
  meta?: Record<string, unknown>;
}

// Order types
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type TimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';

export interface Order {
  id?: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  price?: number;
  stopPrice?: number;
  tif?: TimeInForce;
  meta?: Record<string, unknown>;
}

// Fill structure
export interface Fill {
  orderId: string;
  symbol: string;
  qty: number;
  price: number;
  ts: Date;
  commission?: number;
}

// Position tracking
export interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

// Portfolio snapshot
export interface PortfolioSnapshot {
  ts: Date;
  equity: number;
  cash: number;
  positions: Record<string, Position>;
  leverage?: number;
}
```


#### Plugin System

```typescript
// Plugin interface
export interface MeridianPlugin {
  id: string;
  version?: string;
  init?(ctx: MeridianContext): Promise<void> | void;
  provides: Partial<{
    dataAdapters: Record<string, DataAdapter>;
    indicators: Record<string, IndicatorFn>;
    strategies: Record<string, StrategyFactory>;
    models: Record<string, ModelFactory>;
    brokers: Record<string, BrokerAdapter>;
    optimizers: Record<string, Optimizer>;
    visualizers: Record<string, Visualizer>;
  }>;
}

// Context passed to plugins
export interface MeridianContext {
  config: MeridianConfig;
  logger: Logger;
  cache?: CacheAdapter;
  storage?: StorageAdapter;
}

// Main framework class
export class Meridian {
  private plugins: Map<string, MeridianPlugin> = new Map();
  private dataAdapters: Map<string, DataAdapter> = new Map();
  private indicators: Map<string, IndicatorFn> = new Map();
  private strategies: Map<string, StrategyFactory> = new Map();
  private models: Map<string, ModelFactory> = new Map();
  private brokers: Map<string, BrokerAdapter> = new Map();
  
  use(plugin: MeridianPlugin): this;
  getDataAdapter(id: string): DataAdapter;
  getIndicator(id: string): IndicatorFn;
  getStrategy(id: string): StrategyFactory;
  getModel(id: string): ModelFactory;
  getBroker(id: string): BrokerAdapter;
}

// Factory function
export function createMeridian(config?: Partial<MeridianConfig>): Meridian;
```

#### Configuration

```typescript
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
```

### 2. Data Package (@meridianalgo/data)

Handles data ingestion, caching, and normalization.

#### Data Adapter Interface

```typescript
export interface DataAdapter {
  id: string;
  
  // Fetch OHLCV data
  ohlcv(
    symbol: string,
    options: {
      start: Date | string;
      end: Date | string;
      interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
    }
  ): Promise<Bar[]>;
  
  // Fetch real-time quote
  quote?(symbol: string): Promise<Quote>;
  
  // Subscribe to real-time stream
  stream?(
    symbols: string[],
    callback: (bar: Bar) => void
  ): StreamSubscription;
  
  // Fetch symbol metadata
  metadata?(symbol: string): Promise<SymbolMetadata>;
}

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  ts: Date;
}

export interface SymbolMetadata {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  avgVolume?: number;
}

export interface StreamSubscription {
  unsubscribe(): void;
}
```


#### Data Manager

```typescript
export class DataManager {
  constructor(
    private adapters: Map<string, DataAdapter>,
    private cache?: CacheAdapter
  ) {}
  
  // Fetch data with automatic caching
  async fetch(
    adapter: string,
    symbol: string,
    options: FetchOptions
  ): Promise<Bar[]>;
  
  // Normalize data (handle splits, dividends)
  normalize(bars: Bar[], adjustments: CorporateAction[]): Bar[];
  
  // Detect and fill gaps
  fillGaps(bars: Bar[], method: 'forward' | 'backward' | 'interpolate'): Bar[];
  
  // Quality checks
  validateQuality(bars: Bar[]): QualityReport;
}

export interface CorporateAction {
  date: Date;
  type: 'split' | 'dividend';
  ratio?: number;
  amount?: number;
}

export interface QualityReport {
  duplicates: number;
  gaps: number;
  outliers: number;
  issues: Array<{ index: number; reason: string }>;
}
```

#### Adapter Implementations

Each adapter wraps an external library:

- **YahooAdapter**: Wraps `yahoo-finance2`
- **PolygonAdapter**: Wraps `@polygon.io/client-js`
- **AlphaVantageAdapter**: Wraps `alphavantage`
- **BinanceAdapter**: Wraps `binance-api-node`
- **CoinbaseAdapter**: Wraps `coinbase-pro`
- **AlpacaAdapter**: Wraps `@alpacahq/alpaca-trade-api`

### 3. Indicators Package (@meridianalgo/indicators)

Extends existing indicators with advanced capabilities.

#### Indicator Function Interface

```typescript
export type IndicatorFn = (
  data: Series | Bar[],
  ...params: any[]
) => Series | IndicatorResult;

export interface IndicatorResult {
  values: Series;
  signals?: Signal[];
  meta?: Record<string, any>;
}
```

#### New Indicator Categories

**Volatility Models:**
```typescript
export class VolatilityIndicators {
  // GARCH(1,1) model
  static garch(returns: Series, options?: GarchOptions): GarchResult;
  
  // EWMA volatility
  static ewmaVol(returns: Series, lambda: number): Series;
  
  // Realized volatility
  static realizedVol(returns: Series, period: number): Series;
}

export interface GarchOptions {
  omega?: number;
  alpha?: number;
  beta?: number;
  maxIter?: number;
}

export interface GarchResult {
  volatility: Series;
  params: { omega: number; alpha: number; beta: number };
  logLikelihood: number;
}
```

**Microstructure Indicators:**
```typescript
export class MicrostructureIndicators {
  // Volume-synchronized probability of informed trading
  static vpin(bars: Bar[], buckets: number): Series;
  
  // Order book imbalance proxy
  static orderImbalance(bars: Bar[]): Series;
  
  // Kyle's lambda (price impact)
  static kylesLambda(bars: Bar[], window: number): Series;
}
```

**Regime Detection:**
```typescript
export class RegimeIndicators {
  // Hidden Markov Model regime detection
  static hmm(returns: Series, states: number): RegimeResult;
  
  // Change point detection
  static changePoints(data: Series, method: 'cusum' | 'bayesian'): number[];
  
  // Trend vs mean-reversion classifier
  static trendClassifier(data: Series, window: number): Series;
}

export interface RegimeResult {
  regimes: number[];  // State assignments
  probabilities: number[][];  // State probabilities
  transitions: number[][];  // Transition matrix
}
```


### 4. Strategies Package (@meridianalgo/strategies)

Provides strategy templates and composition tools.

#### Strategy Interface

```typescript
export interface Strategy {
  id: string;
  
  // Initialize strategy with historical data
  init?(bars: Bar[]): void;
  
  // Generate signal for new bar
  next(bar: Bar): Signal | null;
  
  // Batch generate signals
  generate?(bars: Bar[]): Signal[];
  
  // Get current positions/state
  getState?(): Record<string, any>;
}

export type StrategyFactory = (params: any) => Strategy;
```

#### Strategy Templates

```typescript
// Trend following strategy
export function trendFollowing(params: {
  fastPeriod: number;
  slowPeriod: number;
  maType?: 'sma' | 'ema';
}): Strategy;

// Mean reversion strategy
export function meanReversion(params: {
  period: number;
  stdDev: number;
  rsiPeriod?: number;
  rsiOversold?: number;
  rsiOverbought?: number;
}): Strategy;

// Pairs trading strategy
export function pairsTrading(params: {
  symbol1: string;
  symbol2: string;
  lookback: number;
  entryThreshold: number;
  exitThreshold: number;
}): Strategy;

// Momentum strategy
export function momentum(params: {
  lookback: number;
  topN: number;
  rebalancePeriod: number;
}): Strategy;
```

#### Strategy Composition

```typescript
export class StrategyComposer {
  // Weighted blend of strategies
  static blend(strategies: Strategy[], weights: number[]): Strategy;
  
  // Voting ensemble
  static vote(strategies: Strategy[], threshold: number): Strategy;
  
  // Regime-based gating
  static regimeGate(
    strategies: Strategy[],
    regimeDetector: (bars: Bar[]) => number,
    regimeMap: Record<number, number>  // regime -> strategy index
  ): Strategy;
}
```

#### Position Sizing

```typescript
export class PositionSizer {
  // Kelly criterion
  static kelly(
    signal: Signal,
    winRate: number,
    avgWin: number,
    avgLoss: number,
    fraction?: number
  ): number;
  
  // Volatility targeting
  static volTarget(
    signal: Signal,
    targetVol: number,
    currentVol: number,
    capital: number
  ): number;
  
  // Drawdown-aware sizing
  static drawdownAware(
    signal: Signal,
    currentDrawdown: number,
    maxDrawdown: number,
    baseSize: number
  ): number;
}
```

### 5. Backtest Package (@meridianalgo/backtest)

Provides time-driven and event-driven backtesting engines.

#### Backtest Engine Interface

```typescript
export interface BacktestEngine {
  // Run backtest
  run(config: BacktestConfig): Promise<BacktestResult>;
  
  // Get current state
  getState(): BacktestState;
}

export interface BacktestConfig {
  strategy: Strategy;
  data: Bar[] | DataSource;
  initialCash: number;
  commission?: CommissionModel;
  slippage?: SlippageModel;
  constraints?: Constraints;
  startDate?: Date;
  endDate?: Date;
}

export interface BacktestResult {
  equity: PortfolioSnapshot[];
  trades: Trade[];
  metrics: PerformanceMetrics;
  logs: BacktestLog[];
}

export interface Trade {
  entryTime: Date;
  exitTime: Date;
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  qty: number;
  pnl: number;
  commission: number;
  slippage: number;
}
```


#### Time-Driven Engine

```typescript
export class TimeBasedEngine implements BacktestEngine {
  constructor(private config: BacktestConfig) {}
  
  async run(): Promise<BacktestResult> {
    // Iterate through bars
    // Generate signals
    // Execute orders at next bar open
    // Track portfolio state
    // Calculate metrics
  }
}
```

#### Event-Driven Engine

```typescript
export class EventDrivenEngine implements BacktestEngine {
  constructor(private config: BacktestConfig) {}
  
  async run(): Promise<BacktestResult> {
    // Process tick-level events
    // Simulate order book
    // Handle partial fills
    // Track order states
  }
}

export interface OrderEvent {
  type: 'new' | 'fill' | 'partial' | 'cancel' | 'reject';
  order: Order;
  fill?: Fill;
  reason?: string;
  ts: Date;
}
```

#### Cost Models

```typescript
export interface CommissionModel {
  calculate(trade: { qty: number; price: number; side: OrderSide }): number;
}

export class FixedCommission implements CommissionModel {
  constructor(private fee: number) {}
  calculate(): number { return this.fee; }
}

export class PercentageCommission implements CommissionModel {
  constructor(private rate: number) {}
  calculate(trade): number { return trade.qty * trade.price * this.rate; }
}

export interface SlippageModel {
  calculate(order: Order, marketPrice: number): number;
}

export class FixedSlippage implements SlippageModel {
  constructor(private bps: number) {}
  calculate(order, marketPrice): number {
    return marketPrice * (this.bps / 10000) * (order.side === 'buy' ? 1 : -1);
  }
}

export class VolumeSlippage implements SlippageModel {
  constructor(private impactCoeff: number) {}
  calculate(order, marketPrice): number {
    // Market impact based on order size
  }
}
```

### 6. Risk Package (@meridianalgo/risk)

Risk metrics and stress testing.

```typescript
export class RiskMetrics {
  // Value at Risk
  static var(returns: Series, confidence: number, method: 'historical' | 'parametric' | 'monte-carlo'): number;
  
  // Conditional VaR (Expected Shortfall)
  static cvar(returns: Series, confidence: number): number;
  
  // Maximum drawdown
  static maxDrawdown(equity: Series): { value: number; start: number; end: number };
  
  // Volatility
  static volatility(returns: Series, annualized?: boolean): number;
  
  // Beta vs benchmark
  static beta(returns: Series, benchmarkReturns: Series): number;
  
  // Tracking error
  static trackingError(returns: Series, benchmarkReturns: Series): number;
}

export class StressTesting {
  // Scenario analysis
  static scenario(
    portfolio: Position[],
    shocks: Record<string, number>
  ): { pnl: number; newValue: number };
  
  // Historical stress test
  static historical(
    portfolio: Position[],
    historicalEvent: { date: Date; returns: Record<string, number> }
  ): number;
  
  // Monte Carlo stress test
  static monteCarlo(
    portfolio: Position[],
    simulations: number,
    horizon: number
  ): { scenarios: number[]; var95: number; cvar95: number };
}
```

### 7. Portfolio Package (@meridianalgo/portfolio)

Portfolio optimization and allocation.

```typescript
export interface PortfolioOptimizer {
  optimize(
    returns: number[][],
    constraints: OptimizationConstraints
  ): OptimizationResult;
}

export interface OptimizationConstraints {
  minWeight?: number;
  maxWeight?: number;
  longOnly?: boolean;
  maxLeverage?: number;
  targetReturn?: number;
  targetRisk?: number;
  sectorLimits?: Record<string, number>;
  turnoverLimit?: number;
}

export interface OptimizationResult {
  weights: number[];
  expectedReturn: number;
  expectedRisk: number;
  sharpe: number;
  success: boolean;
}
```


#### Optimization Methods

```typescript
// Mean-variance optimization
export class MeanVarianceOptimizer implements PortfolioOptimizer {
  optimize(returns, constraints): OptimizationResult;
}

// Black-Litterman
export class BlackLittermanOptimizer implements PortfolioOptimizer {
  constructor(
    private marketCaps: number[],
    private riskAversion: number
  ) {}
  
  optimize(
    returns,
    constraints,
    views?: { assets: number[]; returns: number[]; confidence: number[] }
  ): OptimizationResult;
}

// Risk Parity
export class RiskParityOptimizer implements PortfolioOptimizer {
  optimize(returns, constraints): OptimizationResult;
}

// Hierarchical Risk Parity
export class HRPOptimizer implements PortfolioOptimizer {
  optimize(returns, constraints): OptimizationResult;
}
```

### 8. Models Package (@meridianalgo/models)

Machine learning and forecasting models.

```typescript
export interface Model {
  // Train model
  train(features: number[][], labels: number[]): Promise<void>;
  
  // Make predictions
  predict(features: number[][]): Promise<number[]>;
  
  // Get feature importance
  featureImportance?(): number[];
  
  // Save/load model
  save?(path: string): Promise<void>;
  load?(path: string): Promise<void>;
}

export type ModelFactory = (config: any) => Model;
```

#### ML Models

```typescript
// Random Forest (using ml.js)
export class RandomForestModel implements Model {
  constructor(config: {
    nTrees: number;
    maxDepth?: number;
    minSamples?: number;
  }) {}
}

// Gradient Boosting
export class GradientBoostingModel implements Model {
  constructor(config: {
    nEstimators: number;
    learningRate: number;
    maxDepth: number;
  }) {}
}

// Neural Network (using TensorFlow.js)
export class NeuralNetworkModel implements Model {
  constructor(config: {
    layers: number[];
    activation: string;
    optimizer: string;
    learningRate: number;
    epochs: number;
    batchSize: number;
  }) {}
}

// LSTM for time series
export class LSTMModel implements Model {
  constructor(config: {
    units: number[];
    lookback: number;
    dropout?: number;
    epochs: number;
    batchSize: number;
  }) {}
}
```

#### Time Series Models

```typescript
// ARIMA
export class ARIMAModel implements Model {
  constructor(config: {
    p: number;  // AR order
    d: number;  // Differencing
    q: number;  // MA order
  }) {}
  
  forecast(steps: number): number[];
}

// VAR (Vector Autoregression)
export class VARModel implements Model {
  constructor(config: {
    lag: number;
  }) {}
}

// Kalman Filter
export class KalmanFilter {
  constructor(config: {
    stateTransition: number[][];
    observationModel: number[][];
    processNoise: number[][];
    observationNoise: number[][];
  }) {}
  
  filter(observations: number[]): number[];
  predict(steps: number): number[];
}
```

#### AutoML

```typescript
export class AutoML {
  constructor(private config: {
    models: ModelFactory[];
    metric: 'mse' | 'mae' | 'r2' | 'sharpe';
    cvFolds: number;
    maxTime?: number;
  }) {}
  
  async search(
    features: number[][],
    labels: number[]
  ): Promise<{ model: Model; score: number; params: any }>;
}
```


### 9. Execution Package (@meridianalgo/execution)

Paper and live trading execution.

```typescript
export interface BrokerAdapter {
  id: string;
  
  // Place order
  placeOrder(order: Order): Promise<OrderResponse>;
  
  // Cancel order
  cancelOrder(orderId: string): Promise<void>;
  
  // Get order status
  getOrder(orderId: string): Promise<OrderStatus>;
  
  // Get positions
  getPositions(): Promise<Position[]>;
  
  // Get account info
  getAccount(): Promise<AccountInfo>;
  
  // Subscribe to order updates
  subscribeOrders?(callback: (event: OrderEvent) => void): StreamSubscription;
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'pending' | 'open' | 'filled' | 'partial' | 'cancelled' | 'rejected';
  filledQty: number;
  remainingQty: number;
  avgFillPrice?: number;
  fills: Fill[];
}

export interface AccountInfo {
  equity: number;
  cash: number;
  buyingPower: number;
  marginUsed: number;
  positions: Position[];
}
```

#### Paper Trading

```typescript
export class PaperBroker implements BrokerAdapter {
  constructor(private config: {
    initialCash: number;
    commission: CommissionModel;
    slippage: SlippageModel;
    latency?: number;  // Simulated latency in ms
  }) {}
  
  // Deterministic fill simulation
  private simulateFill(order: Order, marketPrice: number): Fill;
}
```

#### Live Broker Adapters

```typescript
// Alpaca adapter
export class AlpacaBroker implements BrokerAdapter {
  constructor(private credentials: {
    apiKey: string;
    secretKey: string;
    paper?: boolean;
  }) {}
}

// Interactive Brokers adapter (via IB Gateway)
export class IBKRBroker implements BrokerAdapter {
  constructor(private config: {
    host: string;
    port: number;
    clientId: number;
  }) {}
}
```

#### Order Management System

```typescript
export class OrderManager {
  constructor(
    private broker: BrokerAdapter,
    private riskLimits: RiskLimits
  ) {}
  
  // Place order with pre-trade checks
  async placeOrder(order: Order): Promise<OrderResponse> {
    // Check risk limits
    // Check position limits
    // Check buying power
    // Place order
    // Log to audit trail
  }
  
  // Smart order routing
  async routeOrder(order: Order, venues: string[]): Promise<OrderResponse>;
  
  // Bracket orders (entry + stop + target)
  async placeBracket(
    entry: Order,
    stop: Order,
    target: Order
  ): Promise<string[]>;
}

export interface RiskLimits {
  maxPositions?: number;
  maxPositionSize?: number;
  maxLeverage?: number;
  maxDailyLoss?: number;
  allowedSymbols?: string[];
}
```

### 10. Optimize Package (@meridianalgo/optimize)

Parameter optimization and search.

```typescript
export interface Optimizer {
  // Run optimization
  optimize(
    objective: ObjectiveFunction,
    space: ParameterSpace
  ): Promise<OptimizationResult>;
}

export type ObjectiveFunction = (params: Record<string, any>) => Promise<number>;

export interface ParameterSpace {
  [key: string]: {
    type: 'continuous' | 'discrete' | 'categorical';
    min?: number;
    max?: number;
    values?: any[];
    step?: number;
  };
}
```


#### Optimization Methods

```typescript
// Grid search
export class GridSearchOptimizer implements Optimizer {
  async optimize(objective, space): Promise<OptimizationResult> {
    // Generate all combinations
    // Evaluate in parallel
    // Return best
  }
}

// Random search
export class RandomSearchOptimizer implements Optimizer {
  constructor(private iterations: number) {}
}

// Bayesian optimization
export class BayesianOptimizer implements Optimizer {
  constructor(private config: {
    iterations: number;
    acquisitionFn: 'ei' | 'ucb' | 'poi';
    kernel?: string;
  }) {}
}

// Evolutionary/Genetic algorithm
export class GeneticOptimizer implements Optimizer {
  constructor(private config: {
    populationSize: number;
    generations: number;
    mutationRate: number;
    crossoverRate: number;
  }) {}
}
```

### 11. Visualize Package (@meridianalgo/visualize)

Charts and dashboards.

```typescript
export interface Visualizer {
  // Create chart
  create(data: any, options: ChartOptions): Chart;
  
  // Render to HTML
  toHTML(chart: Chart): string;
  
  // Render to image
  toImage?(chart: Chart, format: 'png' | 'svg'): Promise<Buffer>;
}

export interface ChartOptions {
  title?: string;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  interactive?: boolean;
}
```

#### Chart Types

```typescript
// Equity curve
export function equityCurve(
  snapshots: PortfolioSnapshot[],
  benchmark?: Series
): Chart;

// Drawdown chart
export function drawdownChart(equity: Series): Chart;

// Return distribution
export function returnDistribution(returns: Series): Chart;

// Correlation heatmap
export function correlationHeatmap(returns: number[][]): Chart;

// Factor exposure
export function factorExposure(
  exposures: Record<string, number>,
  limits?: Record<string, [number, number]>
): Chart;

// Candlestick chart with indicators
export function candlestickChart(
  bars: Bar[],
  indicators?: Record<string, Series>
): Chart;
```

#### Dashboard

```typescript
export class Dashboard {
  constructor(private config: {
    title: string;
    layout: 'grid' | 'tabs';
  }) {}
  
  addChart(chart: Chart, position?: { row: number; col: number }): void;
  addMetric(name: string, value: number | string): void;
  addTable(data: any[]): void;
  
  render(): string;  // HTML
  serve(port: number): void;  // Start web server
}
```

### 12. Pipeline Package (@meridianalgo/pipeline)

DAG orchestration and feature stores.

```typescript
export interface PipelineNode {
  id: string;
  execute(inputs: Record<string, any>): Promise<any>;
  dependencies: string[];
}

export class Pipeline {
  private nodes: Map<string, PipelineNode> = new Map();
  
  addNode(node: PipelineNode): void;
  
  async run(inputs?: Record<string, any>): Promise<Record<string, any>> {
    // Topological sort
    // Execute in order
    // Handle errors
    // Cache results
  }
  
  visualize(): string;  // Mermaid diagram
}
```

#### Feature Store

```typescript
export interface FeatureStore {
  // Store features
  put(
    key: string,
    features: number[][],
    metadata: FeatureMetadata
  ): Promise<void>;
  
  // Retrieve features
  get(key: string, version?: string): Promise<FeatureData>;
  
  // List versions
  versions(key: string): Promise<string[]>;
}

export interface FeatureMetadata {
  version: string;
  timestamp: Date;
  schema: Record<string, string>;
  lineage: string[];  // Pipeline nodes that created this
}

export interface FeatureData {
  features: number[][];
  metadata: FeatureMetadata;
}
```


### 13. Compliance Package (@meridianalgo/compliance)

Audit trails and reproducibility.

```typescript
export class AuditLogger {
  constructor(private storage: StorageAdapter) {}
  
  // Log configuration
  logConfig(runId: string, config: any): Promise<void>;
  
  // Log order
  logOrder(runId: string, order: Order, reason: string): Promise<void>;
  
  // Log trade
  logTrade(runId: string, trade: Trade): Promise<void>;
  
  // Query logs
  query(filters: AuditFilters): Promise<AuditEntry[]>;
}

export interface AuditEntry {
  runId: string;
  timestamp: Date;
  type: 'config' | 'order' | 'trade' | 'signal' | 'error';
  data: any;
}

export interface AuditFilters {
  runId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  symbol?: string;
}
```

#### Reproducibility

```typescript
export class RunManager {
  // Create new run
  createRun(config: any): Run;
  
  // Load existing run
  loadRun(runId: string): Run;
}

export class Run {
  readonly id: string;
  readonly config: any;
  readonly seed: number;
  
  // Save artifacts
  saveArtifact(name: string, data: any): Promise<void>;
  
  // Load artifacts
  loadArtifact(name: string): Promise<any>;
  
  // Reproduce run
  reproduce(): Promise<BacktestResult>;
}
```

### 14. CLI Package (@meridianalgo/cli)

Command-line tools.

```typescript
// CLI commands
export const commands = {
  // Scaffold new project
  init: (name: string, template: string) => void;
  
  // Run backtest
  backtest: (config: string) => Promise<void>;
  
  // Optimize parameters
  optimize: (config: string) => Promise<void>;
  
  // Live trading
  live: (config: string) => Promise<void>;
  
  // Generate report
  report: (runId: string, output: string) => Promise<void>;
  
  // List runs
  runs: () => Promise<void>;
};
```

#### CLI Usage Examples

```bash
# Create new project
npx meridianalgo init my-strategy --template trend-following

# Run backtest
npx meridianalgo backtest --config backtest.yaml

# Optimize parameters
npx meridianalgo optimize --strategy rsi-mean-reversion \
  --param buyBelow=20..40 --param sellAbove=60..80 \
  --metric sharpe --parallel 4

# Live trading
npx meridianalgo live --broker alpaca --strategy my-strategy \
  --symbols AAPL,MSFT,GOOGL --mode paper

# Generate report
npx meridianalgo report run-123 --output report.html
```

### 15. Utils Package (@meridianalgo/utils)

Shared utilities.

```typescript
// Math utilities
export class MathUtils {
  static mean(data: number[]): number;
  static std(data: number[]): number;
  static correlation(x: number[], y: number[]): number;
  static covariance(x: number[], y: number[]): number;
  static percentile(data: number[], p: number): number;
}

// Statistics
export class StatUtils {
  static normalCDF(x: number): number;
  static normalPDF(x: number): number;
  static tTest(sample1: number[], sample2: number[]): number;
  static chiSquare(observed: number[], expected: number[]): number;
}

// Time utilities
export class TimeUtils {
  static isMarketOpen(date: Date, exchange: string): boolean;
  static nextMarketOpen(date: Date, exchange: string): Date;
  static tradingDays(start: Date, end: Date, exchange: string): number;
  static resample(bars: Bar[], interval: string): Bar[];
}

// Logger
export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}
```

## Data Models

### Database Schema (for storage)

```sql
-- Runs table
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  config JSON NOT NULL,
  seed INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT CHECK(status IN ('running', 'completed', 'failed'))
);

-- Audit log
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  type TEXT NOT NULL,
  data JSON NOT NULL,
  FOREIGN KEY (run_id) REFERENCES runs(id)
);

-- Features
CREATE TABLE features (
  key TEXT NOT NULL,
  version TEXT NOT NULL,
  data BLOB NOT NULL,
  metadata JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (key, version)
);
```


## Error Handling

### Error Hierarchy

```typescript
export class MeridianError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MeridianError';
  }
}

export class DataError extends MeridianError {
  constructor(message: string) {
    super(message, 'DATA_ERROR');
  }
}

export class StrategyError extends MeridianError {
  constructor(message: string) {
    super(message, 'STRATEGY_ERROR');
  }
}

export class ExecutionError extends MeridianError {
  constructor(message: string) {
    super(message, 'EXECUTION_ERROR');
  }
}

export class ValidationError extends MeridianError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}
```

### Error Recovery

- **Data errors**: Retry with exponential backoff, fallback to cache
- **Execution errors**: Log, alert, halt trading if critical
- **Strategy errors**: Log, skip signal, continue
- **Validation errors**: Reject immediately, log

## Testing Strategy

### Unit Tests

- Each package has comprehensive unit tests
- Mock external dependencies (APIs, brokers)
- Test edge cases and error conditions
- Target 90%+ coverage

### Integration Tests

- Test plugin system with real plugins
- Test data flow through pipelines
- Test backtest engines with known strategies
- Test broker adapters with paper trading

### Performance Tests

- Benchmark indicator calculations
- Test backtest speed with large datasets
- Memory profiling for long-running processes
- Stress test with concurrent operations

### Regression Tests

- Golden metrics for known strategies
- Snapshot tests for reports and charts
- Version compatibility tests

## Security Considerations

### API Keys and Secrets

- Never log or expose API keys
- Use environment variables or secure vaults
- Encrypt stored credentials
- Support key rotation

### Data Privacy

- No PII in logs or artifacts
- Secure data transmission (HTTPS/WSS)
- Optional data encryption at rest

### Code Security

- Input validation on all external data
- Sanitize user-provided code/config
- Rate limiting on API calls
- Dependency scanning for vulnerabilities

## Performance Optimization

### Computation

- Vectorized operations using TypedArrays
- Worker pools for parallel backtests
- Lazy evaluation where possible
- Memoization of expensive calculations

### Memory

- Streaming data processing for large datasets
- Circular buffers for rolling windows
- Garbage collection hints
- Memory-mapped files for large feature stores

### Network

- Connection pooling for APIs
- Request batching
- Compression for data transfer
- WebSocket reuse

## Migration Path

### Phase 1: Core Infrastructure (Weeks 1-2)
- Set up monorepo structure
- Implement core plugin system
- Migrate existing indicators to new structure
- Create basic data adapter interface

### Phase 2: Data and Strategies (Weeks 3-4)
- Implement data adapters (Yahoo, Polygon, Binance)
- Create strategy templates
- Build strategy composition tools
- Add caching layer

### Phase 3: Backtesting (Weeks 5-6)
- Implement time-driven engine
- Add cost models
- Create performance metrics
- Build basic reporting

### Phase 4: Advanced Features (Weeks 7-8)
- Add event-driven engine
- Implement portfolio optimization
- Add ML model wrappers
- Create feature engineering tools

### Phase 5: Execution (Weeks 9-10)
- Implement paper trading
- Add broker adapters (Alpaca)
- Create order management system
- Add compliance logging

### Phase 6: Optimization and Visualization (Weeks 11-12)
- Implement parameter optimizers
- Create visualization library
- Build dashboard
- Add CLI tools

### Phase 7: Advanced Capabilities (Weeks 13-14)
- Add pipeline orchestration
- Implement feature store
- Create AutoML
- Add advanced indicators (GARCH, HMM)

### Phase 8: Polish and Documentation (Weeks 15-16)
- Comprehensive documentation
- Example notebooks
- Performance optimization
- Security audit

## Documentation Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quickstart.md
│   └── concepts.md
├── guides/
│   ├── data-ingestion.md
│   ├── strategy-development.md
│   ├── backtesting.md
│   ├── optimization.md
│   ├── live-trading.md
│   └── risk-management.md
├── api/
│   ├── core.md
│   ├── data.md
│   ├── indicators.md
│   ├── strategies.md
│   ├── backtest.md
│   ├── risk.md
│   ├── portfolio.md
│   ├── models.md
│   ├── execution.md
│   └── ...
├── examples/
│   ├── simple-strategy.md
│   ├── multi-asset.md
│   ├── ml-strategy.md
│   └── portfolio-optimization.md
└── advanced/
    ├── plugins.md
    ├── custom-indicators.md
    ├── performance.md
    └── deployment.md
```

## Success Metrics

- **Adoption**: 1000+ npm downloads/month within 6 months
- **Performance**: Backtest 1M bars in <10 seconds
- **Coverage**: 90%+ test coverage across all packages
- **Documentation**: 100% API documentation, 20+ examples
- **Community**: 50+ GitHub stars, 10+ contributors
- **Reliability**: <1% error rate in production use
