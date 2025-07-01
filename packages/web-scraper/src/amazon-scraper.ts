import puppeteer, { Browser, Page } from 'puppeteer';

const AMAZON_PRODUCT_URL = 'https://www.amazon.com/SUPFINE-Compatible-Protection-Translucent-Anti-Fingerprint/dp/B0D9VS4PV7/ref=sr_1_1?crid=12KQA6DZ8L1LD&dib=eyJ2IjoiMSJ9.6ZUg5qPoZEJ0ug-7GjLdD-1RDUE2VMp21YsjppMwWzaiJnRMzLHGCZgSAG3-PwhLQBvNBONejLVkGnaQ-0sGt_r-9d_bgidUkN0RexFiM6AzKyufp8liLJfcAKYjUR_Weq9gt6Etz7o2HhV5tooudw2KXdk8STJGJD1bNqmixgkCt0ZPeuNi06imnKqd7B5xIvv57V76SFxs1nFEoQhMF94_TIilT9R7kAupaNrvszQ.eSpNYpRRYVi6HJdPwcgKn4dYkejzBasEeX2Kekspf3Q&dib_tag=se&keywords=phone%2Bcase&qid=1751143338&sprefix=phone%2Caps%2C241&sr=8-1&th=1';

async function scrapeAmazonProduct(): Promise<void> {
  let browser: Browser | null = null;
  
  try {
    console.log('🚀 Launching Chrome browser...');
    
    // Launch browser with specific options to avoid detection
    browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      ]
    });

    const page: Page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    
    // Set extra headers to mimic real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    console.log('📱 Navigating to Amazon product page...');
    console.log(`🔗 URL: ${AMAZON_PRODUCT_URL}`);
    
    // Navigate to the Amazon product page
    await page.goto(AMAZON_PRODUCT_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ Successfully loaded the page!');
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    // Extract product information
    console.log('🔍 Extracting product information...');
    
    const productInfo = await page.evaluate(() => {
      // Get product title
      const titleElement = document.querySelector('#productTitle') || 
                          document.querySelector('h1') ||
                          document.querySelector('[data-automation-id="product-title"]');
      const title = titleElement?.textContent?.trim() || 'Title not found';

      // Get price
      const priceElement = document.querySelector('.a-price-whole') ||
                          document.querySelector('.a-price .a-offscreen') ||
                          document.querySelector('[data-automation-id="product-price"]');
      const price = priceElement?.textContent?.trim() || 'Price not found';

      // Get rating
      const ratingElement = document.querySelector('.a-icon-alt') ||
                           document.querySelector('[data-automation-id="product-rating"]');
      const rating = ratingElement?.textContent?.trim() || 'Rating not found';

      // Get availability
      const availabilityElement = document.querySelector('#availability') ||
                                 document.querySelector('[data-automation-id="availability"]');
      const availability = availabilityElement?.textContent?.trim() || 'Availability not found';

      // Get ASIN from URL
      const url = window.location.href;
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
      const asin = asinMatch ? asinMatch[1] : 'ASIN not found';

      return {
        title,
        price,
        rating,
        availability,
        asin,
        url
      };
    });

    console.log('📊 Product Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 Product: ${productInfo.title}`);
    console.log(`💰 Price: ${productInfo.price}`);
    console.log(`⭐ Rating: ${productInfo.rating}`);
    console.log(`📦 Availability: ${productInfo.availability}`);
    console.log(`🆔 ASIN: ${productInfo.asin}`);
    console.log(`🔗 URL: ${productInfo.url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Add product to cart
    console.log('🛒 Adding product to cart...');
    
    try {
      // Use the specific XPath for the "Add to Cart" button
      const addToCartXPath = '//*[@id="add-to-cart-button"]';
      
      console.log('🔍 Looking for "Add to Cart" button using XPath...');
      const addToCartButton = await page.$x(addToCartXPath);
      
      if (addToCartButton.length > 0) {
        console.log('✅ Found "Add to Cart" button using XPath, clicking...');
        await (addToCartButton[0] as any).click();
        
        // Wait for the cart to update
        await page.waitForTimeout(3000);
        
        // Check if item was added successfully
        const addedToCart = await page.evaluate(() => {
          // Look for success indicators
          const successIndicator = document.querySelector('.a-alert-success') ||
                                  document.querySelector('[data-automation-id="add-to-cart-success"]') ||
                                  document.querySelector('.a-alert-content');
          
          return successIndicator !== null;
        });
        
        if (addedToCart) {
          console.log('✅ Product successfully added to cart!');
          
          // Wait a bit for the cart to fully update
          await page.waitForTimeout(2000);
          
          // Proceed to checkout
          console.log('🛒 Proceeding to checkout...');
          const checkoutXPath = '//*[@id="sc-buy-box-ptc-button"]/span/input';
          
          console.log('🔍 Looking for checkout button using XPath...');
          const checkoutButton = await page.$x(checkoutXPath);
          
          if (checkoutButton.length > 0) {
            console.log('✅ Found checkout button using XPath, clicking...');
            await (checkoutButton[0] as any).click();
            
            // Wait for checkout page to load
            await page.waitForTimeout(3000);
            console.log('✅ Successfully navigated to checkout page!');
          } else {
            console.log('❌ Could not find checkout button using XPath');
          }
        } else {
          console.log('⚠️ Product may have been added, but no clear success indicator found');
        }
      } else {
        console.log('❌ Could not find "Add to Cart" button using XPath');
      }
      
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
    }

    // Take a screenshot after adding to cart
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'amazon-product-added-to-cart.png',
      fullPage: true 
    });
    console.log('💾 Screenshot saved as: amazon-product-added-to-cart.png');

    // Keep the browser open until user manually closes it
    console.log('🔄 Browser will stay open until you manually close it...');
    console.log('💡 You can now interact with the page manually!');
    
    // Don't close the browser automatically - let user control it
    // await browser.close();

  } catch (error) {
    console.error('❌ Error occurred:', error);
  }
}

// Run the scraper
if (require.main === module) {
  scrapeAmazonProduct()
    .then(() => {
      console.log('✅ Scraping and cart addition completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Scraping failed:', error);
      process.exit(1);
    });
}

export { scrapeAmazonProduct }; 