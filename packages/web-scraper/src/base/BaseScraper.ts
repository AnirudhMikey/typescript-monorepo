import { Service } from 'typedi';
import { IScraper } from 'types/IScraper';
import { ProductInfo } from 'types/ProductInfo';

@Service()
export abstract class BaseScraper implements IScraper {
  abstract scrape(): Promise<ProductInfo>;
} 