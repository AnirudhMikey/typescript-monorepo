import { ProductInfo } from './ProductInfo';

export interface IScraper {
  scrape(): Promise<ProductInfo>;
} 