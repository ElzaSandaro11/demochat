import { ContentFilter } from './content-filter';
import { KeywordStrategy } from './strategies/keyword.strategy';
import { RegexStrategy } from './strategies/regex.strategy';
import { DatabaseService } from '../database/database.service';

// Mock DatabaseService
const mockDbService = {
  getBannedKeywords: jest.fn().mockResolvedValue(['hack', 'violence']),
} as unknown as DatabaseService;

describe('ContentFilter', () => {
  let filter: ContentFilter;

  beforeEach(() => {
    filter = new ContentFilter();
  });

  it('should allow text when no strategies are added', async () => {
    expect(await filter.checkSafety('hack')).toBe(false);
  });

  it('should block keywords using KeywordStrategy (from DB) and CACHE results', async () => {
    filter.addStrategy(new KeywordStrategy(mockDbService));
    
    // First call: Should hit DB
    expect(await filter.checkSafety('this is a hack')).toBe(true);
    expect(mockDbService.getBannedKeywords).toHaveBeenCalledTimes(1);

    // Second call: Should hit Cache (NO DB call)
    expect(await filter.checkSafety('violence is bad')).toBe(true);
    expect(mockDbService.getBannedKeywords).toHaveBeenCalledTimes(1);
    
    // Third call
    expect(await filter.checkSafety('hello world')).toBe(false);
    expect(mockDbService.getBannedKeywords).toHaveBeenCalledTimes(1);
  });

  it('should block PII using RegexStrategy', async () => {
    filter.addStrategy(new RegexStrategy());
    expect(await filter.checkSafety('contact me at test@example.com')).toBe(true);
    expect(await filter.checkSafety('hello world')).toBe(false);
  });
});
