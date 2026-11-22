import { expect, test } from '@playwright/test';

test.describe('journey', () => {
  test('shows the title and the milestone list', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeVisible();
    await expect(
      page.getByRole('list', { name: 'Career milestones' }).getByRole('listitem').first(),
    ).toBeAttached();
  });

  test('scrolling to the end activates the last milestone', async ({ page }) => {
    await page.goto('/');
    const stations = page.getByRole('list', { name: 'Career milestones' }).getByRole('button');
    await expect(stations.first()).toHaveAttribute('aria-current', 'step');

    // Re-scroll on each attempt: a scroll issued before ScrollTrigger has added the pin
    // spacer only reaches the unpinned page height and never hits the end of the journey.
    await expect(async () => {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await expect(stations.last()).toHaveAttribute('aria-current', 'step', { timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  });

  test('selecting a station activates that exact station', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop',
      'station buttons are only scroll-driven on desktop',
    );
    await page.goto('/');
    const stations = page.getByRole('list', { name: 'Career milestones' }).getByRole('button');
    await expect(stations.first()).toHaveAttribute('aria-current', 'step');
    const count = await stations.count();
    for (let i = 0; i < count; i++) {
      const button = stations.nth(i);
      await button.click();
      await expect(button).toHaveAttribute('aria-current', 'step', { timeout: 10_000 });
    }
  });

  test('unknown routes show the 404 page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
    await page.getByRole('link', { name: /back to the journey/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('journey with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('does not pin the section and draws a static digital-rain background', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeVisible();
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('video')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(1);
  });
});
