import { Page, ElementHandle } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginSelectors {
  emailInput: string;
  passwordInput: string;
  signInButton: string;
  continueButton?: string;
}

export class PageUtils {
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

  async takeScreenshotWithTimestamp(baseName: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${baseName}-${timestamp}.png`;
    const filePath = path.join(process.cwd(), fileName);
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async typeText(selector: string, text: string) {
    await this.waitForElement(selector);
    await this.page.type(selector, text);
  }

  async clickElement(selector: string) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async waitForNavigation(timeout: number = 10000) {
    await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout });
  }

  async waitForTimeout(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  async getElementText(selector: string): Promise<string> {
    await this.waitForElement(selector);
    return await this.page.$eval(selector, el => el.textContent || '');
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.waitForElement(selector, 5000);
      return await this.page.$eval(selector, el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && (el as HTMLElement).offsetParent !== null;
      });
    } catch {
      return false;
    }
  }

  async performLogin(
    loginUrl: string, 
    credentials: LoginCredentials, 
    selectors: LoginSelectors,
    screenshotPrefix: string = 'login'
  ): Promise<void> {
    // Step 1: Navigate to login page
    await this.navigateTo(loginUrl);
    await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-page`);

    try {
      // Step 2: Enter email
      await this.typeText(selectors.emailInput, credentials.email);
      await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-email-entered`);

      // Step 3: Click continue button if it exists
      if (selectors.continueButton) {
        await this.clickElement(selectors.continueButton);
        await this.waitForTimeout(2000);
        await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-continue-clicked`);
      }

      // Step 4: Enter password
      await this.typeText(selectors.passwordInput, credentials.password);
      await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-password-entered`);

      // Step 5: Click sign in button
      await this.clickElement(selectors.signInButton);
      await this.waitForNavigation();
      await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-completed`);

      // Step 6: Wait for any redirects
      await this.waitForTimeout(3000);
      await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-post-login`);

      // Step 7: Detect and skip mobile number prompt if present (simplified)
      const mobileSkipXPath = '//*[@id="__next"]/div/div/div/div[1]/div/div[2]/div/div/a';
      try {
        // Wait for the element to be present
        await this.page.waitForXPath(mobileSkipXPath, { timeout: 5000 });
        const [skipElem] = await this.page.$x(mobileSkipXPath);
        if (skipElem) {
          await (skipElem as ElementHandle<Element>).click();
          await this.waitForTimeout(2000);
          await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-mobile-skip-clicked`);
        }
      } catch (error) {
        // If element not found, continue without error
        // eslint-disable-next-line no-console
        console.log('Mobile skip element not found, continuing...');
      }

    } catch (error) {
      await this.takeScreenshotWithTimestamp(`${screenshotPrefix}-error`);
      throw new Error(`Login process failed: ${error}`);
    }
  }

  async saveJsonResponse(data: any, filename: string): Promise<string> {
    const outputPath = path.join(process.cwd(), filename);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
  }

  async makeApiCall(url: string, headers: Record<string, string>): Promise<any> {
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    return await response.json();
  }
} 