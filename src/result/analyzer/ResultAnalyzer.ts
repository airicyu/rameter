import type { Summary } from "../../sharedTypes";

/**
 * Analyze result
 */
export interface ResultAnalyzer {
  init(): Promise<void>;

  /**
   * analyze summary for full result.
   * It would be run after test finished
   */
  analyze(): Promise<Summary>;

  /**
   * analyze summary with temporary result until now.
   * It is run regularly during the test.
   */
  analyzeIntermediateResult(): Promise<{ startTime: number; summary: Summary }>;

  /**
   * Make a Tick, and then analyze all result since last tick.
   * It is run regularly during the test.
   */
  tickAndAnalyzeFromLastTick(): Promise<{
    tickSummary: Summary;
    lastTickTime: number;
    thisTickTime: number;
  }>;
}

export type Config = {};
