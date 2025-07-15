import 'reflect-metadata';
import { Container } from 'typedi';
import { TargetScraper } from './services/TargetScraper';
import { BrowserManager } from '../src/BrowserManager';
import { Logger } from '../src/Logger';
import { LoginCredentials } from 'shared';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // Register dependencies if not using typedi decorators everywhere
  Container.set(BrowserManager, new BrowserManager());
  Container.set(Logger, new Logger());

  const scraper = Container.get(TargetScraper);
  
  // Check for credentials from multiple sources
  let credentials: LoginCredentials | undefined;
  
  // Method 1: Environment variables
  const email = process.env.TARGET_EMAIL;
  const password = process.env.TARGET_PASSWORD;
  
  if (email && password) {
    credentials = { email, password };
  } else {
    // Method 2: Config file
    const configPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.targetEmail && config.targetPassword) {
          credentials = { 
            email: config.targetEmail, 
            password: config.targetPassword 
          };
        }
      } catch (error) {
        console.error('Error reading config.json:', error);
      }
    }
  }

  try {
    const result = await scraper.scrape(credentials);
    console.log('✅ Target scraping completed successfully!');
    console.log('📁 Check generated screenshots and target-api-response.json');
  } catch (err) {
    console.error('❌ Error during scraping:', err);
    process.exit(1);
  }
}

main(); 