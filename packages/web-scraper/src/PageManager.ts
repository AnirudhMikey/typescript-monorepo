import { Page } from 'puppeteer';
import { Service } from 'typedi';

@Service()
export class PageManager {
  constructor(private page: Page) {}

  async configurePage(userAgent: string, headers: Record<string, string>) {
    await this.page.setUserAgent(userAgent);
    await this.page.setExtraHTTPHeaders(headers);
  }

  async navigateTo(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await this.page.waitForTimeout(3000);
  }

  async getCookies(): Promise<string> {
    const cookies = await this.page.cookies();
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  }

  async takeScreenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }
} 