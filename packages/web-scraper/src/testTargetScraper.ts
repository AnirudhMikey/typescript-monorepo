import 'reflect-metadata';
import { Container } from 'typedi';
import { TargetScraper } from './services/TargetScraper';
import { BrowserManager } from '../src/BrowserManager';
import { Logger } from '../src/Logger';

async function main() {
  // Register dependencies if not using typedi decorators everywhere
  Container.set(BrowserManager, new BrowserManager());
  Container.set(Logger, new Logger());

  const scraper = Container.get(TargetScraper);
  try {
    const result = await scraper.scrape();
    console.log('Scrape result:', result);
  } catch (err) {
    console.error('Error during scraping:', err);
  }
}

main(); 