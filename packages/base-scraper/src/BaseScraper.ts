import { Service } from 'typedi';
import { IScraper } from 'types/src/IScraper';
import { ProductInfo } from 'types/src/ProductInfo';

@Service()
export abstract class BaseScraper implements IScraper {
  abstract scrape(): Promise<ProductInfo>;
} 