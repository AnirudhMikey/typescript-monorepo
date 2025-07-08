import 'reflect-metadata';
import { Container } from 'typedi';
import { TargetScraper } from './services/TargetScraper';
import { AmazonScraper } from './services/AmazonScraper';
import { LinkedInScraper } from './services/LinkedInScraper';

const SCRAPE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function runDaemon() {
  const targetScraper = Container.get(TargetScraper);
  const amazonScraper = Container.get(AmazonScraper);
  const linkedInScraper = Container.get(LinkedInScraper);

  while (true) {
    try {
      console.log(`[${new Date().toISOString()}] Starting Target scrape...`);
      await targetScraper.scrape();

      console.log(`[${new Date().toISOString()}] Starting Amazon scrape...`);
      await amazonScraper.scrape();

      console.log(`[${new Date().toISOString()}] Starting LinkedIn scrape...`);
      await linkedInScraper.scrape();

      console.log(`[${new Date().toISOString()}] Scraping complete. Waiting for next run...`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error during scraping:`, err);
    }

    await new Promise(res => setTimeout(res, SCRAPE_INTERVAL_MS));
  }
}

runDaemon(); 