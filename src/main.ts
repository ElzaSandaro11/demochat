import * as readline from 'readline';
import { ChatBot } from './chat/chat-bot';
import { ContentFilter } from './content-filter/content-filter';
import { KeywordStrategy } from './content-filter/strategies/keyword.strategy';
import { RegexStrategy } from './content-filter/strategies/regex.strategy';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  console.log('Initializing Safe Chatbot (Vanilla TS)...');

  // Manual Dependency Injection
  const dbService = new DatabaseService();
  const contentFilter = new ContentFilter();
  
  // Inject DB into KeywordStrategy
  contentFilter.addStrategy(new KeywordStrategy(dbService));
  contentFilter.addStrategy(new RegexStrategy());
  
  const chatBot = new ChatBot(contentFilter, dbService);

  // Setup CLI Interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log("Type 'exit' to quit.\n");

  const prompt = () => {
    rl.question('User > ', async (answer) => {
      if (answer.toLowerCase() === 'exit') {
        console.log('Shutting down...');
        dbService.close();
        rl.close();
        process.exit(0);
      }

      // Process message
      const response = await chatBot.processMessage(answer);
      console.log(response);
      console.log('-----------------------------------');
      
      prompt(); // Loop
    });
  };

  prompt();
}

bootstrap();
