export function getTextBySelectors(selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) return el.textContent.trim();
  }
  return null;
}

export function extractAmazonProductInfo() {
  function getTextBySelectors(selectors: string[]): string | null {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) return el.textContent.trim();
    }
    return null;
  }
  return {
    title: getTextBySelectors(['#productTitle', 'h1', '[data-automation-id="product-title"]']) || 'Title not found',
    price: getTextBySelectors(['.a-price-whole', '.a-price .a-offscreen', '[data-automation-id="product-price"]']) || 'Price not found',
    rating: getTextBySelectors(['.a-icon-alt', '[data-automation-id="product-rating"]']) || 'Rating not found',
    availability: getTextBySelectors(['#availability', '[data-automation-id="availability"]']) || 'Availability not found'
  };
}

export interface JobPosting {
  title: string;
  company: string;
  location: string;
  postedTime: string;
  jobType?: string;
  salary?: string;
}

export interface LinkedInData {
  jobPostings: JobPosting[];
  totalResults?: string;
  searchKeywords: string;
  searchLocation: string;
}

export function extractLinkedInJobData(): LinkedInData {
  function getTextBySelectors(selectors: string[]): string | null {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent) return el.textContent.trim();
    }
    return null;
  }

  const jobCards = document.querySelectorAll('.job-search-card');
  const jobPostings: JobPosting[] = [];

  jobCards.forEach((card, index) => {
    if (index >= 10) return; // Limit to first 10 jobs

    const title = getTextBySelectors([
      '.job-search-card__title',
      'h3',
      '[data-testid="job-search-card__title"]'
    ]);

    const company = getTextBySelectors([
      '.job-search-card__subtitle',
      '.job-search-card__company-name',
      '[data-testid="job-search-card__company-name"]'
    ]);

    const location = getTextBySelectors([
      '.job-search-card__location',
      '.job-search-card__subtitle + div',
      '[data-testid="job-search-card__location"]'
    ]);

    const postedTime = getTextBySelectors([
      '.job-search-card__listdate',
      '.job-search-card__time-badge',
      '[data-testid="job-search-card__listdate"]'
    ]);

    if (title && company) {
      jobPostings.push({
        title: title,
        company: company,
        location: location || 'Location not specified',
        postedTime: postedTime || 'Time not specified'
      });
    }
  });

  // Extract search metadata
  const searchKeywords = getTextBySelectors([
    '.search-reusables__filter-binary-toggle',
    '[data-testid="search-keywords"]'
  ]) || 'Software Engineer';

  const searchLocation = getTextBySelectors([
    '.search-reusables__filter-binary-toggle + div',
    '[data-testid="search-location"]'
  ]) || 'United States';

  const totalResults = getTextBySelectors([
    '.results-context-header__job-count',
    '.search-results__total-count',
    '[data-testid="results-count"]'
  ]);

  return {
    jobPostings,
    totalResults: totalResults || undefined,
    searchKeywords,
    searchLocation
  };
} 