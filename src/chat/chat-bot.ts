import { ContentFilter } from '../content-filter/content-filter';
import { DatabaseService } from '../database/database.service';

export class ChatBot {
  constructor(
    private readonly contentFilter: ContentFilter,
    private readonly dbService: DatabaseService,
  ) {}

  async processMessage(input: string): Promise<string> {
    const sanitizedInput = input.toLowerCase().trim();
    let response = '';
    let isBlocked = false;

    // 1. Safety Check (The Guard Layer)
    if (await this.contentFilter.checkSafety(sanitizedInput)) {
      console.warn(`SECURITY INCIDENT: Blocked unsafe content: "${input}"`);
      response = '⛔ [BLOCK]: I cannot answer this request due to safety guidelines.';
      isBlocked = true;
    } else {
       // 2. Happy Path
       console.log(`Valid request processed: "${input}"`);
       response = `🤖 [GovBot]: You said "${input}"`;
    }

    // 3. Audit Log
    try {
        await this.dbService.logInteraction(input, response, isBlocked);
    } catch (e) {
        console.error("Failed to log interaction", e);
    }

    return response;
  }
}
