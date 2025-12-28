import { test, expect } from '@playwright/test';

test('has title and health status', async ({ page }) => {
    // Start app before running this or assume it's running
    await page.goto('http://localhost:3000/');

    // Check title
    await expect(page).toHaveTitle(/EstateAnalytics/);

    // Check backend status badge
    const statusBadge = page.locator('text=Backend:');
    await expect(statusBadge).toBeVisible();
});
