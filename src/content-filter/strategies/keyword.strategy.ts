import { FilterStrategy } from './filter-strategy.interface';
import { DatabaseService } from '../../database/database.service';

export class KeywordStrategy implements FilterStrategy {
  private cache: string[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute (60,000 ms)

  constructor(private readonly dbService: DatabaseService) {}

  async check(text: string): Promise<boolean> {
    const keywords = await this.getKeywords();
    // Optimization: Check if cache is empty but we just fetched? 
    // If DB is empty, cache is empty.
    
    return keywords.some((word) => text.includes(word));
  }

  private async getKeywords(): Promise<string[]> {
    const now = Date.now();
    if (this.cache.length === 0 || now - this.lastFetch > this.CACHE_TTL) {
      console.log('Cache miss or expired. Fetching keywords from DB...');
      try {
        this.cache = await this.dbService.getBannedKeywords();
        this.lastFetch = now;
      } catch (error) {
        console.error('Failed to refresh keyword cache:', error);
        // Fallback to existing cache if refresh fails, or empty array
      }
    }
    return this.cache;
  }

  getName(): string {
    return 'KeywordFilter(DB+Cache)';
  }
}
