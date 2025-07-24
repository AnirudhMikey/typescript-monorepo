import 'reflect-metadata';
import { TargetController } from './controllers/TargetController';
import { Container } from 'typedi';
import * as fs from 'fs';
import * as path from 'path';

const SCRAPE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function runDaemon() {
  const controller = Container.get(TargetController);

  // Load credentials (same logic as testTargetScraper.ts)
  let credentials: any;
  const email = process.env.TARGET_EMAIL;
  const password = process.env.TARGET_PASSWORD;
  if (email && password) {
    credentials = { email, password };
  } else {
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

  while (true) {
    await controller.run(credentials);
    await new Promise(res => setTimeout(res, SCRAPE_INTERVAL_MS));
  }
}

runDaemon(); 