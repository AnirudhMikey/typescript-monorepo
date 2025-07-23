import * as fs from 'fs';
import * as path from 'path';

export function getCredentials() {
  const email = process.env.TARGET_EMAIL;
  const password = process.env.TARGET_PASSWORD;
  if (email && password) {
    return { email, password };
  }
  const configPath = path.join(process.cwd(), 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.targetEmail && config.targetPassword) {
        return { email: config.targetEmail, password: config.targetPassword };
      }
    } catch (error) {
      // handle error or throw
    }
  }
  return undefined;
} 