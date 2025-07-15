import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { Logger } from '../Logger';
import { IScraper } from 'types/IScraper';
import { ProductInfo } from 'types/ProductInfo';
import { extractLinkedInJobData } from 'shared/domUtils';

const CONFIG = {
  // Example LinkedIn job search URL - you can modify this to target specific jobs or companies
  SEARCH_URL: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=United%20States',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  SCREENSHOT_FILE: 'linkedin-jobs-screenshot.png'
};

interface JobPosting {
  title: string;
  company: string;
  location: string;
  postedTime: string;
  jobType?: string;
  salary?: string;
}

interface LinkedInData {
  jobPostings: JobPosting[];
  totalResults?: string;
  searchKeywords: string;
  searchLocation: string;
}

@Service()
export class LinkedInScraper implements IScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;

  async scrape(): Promise<ProductInfo> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();

    await page.setUserAgent(CONFIG.USER_AGENT);
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    await page.goto(CONFIG.SEARCH_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Wait for the job listings to load
    await page.waitForSelector('.job-search-card', { timeout: 10000 });

    // Extract job postings data
    const linkedInData: LinkedInData = await page.evaluate((extractFn) => {
      return (0, eval)(`(${extractFn})`)();
    }, extractLinkedInJobData.toString());

    await page.screenshot({ path: CONFIG.SCREENSHOT_FILE, fullPage: true });
    await this.browserManager.close();

    // Convert LinkedIn data to ProductInfo format for consistency
    const productInfo: ProductInfo = {
      title: `LinkedIn Jobs - ${linkedInData.searchKeywords}`,
      price: `${linkedInData.jobPostings.length} jobs found`,
      rating: linkedInData.totalResults || 'Results count not available',
      availability: `Location: ${linkedInData.searchLocation}`
    };

    // Log the scraped data
    this.logger.success(`LinkedIn scraper found ${linkedInData.jobPostings.length} job postings`);
    linkedInData.jobPostings.forEach((job, index) => {
      this.logger.info(`${index + 1}. ${job.title} at ${job.company} - ${job.location}`);
    });

    this.logger.success('LinkedIn jobs scraped successfully!');
    return productInfo;
  }
} 