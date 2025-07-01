# TypeScript Web Scraper Monorepo

A professional web scraping solution built with TypeScript and Puppeteer for extracting product data from e-commerce websites.

## 🚀 Features

- **Target.com Scraper**: Extract product information, pricing, and availability
- **Amazon Scraper**: Scrape product details and cart functionality
- **Professional Architecture**: Clean, maintainable code with proper separation of concerns
- **Type Safety**: Full TypeScript support with interfaces and type checking
- **Error Handling**: Robust error handling and logging

## 📦 Project Structure

```
typescript-monorepo/
├── packages/
│   └── web-scraper/
│       ├── src/
│       │   ├── target-scraper.ts    # Target.com product scraper
│       │   └── amazon-scraper.ts    # Amazon product scraper
│       ├── package.json
│       └── tsconfig.json
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd typescript-monorepo
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd packages/web-scraper
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## 🎯 Usage

### Target.com Scraper

```bash
cd packages/web-scraper
npm run start:target
```

This will:
- Launch a Chrome browser
- Navigate to the Target product page
- Extract product information (title, price, availability, ratings)
- Save data to `target-product-data.json`
- Take a screenshot of the process

### Amazon Scraper

```bash
cd packages/web-scraper
npm run start:amazon
```

## 📊 Output

The scrapers generate:
- **JSON files**: Structured product data
- **Screenshots**: Visual documentation of the scraping process
- **Console output**: Real-time progress and results

## 🔧 Configuration

Key configuration options in `packages/web-scraper/src/target-scraper.ts`:

```typescript
const CONFIG = {
  TARGET_API_URL: 'https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1',
  PRODUCT_TCIN: '90581936',
  PRODUCT_URL: 'https://www.target.com/p/consumer-cellular-motorola-moto-g-play-2024-64gb-sapphire-blue/-/A-90581936#lnk=sametab',
  // ... more config options
};
```

## 🏗️ Architecture

The project follows professional software engineering practices:

- **Class-based design**: Separation of concerns with dedicated classes
- **Type safety**: TypeScript interfaces for data structures
- **Error handling**: Comprehensive try-catch blocks
- **Logging**: Professional logging system
- **Configuration management**: Centralized configuration

### Key Classes

- `TargetScraper`: Main orchestrator
- `BrowserManager`: Browser lifecycle management
- `PageManager`: Page operations and navigation
- `TargetAPI`: API calls and data fetching
- `DataProcessor`: Data processing and display
- `Logger`: Professional logging utilities

## 🚨 Important Notes

- **Browser automation**: Uses Puppeteer with headless mode disabled for debugging
- **Rate limiting**: Respect website terms of service and implement delays
- **Legal compliance**: Ensure scraping complies with website terms of service
- **Production use**: Set `headless: true` for production deployments

## 📝 License

This project is for educational and personal use. Please respect website terms of service when scraping.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue on GitHub. 