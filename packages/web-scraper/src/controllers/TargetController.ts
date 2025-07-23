import { Service } from 'typedi';
import { TargetScraper } from '../services/TargetScraper';
import { SaveResultService } from '../services/SaveResultService';
import { cliRespond } from 'shared/src/cliRespond';
import { Exception } from 'shared/src/Exception';

@Service()
export class TargetController {
  constructor(
    private scraper: TargetScraper,
    private saveResultService: SaveResultService
  ) {}

  async run(credentials: any) {
    try {
      const result = await this.scraper.scrape(credentials);
      const insertId = await this.saveResultService.saveResult(result);
      cliRespond({ insertId, result }, 'Scraping completed and saved to MySQL', 0);
    } catch (err) {
      if (err instanceof Exception) {
        cliRespond(err.data, err.message, err.status);
      } else {
        console.error('Unknown error in TargetController.run:', err);
        cliRespond(null, 'Unknown error', 1);
      }
      process.exit(1);
    }
  }
} 