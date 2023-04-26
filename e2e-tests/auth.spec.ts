import { test, expect } from "@playwright/test";

test("loads and has email sign in link", async ({ page }) => {
  await page.goto("http://localhost:3000/auth/sign-in");

  await expect(page.getByText("Log in or sign up")).toBeVisible();
});
