import { test, expect } from '@playwright/test';
import { allure } from "allure-playwright";

test('There are two headers on the page', async ({ page }) => {
  allure.epic("Tasks");
  allure.feature("Apperance");
  allure.story("User sees 2 sections on the page");

  await test.step("Visit the site", async () => {
    await page.goto('/time-tracker');
  });
  
  await test.step("Verify there is 'Task planner' header", async () => {
    await expect(page.locator("h1").nth(0)).toHaveText('Task planner');
  });

  await test.step("Verify there is 'Your Tasks' header", async () => {
    await expect(page.locator("h1").nth(1)).toHaveText('Your Tasks');
  });
});