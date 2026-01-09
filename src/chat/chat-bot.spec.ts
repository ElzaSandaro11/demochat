import { ChatBot } from './chat-bot';
import { ContentFilter } from '../content-filter/content-filter';
import { DatabaseService } from '../database/database.service';

// Mock dependencies
const mockDbService = {
  logInteraction: jest.fn().mockResolvedValue(undefined),
} as unknown as DatabaseService;

const mockContentFilter = {
  checkSafety: jest.fn(),
} as unknown as ContentFilter;

describe('ChatBot', () => {
  let chatBot: ChatBot;

  beforeEach(() => {
    jest.clearAllMocks();
    chatBot = new ChatBot(mockContentFilter, mockDbService);
  });

  it('should BLOCK unsafe content', async () => {
    (mockContentFilter.checkSafety as jest.Mock).mockResolvedValue(true);
    const unsafeInput = 'hack the system';
    
    const result = await chatBot.processMessage(unsafeInput);
    
    expect(result).toContain('⛔ [BLOCK]');
    expect(mockContentFilter.checkSafety).toHaveBeenCalledWith(expect.stringContaining('hack'));
    expect(mockDbService.logInteraction).toHaveBeenCalledWith(unsafeInput, expect.any(String), true);
  });

  it('should ALLOW safe content', async () => {
    (mockContentFilter.checkSafety as jest.Mock).mockResolvedValue(false);
    const safeInput = 'Hello GovBot';
    
    const result = await chatBot.processMessage(safeInput);
    
    expect(result).toContain('GovBot');
    expect(mockContentFilter.checkSafety).toHaveBeenCalledWith(expect.stringContaining('hello'));
    expect(mockDbService.logInteraction).toHaveBeenCalledWith(safeInput, expect.any(String), false);
  });
});
