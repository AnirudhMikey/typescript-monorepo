import puppeteer, { Browser } from 'puppeteer';
import { Service } from 'typedi';

@Service()
export class BrowserManager {
  private browser: Browser | null = null;

  async launch(): Promise<Browser> {
    try {
      console.log('Launching Puppeteer browser...');
      this.browser = await puppeteer.launch({
        headless: false,
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
      });
      console.log('Browser launched!');
      return this.browser;
    } catch (err) {
      console.error('Failed to launch browser:', err);
      throw err;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async newPage() {
    if (!this.browser) throw new Error('Browser not initialized');
    return await this.browser.newPage();
  }
} 