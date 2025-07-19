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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `target-api-response-${timestamp}.json`;
      const { localPath, s3Uri } = await this.model.saveApiResponse(data, filename);
      this.view.showSuccess(`Target API response saved locally to ${localPath}`);
      this.view.showSuccess(`Target API response uploaded to S3: ${s3Uri}`);
      this.view.showData(data);
    } catch (err) {
      this.view.showError('Error during scraping: ' + err);
    }
  }
} 