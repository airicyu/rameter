export interface ResultAnalyzer {
  init(): Promise<void>;

  /**
   * analyze summary for full result
   */
  analyze(): Promise<Summary>;

  /**
   * analyze summary with all result until now
   */
  analyzeIntermediateResult(): Promise<{ startTime: number; summary: Summary }>;

  /**
   * Tick, and then analyze all result since last tick
   */
  tickAndAnalyzeFromLastTick(): Promise<{
    tickSummary: Summary;
    lastTickTime: number;
    thisTickTime: number;
  }>;
}

export type Config = {};
