export function getTextBySelectors(selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) return el.textContent.trim();
  }
  return null;
} 