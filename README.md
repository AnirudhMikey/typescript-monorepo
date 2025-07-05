# TypeScript Web Scraper

A web scraper that extracts product information from Target.com using browser automation and API calls.

## What This Code Does

### 1. Browser Setup
- Launches a Chrome browser using Puppeteer
- Sets up a realistic user agent to mimic a real browser
- Configures browser settings for web scraping

### 2. Navigation Process
- Opens the Target.com product page: `https://www.target.com/p/consumer-cellular-motorola-moto-g-play-2024-64gb-sapphire-blue/-/A-90581936`
- Waits for the page to fully load
- Allows 3 seconds for cookies and session data to be established

### 3. Cookie Collection
- Extracts all cookies from the browser session
- Converts cookies into a string format for API requests
- These cookies are essential for authenticating with Target's API

### 4. API Data Extraction
- Makes a direct API call to Target's internal API: `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1`
- Uses the collected cookies for authentication
- Sends specific parameters including:
  - Product TCIN (Target Catalog Item Number): 90581936
  - Store ID: 609
  - API key for authentication
  - Visitor ID for tracking

### 5. Data Processing
- Receives JSON response from Target's API
- Extracts key product information:
  - Product title and description
  - Current price and regular price
  - Brand information
  - Availability status
  - Customer ratings and review count
  - Product TCIN and other identifiers

### 6. Output Generation
- Displays product information in the console
- Saves complete API response to `target-product-data.json`
- Takes a screenshot of the browser session as `target-product-api-call.png`

## Code Structure

### Main Classes

**TargetScraper**: Controls the entire scraping process
- Launches browser
- Orchestrates navigation and data extraction
- Handles errors and cleanup

**BrowserManager**: Manages browser lifecycle
- Launches and closes Chrome browser
- Creates new browser pages

**PageManager**: Handles page operations
- Sets user agent and headers
- Navigates to product page
- Extracts cookies
- Takes screenshots

**TargetAPI**: Manages API interactions
- Builds API URLs with correct parameters
- Makes HTTP requests with proper headers
- Handles API responses

**DataProcessor**: Processes and displays data
- Formats product information for display
- Saves data to files
- Handles data validation

**Logger**: Provides logging functionality
- Console output for info, success, error messages
- Clean, professional logging

## Configuration

The scraper uses these key settings:
- **Product URL**: The specific Target product page to scrape
- **API Key**: Authentication key for Target's API
- **Store ID**: Target store location (609)
- **User Agent**: Browser identification string
- **Output Files**: JSON data file and screenshot file names

## How It Works

1. **Start**: The script launches a Chrome browser
2. **Navigate**: Goes to the Target product page
3. **Wait**: Allows time for page to load and cookies to be set
4. **Extract**: Gets all cookies from the browser session
5. **API Call**: Makes authenticated request to Target's API
6. **Process**: Extracts and formats product data
7. **Output**: Displays results and saves files
8. **Cleanup**: Takes screenshot and keeps browser open

## Technical Details

- **Language**: TypeScript for type safety
- **Browser Automation**: Puppeteer for Chrome control
- **HTTP Requests**: Fetch API for data retrieval
- **File Operations**: Node.js fs module for saving data
- **Error Handling**: Try-catch blocks throughout the code
- **Configuration**: Centralized config object for easy modification

## Output Files

- `target-product-data.json`: Complete API response with product details
- `target-product-api-call.png`: Screenshot of the browser session

## Console Output

The script displays:
- Product name and brand
- Current and regular prices
- Availability status
- Customer rating and review count
- Success/error messages

## Usage

```bash
cd packages/web-scraper
npm install
npx ts-node src/target-scraper.ts
```

<<<<<<< HEAD
This will run the scraper and extract data for the Motorola Moto G Play phone from Target.com. 
=======
This will run the scraper and extract data for the Motorola Moto G Play phone from Target.com. 
>>>>>>> 44b22e399d2753aed5af9ad196ee4980c753416c
