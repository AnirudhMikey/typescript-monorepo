import 'reflect-metadata';
import { Container } from 'typedi';
import { TargetController } from './controllers/TargetController';
import { TargetScraper } from './services/TargetScraper';
import { BrowserManager } from './BrowserManager';
import { Logger } from './Logger';
import { SaveResultService } from './services/SaveResultService';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  Container.set(BrowserManager, new BrowserManager());
  Container.set(Logger, new Logger());
  // Container.set(TargetScraper, new TargetScraper()); // REMOVED, let TypeDI handle
  Container.set(SaveResultService, new SaveResultService());

  const controller = Container.get(TargetController);

  // Check for credentials from multiple sources
  let credentials: any;

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
    await controller.run(credentials);
  } catch (err) {
    console.error('Error in main:', err);
  }
}

main(); 