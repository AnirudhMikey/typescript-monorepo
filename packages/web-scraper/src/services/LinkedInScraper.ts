import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { PageManager } from '../PageManager';
import { Logger } from '../Logger';
import { BaseScraper } from '@yourorg/base-scraper';
import { ProductInfo } from 'types/ProductInfo';

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
export class LinkedInScraper extends BaseScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;

  async scrape(): Promise<ProductInfo> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();
    const pageManager = new PageManager(page);

    await pageManager.configurePage(CONFIG.USER_AGENT, {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    await pageManager.navigateTo(CONFIG.SEARCH_URL);

    // Wait for the job listings to load
    await page.waitForSelector('.job-search-card', { timeout: 10000 });

    // Extract job postings data
    const linkedInData: LinkedInData = await page.evaluate(() => {
      function getTextBySelectors(selectors: string[]): string | null {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent) return el.textContent.trim();
        }
        return null;
      }

      const jobCards = document.querySelectorAll('.job-search-card');
      const jobPostings: JobPosting[] = [];

      jobCards.forEach((card, index) => {
        if (index >= 10) return; // Limit to first 10 jobs

        const title = getTextBySelectors([
          '.job-search-card__title',
          'h3',
          '[data-testid="job-search-card__title"]'
        ]);

        const company = getTextBySelectors([
          '.job-search-card__subtitle',
          '.job-search-card__company-name',
          '[data-testid="job-search-card__company-name"]'
        ]);

        const location = getTextBySelectors([
          '.job-search-card__location',
          '.job-search-card__subtitle + div',
          '[data-testid="job-search-card__location"]'
        ]);

        const postedTime = getTextBySelectors([
          '.job-search-card__listdate',
          '.job-search-card__time-badge',
          '[data-testid="job-search-card__listdate"]'
        ]);

        if (title && company) {
          jobPostings.push({
            title: title,
            company: company,
            location: location || 'Location not specified',
            postedTime: postedTime || 'Time not specified'
          });
        }
      });

      // Extract search metadata
      const searchKeywords = getTextBySelectors([
        '.search-reusables__filter-binary-toggle',
        '[data-testid="search-keywords"]'
      ]) || 'Software Engineer';

      const searchLocation = getTextBySelectors([
        '.search-reusables__filter-binary-toggle + div',
        '[data-testid="search-location"]'
      ]) || 'United States';

      const totalResults = getTextBySelectors([
        '.results-context-header__job-count',
        '.search-results__total-count',
        '[data-testid="results-count"]'
      ]);

      return {
        jobPostings,
        totalResults: totalResults || undefined,
        searchKeywords,
        searchLocation
      };
    });

    await pageManager.takeScreenshot(CONFIG.SCREENSHOT_FILE);
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