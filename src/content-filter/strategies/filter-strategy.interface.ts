export interface FilterStrategy {
  check(text: string): Promise<boolean>;
  getName(): string;
}
