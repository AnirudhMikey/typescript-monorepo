import { TargetModel } from '../models/TargetModel';
import { ConsoleView } from '../views/ConsoleView';
import { TargetScraper } from '../services/TargetScraper';

export class TargetController {
  constructor(
    private model: TargetModel,
    private view: ConsoleView,
    private scraper: TargetScraper
  ) {}

  async run() {
    try {
      const data = await this.scraper.scrape();
      const file = this.model.saveApiResponse(data);
      this.view.showSuccess(`Target API response saved to ${file}`);
      this.view.showData(data);
    } catch (err) {
      this.view.showError('Error during scraping: ' + err);
    }
  }
} 