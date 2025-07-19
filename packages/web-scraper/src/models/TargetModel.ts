import * as fs from 'fs';
import * as path from 'path';
import { uploadToS3 } from 'shared/s3Utils';

export class TargetModel {
  async saveApiResponse(data: any, filename: string = 'target-api-response.json') {
    const outputPath = path.join(process.cwd(), filename);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    // Upload to S3
    const s3Uri = await uploadToS3(outputPath, filename);
    return { localPath: outputPath, s3Uri };
  }
} 