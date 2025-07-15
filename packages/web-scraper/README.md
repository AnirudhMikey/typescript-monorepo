# Target Scraper

A professional web scraper for Target.com built with clean architecture principles and reusable components.

## 🏗️ Architecture

This scraper follows a clean, professional architecture:

- **Shared Package**: Contains all reusable utilities (`PageUtils`, `BaseScraperUtils`)
- **Web Scraper Package**: Contains Target-specific implementation
- **No Code Duplication**: All common functionality is in the shared package
- **Type Safety**: Full TypeScript support with proper interfaces

## ✨ Features

- **🔐 Login Support**: Automated login with credential management
- **📸 Screenshot Recording**: Timestamped screenshots at each step
- **🌐 API Integration**: Direct API calls for data retrieval
- **🛡️ Error Handling**: Comprehensive error handling and logging
- **♻️ Reusable**: Built on shared utilities for easy extension

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run the Scraper

#### With Login (Recommended)
```bash
# Using config file
npx ts-node src/testTargetScraper.ts

# Using environment variables
TARGET_EMAIL="your-email@example.com" TARGET_PASSWORD="your-password" npx ts-node src/testTargetScraper.ts
```

#### Without Login (Anonymous)
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
- `target-api-response.json` - API response data

## ⚙️ Configuration

### Config File Method (Recommended)
Create `config.json` in the web-scraper directory:
```json
{
  "targetEmail": "your-email@example.com",
  "targetPassword": "your-password"
}
```

### Environment Variables
```bash
export TARGET_EMAIL="your-email@example.com"
export TARGET_PASSWORD="your-password"
```

## 🏛️ Code Structure

```
packages/
├── shared/                    # Reusable utilities
│   ├── PageUtils.ts          # Page interaction methods
│   ├── BaseScraperUtils.ts   # Base scraper functionality
│   └── domUtils.ts           # DOM utilities
├── web-scraper/              # Target-specific implementation
│   ├── TargetScraper.ts      # Target scraper (clean & minimal)
│   └── testTargetScraper.ts  # Test runner
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
- **Shared Package**: Reusable utilities

## 🐛 Troubleshooting

1. **Login Fails**: Check if Target updated their login page selectors
2. **Screenshots Not Generated**: Ensure write permissions in current directory
3. **API Call Fails**: Verify product URL and API endpoint are still valid
4. **Build Errors**: Run `npx tsc -b` to rebuild all packages

## 🎯 Professional Features

- **Clean Architecture**: Separation of concerns
- **DRY Principle**: No code duplication
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management
- **Documentation**: Clear and complete documentation
- **Reusability**: Shared utilities for easy extension 