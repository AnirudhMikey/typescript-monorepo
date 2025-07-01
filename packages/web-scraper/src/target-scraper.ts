import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// Configuration constants
const CONFIG = {
  TARGET_API_URL: 'https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1',
  PRODUCT_TCIN: '90581936',
  PRODUCT_URL: 'https://www.target.com/p/consumer-cellular-motorola-moto-g-play-2024-64gb-sapphire-blue/-/A-90581936#lnk=sametab',
  API_KEY: '9f36aeafbe60771e321a7cc95a78140772ab3e96',
  STORE_ID: '609',
  VISITOR_ID: '0197C279AE780201912DB5B9F0917706',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  OUTPUT_FILE: 'target-product-data.json',
  SCREENSHOT_FILE: 'target-product-api-call.png'
} as const;

// Browser configuration
const BROWSER_OPTIONS = {
  headless: false, // Set to true for production
  defaultViewport: { width: 1920, height: 1080 },
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
};

// HTTP headers configuration
const HTTP_HEADERS = {
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.target.com',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'Priority': 'u=1, i'
} as const;

// Types
interface ProductData {
  data?: {
    product?: {
      item?: {
        product_description?: { title?: string };
        tcin?: string;
        brand?: string;
      };
      price?: {
        current_retail?: number;
        reg_retail?: number;
      };
      fulfillment?: {
        shipping_options?: {
          availability_status?: string;
        };
      };
      ratings_and_reviews?: {
        statistics?: {
          rating?: number;
          review_count?: number;
        };
      };
    };
  };
}

interface ScrapingResult {
  success: boolean;
  data?: ProductData;
  error?: string;
}

// Utility functions
class Logger {
  static info(message: string): void {
    console.log(message);
  }

  static success(message: string): void {
    console.log(message);
  }

  static error(message: string): void {
    console.error(message);
  }

  static warning(message: string): void {
    console.warn(message);
  }
}

class BrowserManager {
  private browser: Browser | null = null;

  async launch(): Promise<Browser> {
    this.browser = await puppeteer.launch(BROWSER_OPTIONS);
    return this.browser;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    return await this.browser.newPage();
  }
}

class PageManager {
  constructor(private page: Page) {}

  async configurePage(): Promise<void> {
    await this.page.setUserAgent(CONFIG.USER_AGENT);
    await this.page.setExtraHTTPHeaders(HTTP_HEADERS);
  }

  async navigateToProduct(): Promise<void> {
    await this.page.goto(CONFIG.PRODUCT_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for cookies and session to be established
    await this.page.waitForTimeout(3000);
  }

  async getCookies(): Promise<string> {
    const cookies = await this.page.cookies();
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  }

  async takeScreenshot(): Promise<void> {
    await this.page.screenshot({ 
      path: CONFIG.SCREENSHOT_FILE,
      fullPage: true 
    });
  }
}

class TargetAPI {
  static buildApiUrl(): string {
    const params = new URLSearchParams({
      key: CONFIG.API_KEY,
      tcin: CONFIG.PRODUCT_TCIN,
      is_bot: 'false',
      store_id: CONFIG.STORE_ID,
      pricing_store_id: CONFIG.STORE_ID,
      has_pricing_store_id: 'true',
      has_financing_options: 'true',
      include_obsolete: 'true',
      visitor_id: CONFIG.VISITOR_ID,
      skip_personalized: 'true',
      skip_variation_hierarchy: 'true',
      channel: 'WEB',
      page: `/p/A-${CONFIG.PRODUCT_TCIN}`
    });

    return `${CONFIG.TARGET_API_URL}?${params.toString()}`;
  }

  static async fetchProductData(cookieString: string): Promise<ProductData> {
    const apiUrl = this.buildApiUrl();

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.target.com',
        'Referer': 'https://www.target.com/',
        'User-Agent': CONFIG.USER_AGENT,
        'Cookie': cookieString
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }
}

class DataProcessor {
  static displayProductInfo(productData: ProductData): void {
    Logger.success('Product data retrieved successfully!');

    if (!productData.data?.product) {
      Logger.error('Product data structure not found in API response');
      return;
    }

    const product = productData.data.product;
    const item = product.item;
    const price = product.price;
    const fulfillment = product.fulfillment;
    const ratings = product.ratings_and_reviews;

    // Basic product info
    Logger.info(`Product: ${item?.product_description?.title || 'Title not found'}`);
    Logger.info(`TCIN: ${item?.tcin || 'TCIN not found'}`);
    Logger.info(`Brand: ${item?.brand || 'Brand not found'}`);

    // Price information
    if (price) {
      Logger.info(`Price: $${price.current_retail || 'Price not found'}`);
      if (price.current_retail !== price.reg_retail) {
        Logger.info(`Regular Price: $${price.reg_retail || 'N/A'}`);
      }
    }

    // Availability
    if (fulfillment) {
      Logger.info(`Availability: ${fulfillment.shipping_options?.availability_status || 'Availability not found'}`);
    }

    // Rating
    if (ratings?.statistics) {
      const stats = ratings.statistics;
      Logger.info(`Rating: ${stats.rating || 'N/A'} out of 5 (${stats.review_count || 0} reviews)`);
    }
  }

  static saveToFile(data: ProductData): void {
    try {
      fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      Logger.error(`Failed to save data: ${(error as Error).message}`);
    }
  }
}

// Main scraper class
class TargetScraper {
  private browserManager: BrowserManager;
  private pageManager: PageManager | null = null;

  constructor() {
    this.browserManager = new BrowserManager();
  }

  async scrape(): Promise<ScrapingResult> {
    try {
      // Launch browser and create page
      const browser = await this.browserManager.launch();
      const page = await this.browserManager.newPage();
      this.pageManager = new PageManager(page);

      // Configure and navigate
      await this.pageManager.configurePage();
      await this.pageManager.navigateToProduct();

      // Get cookies and make API call
      const cookieString = await this.pageManager.getCookies();
      const productData = await TargetAPI.fetchProductData(cookieString);

      // Process and display data
      DataProcessor.displayProductInfo(productData);
      DataProcessor.saveToFile(productData);

      // Take screenshot
      await this.pageManager.takeScreenshot();

      return { success: true, data: productData };

    } catch (error) {
      const errorMessage = (error as Error).message;
      Logger.error(`Scraping failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  async cleanup(): Promise<void> {
    await this.browserManager.close();
  }
}

// Main execution function
async function scrapeTargetProduct(): Promise<void> {
  const scraper = new TargetScraper();
  
  try {
    const result = await scraper.scrape();
    
    if (result.success) {
      Logger.success('Target API call completed successfully!');
    } else {
      Logger.error('Target API call failed');
      process.exit(1);
    }
  } catch (error) {
    Logger.error(`Unexpected error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Export for module usage
export { scrapeTargetProduct, TargetScraper, CONFIG };

// Run if this is the main module
if (require.main === module) {
  scrapeTargetProduct()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      Logger.error(`Script execution failed: ${(error as Error).message}`);
      process.exit(1);
    });
} 