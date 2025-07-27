import 'reflect-metadata';
import { Container } from 'typedi';
import { TargetScraper } from './services/TargetScraper';
import { AmazonScraper } from './services/AmazonScraper';
import { LinkedInScraper } from './services/LinkedInScraper';
import { ScraperFramework } from 'shared';

const SCRAPE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function runDaemon() {
  // Initialize the microframework
  const framework = new ScraperFramework({
    intervalMs: SCRAPE_INTERVAL_MS,
    maxRetries: 3,
    retryDelayMs: 5000
  });

  // Get scrapers from dependency injection container
  const targetScraper = Container.get(TargetScraper);
  const amazonScraper = Container.get(AmazonScraper);
  const linkedInScraper = Container.get(LinkedInScraper);

  // Add tasks to the framework
  framework
    .addTask({
      name: 'Target',
      scraper: targetScraper,
      enabled: true
    })
    .addTask({
      name: 'Amazon',
      scraper: amazonScraper,
      enabled: false
    })
    .addTask({
      name: 'LinkedIn',
      scraper: linkedInScraper,
      enabled: false
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    framework.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    framework.stop();
    process.exit(0);
  });

  // Start the framework
  await framework.start();
}

runDaemon(); 