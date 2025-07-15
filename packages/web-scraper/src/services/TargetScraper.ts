import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { Logger } from '../Logger';
import { IScraper } from 'types/IScraper';
import { BaseScraperUtils, ScraperConfig, LoginCredentials } from 'shared';

const TARGET_CONFIG: ScraperConfig = {
  loginUrl: 'https://www.target.com/account/signin',
  productUrl: 'https://www.target.com/p/total-by-verizon-prepaid-google-pixel-6a-5g-128gb-black/-/A-89278761#lnk=sametab',
  apiUrl: 'https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=89278761&is_bot=false&store_id=609&pricing_store_id=609&has_pricing_store_id=true&has_financing_options=true&include_obsolete=true&visitor_id=0197C279AE780201912DB5B9F0917706&skip_personalized=true&skip_variation_hierarchy=true&channel=WEB&page=%2Fp%2FA-89278761',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  screenshotFile: 'target-product-api-call.png',
  loginSelectors: {
    emailInput: 'input[type="email"], input[name="username"], #username',
    passwordInput: 'input[type="password"], input[name="password"], #password',
    signInButton: 'button[type="submit"], input[type="submit"], .signin-button, #signin-button',
    continueButton: 'button[type="submit"], .continue-button, #continue-button'
  },
  headers: {
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.target.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'Priority': 'u=1, i'
  }
};

class TargetScraperUtils extends BaseScraperUtils {
  protected getScreenshotPrefix(): string {
    return 'target';
  }

  protected getResponseFilename(): string {
    return 'target-api-response.json';
  }
}

@Service()
export class TargetScraper implements IScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;
  private scraperUtils!: TargetScraperUtils;

  async scrape(credentials?: LoginCredentials): Promise<any> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();
    
    this.scraperUtils = new TargetScraperUtils(page, TARGET_CONFIG);

    try {
      const result = await this.scraperUtils.scrape(credentials);
      this.logger.success('Target scraping completed successfully!');
      return result;
    } finally {
      await this.browserManager.close();
    }
  }
} 