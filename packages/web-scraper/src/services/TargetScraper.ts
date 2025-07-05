import { Inject, Service } from 'typedi';
import { BrowserManager } from '../BrowserManager';
import { PageManager } from '../PageManager';
import { Logger } from '../Logger';
import { BaseScraper } from '../base/BaseScraper';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG = {
  PRODUCT_URL: 'https://www.target.com/p/total-by-verizon-prepaid-google-pixel-6a-5g-128gb-black/-/A-89278761#lnk=sametab',
  API_URL: 'https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=9f36aeafbe60771e321a7cc95a78140772ab3e96&tcin=89278761&is_bot=false&store_id=609&pricing_store_id=609&has_pricing_store_id=true&has_financing_options=true&include_obsolete=true&visitor_id=0197C279AE780201912DB5B9F0917706&skip_personalized=true&skip_variation_hierarchy=true&channel=WEB&page=%2Fp%2FA-89278761',
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  SCREENSHOT_FILE: 'target-product-api-call.png'
};

@Service()
export class TargetScraper extends BaseScraper {
  @Inject() private browserManager!: BrowserManager;
  @Inject() private logger!: Logger;

  async scrape(): Promise<any> {
    const browser = await this.browserManager.launch();
    const page = await this.browserManager.newPage();
    const pageManager = new PageManager(page);

    await pageManager.configurePage(CONFIG.USER_AGENT, {
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://www.target.com',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Priority': 'u=1, i'
    });

    await pageManager.navigateTo(CONFIG.PRODUCT_URL);
    const cookieString = await pageManager.getCookies();

    // Make the GET request from Node.js (not page.evaluate)
    const response = await fetch(CONFIG.API_URL, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://www.target.com',
        'priority': 'u=1, i',
        'referer': CONFIG.PRODUCT_URL.split('#')[0],
        'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': CONFIG.USER_AGENT,
        'cookie': cookieString
      }
    });
    const json = await response.json();

    // Save the response to a file
    const outputPath = path.join(process.cwd(), 'target-api-response.json');
    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
    this.logger.success(`Target API response saved to ${outputPath}`);

    await pageManager.takeScreenshot(CONFIG.SCREENSHOT_FILE);
    await this.browserManager.close();

    this.logger.success('Target API response retrieved successfully!');
    return json;
  }
} 