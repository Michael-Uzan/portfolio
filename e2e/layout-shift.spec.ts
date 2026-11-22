import { expect, test } from '@playwright/test';

/** Lighthouse's "good" CLS threshold. */
const MAX_CLS = 0.1;
/** Font delay long enough that the page paints with fallback fonts first, as on a real network. */
const FONT_DELAY_MS = 800;

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

declare global {
  interface Window {
    __cls: number;
  }
}

test('home page does not shift layout when the web fonts arrive late', async ({ page }) => {
  // Locally fonts load instantly and would hide a font-swap shift, so delay them.
  await page.route('**/*.woff2', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, FONT_DELAY_MS));
    await route.continue();
  });
  // Start observing before any script runs so the very first shifts are counted.
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) window.__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Wait past the delayed font responses so any swap has happened (or been skipped).
  await page.waitForTimeout(FONT_DELAY_MS + 700);

  expect(await page.evaluate(() => window.__cls)).toBeLessThan(MAX_CLS);
});
