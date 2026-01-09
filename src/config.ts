import * as dotenv from 'dotenv';
dotenv.config();

export class Config {
  static get dbPath(): string {
    return process.env.DB_PATH || './chat_history.db';
  }

  static get bannedKeywords(): string[] {
    const keywords = process.env.BANNED_KEYWORDS || 'hack,jailbreak,exploit,violence';
    return keywords.split(',').map(k => k.trim());
  }
}
