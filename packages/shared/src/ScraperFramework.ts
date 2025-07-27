import { IScraper } from '../../types/src/IScraper';
import { LoginCredentials } from './PageUtils';

export interface ScraperTask {
  name: string;
  scraper: IScraper;
  credentials?: LoginCredentials;
  enabled?: boolean;
}

export interface ScraperFrameworkConfig {
  intervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
}

export class ScraperFramework {
  private tasks: ScraperTask[] = [];
  private config: ScraperFrameworkConfig;
  private isRunning = false;

  constructor(config: Partial<ScraperFrameworkConfig> = {}) {
    this.config = {
      intervalMs: 10 * 60 * 1000, // 10 minutes
      maxRetries: 3,
      retryDelayMs: 5000,
      ...config
    };
  }

  /**
   * Add a scraper task to the framework
   */
  addTask(task: ScraperTask): this {
    this.tasks.push({ ...task, enabled: task.enabled !== false });
    return this;
  }

  /**
   * Execute a single task with retry logic
   */
  private async executeTask(task: ScraperTask): Promise<any> {
    let retries = 0;
    
    while (retries <= this.config.maxRetries) {
      try {
        console.log(`[${new Date().toISOString()}] Starting ${task.name} scrape...`);
        const result = await task.scraper.scrape();
        console.log(`[${new Date().toISOString()}] ${task.name} scraping completed successfully!`);
        return result;
      } catch (error) {
        retries++;
        
        if (retries > this.config.maxRetries) {
          console.error(`[${new Date().toISOString()}] ${task.name} scraping failed after ${this.config.maxRetries} retries:`, error);
          throw error;
        }
        
        console.warn(`[${new Date().toISOString()}] ${task.name} scraping failed, retrying in ${this.config.retryDelayMs}ms (attempt ${retries}/${this.config.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
      }
    }
  }

  /**
   * Execute all enabled tasks
   */
  private async executeAllTasks(): Promise<void> {
    const enabledTasks = this.tasks.filter(task => task.enabled);
    
    if (enabledTasks.length === 0) {
      console.warn('[WARN] No enabled tasks found');
      return;
    }

    for (const task of enabledTasks) {
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during ${task.name} scraping:`, error);
      }
    }
  }

  /**
   * Start the framework daemon
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Framework is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Simple Scraper Framework...');

    while (this.isRunning) {
      try {
        await this.executeAllTasks();
        console.log(`[${new Date().toISOString()}] All tasks completed. Waiting ${this.config.intervalMs}ms for next run...`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error during task execution:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, this.config.intervalMs));
    }
  }

  /**
   * Stop the framework daemon
   */
  stop(): void {
    this.isRunning = false;
    console.log('Stopping Simple Scraper Framework...');
  }

  /**
   * Execute tasks once (without daemon mode)
   */
  async runOnce(): Promise<void> {
    await this.executeAllTasks();
  }
} 