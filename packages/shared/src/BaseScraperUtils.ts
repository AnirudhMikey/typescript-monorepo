import { Page } from 'puppeteer';
import { PageUtils, LoginCredentials, LoginSelectors } from './PageUtils';

export interface ScraperConfig {
  loginUrl?: string;
  productUrl: string;
  apiUrl?: string;
  userAgent: string;
  screenshotFile: string;
  loginSelectors?: LoginSelectors;
  headers?: Record<string, string>;
}

export abstract class BaseScraperUtils {
  protected pageUtils: PageUtils;
  protected config: ScraperConfig;

  constructor(page: Page, config: ScraperConfig) {
    this.pageUtils = new PageUtils(page);
    this.config = config;
  }

  /**
   * Main scraping method that orchestrates the entire process
   */
  async scrape(credentials?: LoginCredentials): Promise<any> {
    // Configure page with headers and user agent
    await this.pageUtils.configurePage(this.config.userAgent, this.config.headers || {});

    // Step 1: Login if credentials provided
    if (credentials && this.config.loginUrl && this.config.loginSelectors) {
      await this.performLogin(credentials);
    }

    // Step 2: Navigate to product page
    await this.navigateToProduct();

    // Step 3: Get cookies and make API call if API URL is configured
    if (this.config.apiUrl) {
      const cookieString = await this.pageUtils.getCookies();
      const json = await this.makeApiCall(cookieString);
      await this.saveResponse(json);
      return json;
    }

    // Step 4: Take final screenshot
    await this.pageUtils.takeScreenshot(this.config.screenshotFile);
    return null;
  }

  /**
   * Perform login using shared login logic
   */
  protected async performLogin(credentials: LoginCredentials): Promise<void> {
    if (!this.config.loginUrl || !this.config.loginSelectors) {
      throw new Error('Login URL or selectors not configured');
    }

    await this.pageUtils.performLogin(
      this.config.loginUrl,
      credentials,
      this.config.loginSelectors,
      this.getScreenshotPrefix()
    );
  }

  /**
   * Navigate to product page and take screenshot
   */
  protected async navigateToProduct(): Promise<void> {
    await this.pageUtils.navigateTo(this.config.productUrl);
    await this.pageUtils.takeScreenshotWithTimestamp(`${this.getScreenshotPrefix()}-product-page`);
  }

  /**
   * Make API call using shared logic
   */
  protected async makeApiCall(cookieString: string): Promise<any> {
    if (!this.config.apiUrl) {
      throw new Error('API URL not configured');
    }

    const headers = {
      'accept': 'application/json',
      'user-agent': this.config.userAgent,
      'cookie': cookieString,
      ...this.config.headers
    };

    return await this.pageUtils.makeApiCall(this.config.apiUrl, headers);
  }

  /**
   * Save API response using shared logic
   */
  protected async saveResponse(json: any): Promise<string> {
    const filename = this.getResponseFilename();
    return await this.pageUtils.saveJsonResponse(json, filename);
  }

  /**
   * Get screenshot prefix for this scraper (to be overridden by subclasses)
   */
  protected abstract getScreenshotPrefix(): string;

  /**
   * Get response filename for this scraper (to be overridden by subclasses)
   */
  protected abstract getResponseFilename(): string;
} 