import { FilterStrategy } from './strategies/filter-strategy.interface';

export class ContentFilter {
  private strategies: FilterStrategy[] = [];

  constructor(strategies: FilterStrategy[] = []) {
    this.strategies = strategies;
  }

  addStrategy(strategy: FilterStrategy) {
    this.strategies.push(strategy);
  }

  async checkSafety(text: string): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (await strategy.check(text)) {
        console.warn(`SECURITY INCIDENT: Blocked by ${strategy.getName()}: "${text}"`);
        return true;
      }
    }
    return false;
  }
}
