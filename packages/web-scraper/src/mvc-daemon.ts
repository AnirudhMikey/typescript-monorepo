import 'reflect-metadata';
import { TargetController } from './controllers/TargetController';
import { TargetModel } from './models/TargetModel';
import { ConsoleView } from './views/ConsoleView';
import { TargetScraper } from './services/TargetScraper';
import { Container } from 'typedi';

const SCRAPE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function runDaemon() {
  const model = new TargetModel();
  const view = new ConsoleView();
  const scraper = Container.get(TargetScraper);
  const controller = new TargetController(model, view, scraper);

  while (true) {
    await controller.run();
    await new Promise(res => setTimeout(res, SCRAPE_INTERVAL_MS));
  }
}

runDaemon(); 