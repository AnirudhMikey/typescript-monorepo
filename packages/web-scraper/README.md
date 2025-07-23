# Target Scraper

A professional web scraper for Target.com built with clean architecture principles and reusable components.

## 🏗️ Architecture

This scraper follows a clean, professional architecture:

- **Shared Package**: Contains all reusable utilities (`PageUtils`, `BaseScraperUtils`)
- **Web Scraper Package**: Contains Target-specific implementation
- **Config Folder**: All configuration (database, credentials, etc.) is in `src/config/`
- **No Code Duplication**: All common functionality is in the shared package
- **Type Safety**: Full TypeScript support with proper interfaces
- **MySQL Persistence**: Scraped data is saved directly to a MySQL database

## ✨ Features

- **🔐 Login Support**: Automated login with credential management
- **📸 Screenshot Recording**: Timestamped screenshots at each step
- **🌐 API Integration**: Direct API calls for data retrieval
- **🛡️ Error Handling**: Comprehensive error handling and logging
- **♻️ Reusable**: Built on shared utilities for easy extension
- **💾 MySQL Storage**: All scraped JSON responses are stored in a MySQL table for later analysis

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Set Up MySQL Database
- Ensure MySQL is running.
- Create the database and table (run once):
```sql
CREATE DATABASE IF NOT EXISTS scraper_db;
USE scraper_db;
CREATE TABLE IF NOT EXISTS scraped_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- You can use the default connection settings or override with environment variables (see below).

### 4. Configure Credentials & Database

#### Config Folder (Recommended)
- All configuration is in `src/config/`:
  - `database.ts`: MySQL connection settings
  - `credentials.ts`: Loads credentials from env or `config.json`

#### Config File Method
Create `config.json` in the web-scraper directory:
```json
{
  "targetEmail": "your-email@example.com",
  "targetPassword": "your-password"
}
```

#### Environment Variables
```bash
export TARGET_EMAIL="your-email@example.com"
export TARGET_PASSWORD="your-password"
export MYSQL_HOST="localhost"
export MYSQL_USER="root"
export MYSQL_PASSWORD=""
export MYSQL_DATABASE="scraper_db"
```

### 5. Run the Scraper
```bash
npx ts-node src/testTargetScraper.ts
```

## 📁 Output Files

The scraper generates organized output files:

### Screenshots
- `target-login-page-*.png` - Login page
- `target-login-email-entered-*.png` - After email entry
- `target-login-continue-clicked-*.png` - After continue button
- `target-login-password-entered-*.png` - After password entry
- `target-login-completed-*.png` - After successful login
- `target-login-post-login-*.png` - After login redirects
- `target-product-page-*.png` - Product page
- `target-product-api-call.png` - Final screenshot

### Data
- `target-api-response.json` - API response data (for local inspection)
- **MySQL Table**: All JSON responses are stored in `scraped_results` in the `scraper_db` database

## ⚙️ Configuration Folder

- `src/config/database.ts`: MySQL connection config
- `src/config/credentials.ts`: Loads credentials from env or config file
- Easily extendable for other config (e.g., S3, logging)

## 🏛️ Code Structure

```
packages/
├── shared/                    # Reusable utilities
│   ├── PageUtils.ts          # Page interaction methods
│   ├── BaseScraperUtils.ts   # Base scraper functionality
│   └── domUtils.ts           # DOM utilities
├── web-scraper/              # Target-specific implementation
│   ├── src/
│   │   ├── config/           # All configuration files
│   │   ├── controllers/      # Controllers
│   │   ├── services/         # Scraper and DB services
│   │   ├── models/           # (Optional) Data models
│   │   └── testTargetScraper.ts  # Entry point
└── types/                    # Type definitions
```

## 🔧 Customization

### Adding New Scrapers
1. Create a new scraper class extending `BaseScraperUtils`
2. Implement abstract methods: `getScreenshotPrefix()` and `getResponseFilename()`
3. Configure your scraper with `ScraperConfig`

### Example New Scraper
```typescript
class AmazonScraperUtils extends BaseScraperUtils {
  protected getScreenshotPrefix(): string {
    return 'amazon';
  }

  protected getResponseFilename(): string {
    return 'amazon-api-response.json';
  }
}
```

## 🛡️ Security

- ✅ Credentials stored in config file (not in code)
- ✅ Config file should be added to `.gitignore`
- ✅ Environment variables for sensitive data
- ✅ No hardcoded credentials

## 📦 Dependencies

- **Puppeteer**: Browser automation
- **TypeDI**: Dependency injection
- **TypeScript**: Type safety
- **MySQL2**: MySQL database driver
- **Shared Package**: Reusable utilities

## 🐛 Troubleshooting

1. **Login Fails**: Check if Target updated their login page selectors
2. **Screenshots Not Generated**: Ensure write permissions in current directory
3. **API Call Fails**: Verify product URL and API endpoint are still valid
4. **Build Errors**: Run `npx tsc -b` to rebuild all packages
5. **MySQL Errors**: Ensure MySQL is running and credentials are correct

## 🎯 Professional Features

- **Clean Architecture**: Separation of concerns
- **DRY Principle**: No code duplication
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management
- **Documentation**: Clear and complete documentation
- **Reusability**: Shared utilities for easy extension
- **Persistence**: All results saved to MySQL for later analysis 