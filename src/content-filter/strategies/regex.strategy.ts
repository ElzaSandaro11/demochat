import { FilterStrategy } from './filter-strategy.interface';

export class RegexStrategy implements FilterStrategy {
  // Example: Detect emails (PII)
  private readonly regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  async check(text: string): Promise<boolean> {
    return this.regex.test(text);
  }

  getName(): string {
    return 'RegexFilter(PII)';
  }
}
