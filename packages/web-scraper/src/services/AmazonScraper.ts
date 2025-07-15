import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { Logger } from '../Logger';
import { IScraper } from 'types/IScraper';
import { ProductInfo } from 'types/ProductInfo';
import { extractAmazonProductInfo } from 'shared/domUtils';

const CONFIG = {
  PRODUCT_URL: 'https://www.amazon.com/dp/B09V3HN1F5',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  SCREENSHOT_FILE: 'amazon-product-api-call.png'
};

@Service()
export class AmazonScraper implements IScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;

  async scrape(): Promise<ProductInfo> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();

    await page.setUserAgent(CONFIG.USER_AGENT);
    await page.goto(CONFIG.PRODUCT_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Use the shared DOM utility inside page.evaluate
    const productInfo: ProductInfo = await page.evaluate((extractFn) => {
      return (0, eval)(`(${extractFn})`)();
    }, extractAmazonProductInfo.toString());

    await page.screenshot({ path: CONFIG.SCREENSHOT_FILE, fullPage: true });
    await this.browserManager.close();

    this.logger.success('Amazon product scraped successfully!');
    return productInfo;
  }
} 