import { Service } from 'typedi';
import { pool } from '../config/mysqlClient';
import { Exception } from 'shared/src/Exception';

@Service()
export class SaveResultService {
  async saveResult(data: any): Promise<number> {
    try {
      const [result]: any = await pool.query(
        'INSERT INTO scraped_results (data) VALUES (?)',
        [JSON.stringify(data)]
      );
      return result.insertId;
    } catch (err) {
      console.error('MySQL Save Error:', err);
      console.error('Data attempted to save:', data);
      throw new Exception('Failed to save result to MySQL', 500, err);
    }
  }
} 