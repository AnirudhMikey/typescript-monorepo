import * as fs from 'fs';
import * as path from 'path';

export class TargetModel {
  saveApiResponse(data: any, filename: string = 'target-api-response.json') {
    const outputPath = path.join(process.cwd(), filename);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
  }
} 