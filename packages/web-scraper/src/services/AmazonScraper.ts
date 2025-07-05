import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { PageManager } from '../PageManager';
import { Logger } from '../Logger';
import { BaseScraper } from '../base/BaseScraper';
import { ProductInfo } from 'types/ProductInfo';

const CONFIG = {
  PRODUCT_URL: 'https://www.amazon.com/dp/B09V3HN1F5',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  SCREENSHOT_FILE: 'amazon-product-api-call.png'
};

@Service()
export class AmazonScraper extends BaseScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;

  async scrape(): Promise<ProductInfo> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();
    const pageManager = new PageManager(page);

    await pageManager.configurePage(CONFIG.USER_AGENT, {});
    await pageManager.navigateTo(CONFIG.PRODUCT_URL);

    // Use the shared DOM utility inside page.evaluate
    const productInfo: ProductInfo = await page.evaluate(() => {
      function getTextBySelectors(selectors: string[]): string | null {
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el && el.textContent) return el.textContent.trim();
        }
        return null;
      }

      return {
        title: getTextBySelectors(['#productTitle', 'h1', '[data-automation-id="product-title"]']) || 'Title not found',
        price: getTextBySelectors(['.a-price-whole', '.a-price .a-offscreen', '[data-automation-id="product-price"]']) || 'Price not found',
        rating: getTextBySelectors(['.a-icon-alt', '[data-automation-id="product-rating"]']) || 'Rating not found',
        availability: getTextBySelectors(['#availability', '[data-automation-id="availability"]']) || 'Availability not found'
      };
    });

    await pageManager.takeScreenshot(CONFIG.SCREENSHOT_FILE);
    await this.browserManager.close();

    this.logger.success('Amazon product scraped successfully!');
    return productInfo;
  }
} 