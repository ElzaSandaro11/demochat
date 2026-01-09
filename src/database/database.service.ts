import * as sqlite3 from 'sqlite3';
import { Config } from '../config';

export class DatabaseService {
  private db: sqlite3.Database;

  constructor(dbPath: string = Config.dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
    this.init();
  }

  private init() {
    this.db.serialize(() => {
      // 1. Audit Log Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userInput TEXT,
          botResponse TEXT,
          isBlocked INTEGER,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Banned Keywords Table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS banned_keywords (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          keyword TEXT UNIQUE
        )
      `, () => {
        // Seed initial keywords if table is empty
        this.seedKeywords();
      });
    });
  }

  private seedKeywords() {
    this.db.get('SELECT COUNT(*) as count FROM banned_keywords', (err, row: any) => {
      if (err) {
        console.error('Error checking keywords table:', err.message);
        return;
      }
      if (row.count === 0) {
        console.log('Seeding initial banned keywords from config...');
        const stmt = this.db.prepare('INSERT INTO banned_keywords (keyword) VALUES (?)');
        Config.bannedKeywords.forEach((keyword) => {
          stmt.run(keyword, (err) => {
             if(err) console.error(`Failed to seed keyword "${keyword}":`, err.message);
          });
        });
        stmt.finalize();
      }
    });
  }

  // --- Audit Methods ---
  logInteraction(userInput: string, botResponse: string, isBlocked: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(
        'INSERT INTO audit_log (userInput, botResponse, isBlocked) VALUES (?, ?, ?)'
      );
      stmt.run(userInput, botResponse, isBlocked ? 1 : 0, (err) => {
        if (err) {
           console.error('Error logging interaction:', err.message);
           reject(err);
        } else {
           resolve();
        }
      });
      stmt.finalize();
    });
  }

  // --- Keyword Methods ---
  getBannedKeywords(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT keyword FROM banned_keywords', (err, rows: any[]) => {
        if (err) {
          console.error('Error fetching keywords:', err.message);
          reject(err);
        } else {
          resolve(rows.map(row => row.keyword));
        }
      });
    });
  }

  addKeyword(keyword: string): Promise<void> {
     return new Promise((resolve, reject) => {
        const stmt = this.db.prepare('INSERT INTO banned_keywords (keyword) VALUES (?)');
        stmt.run(keyword, (err) => {
           if(err) reject(err);
           else resolve();
        });
        stmt.finalize();
     });
  }

  close() {
    this.db.close();
  }
}
