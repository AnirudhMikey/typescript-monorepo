import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// AWS Configuration with defaults
const AWS_REGION = process.env.AWS_REGION || 'us-west-2';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// S3 Configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'crawl-data-target';
const BUCKET_PREFIX = process.env.S3_BUCKET_PREFIX || 'crawl-data/';

// Initialize S3 client with credentials
const s3 = new S3Client({ 
  region: AWS_REGION,
  ...(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  })
});

export async function uploadToS3(localFilePath: string, s3FileName: string): Promise<string> {
  // Check if file exists
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Local file not found: ${localFilePath}`);
  }
  
  const fileContent = fs.readFileSync(localFilePath);
  const s3Key = `${BUCKET_PREFIX}${s3FileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
  });
  try {
    await s3.send(command);
    console.log(`Successfully uploaded to s3://${BUCKET_NAME}/${s3Key}`);
    return `s3://${BUCKET_NAME}/${s3Key}`;
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
} 