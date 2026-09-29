import { test, expect } from "@playwright/test";
import { setupMockAuth, setupMockApis, loginAsTestUser } from "./helpers";

test.describe("Full User Journey (F11)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
    await setupMockApis(page);
  });

  test("1. Unauthenticated visitor sees AuthPanel and persistent SupportBanner", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Persistent support banner is visible
    const supportLink = page.locator("a[href='tel:14416']").first();
    await expect(supportLink).toBeVisible();
    await expect(page.locator("text=Tele-MANAS is free, 24/7").first()).toBeVisible();

    // AuthPanel is displayed because user is not signed in
    await expect(page.locator("h2:has-text('Welcome back'), h2:has-text('Create your private space')")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("2. User signs in, accesses home dashboard, and completes a daily check-in", async ({ page }) => {
    await loginAsTestUser(page);

    // Verify user identity in header
    await expect(page.locator("header")).toContainText("builder@svasthi.test");

    // Navigate to check-in
    await page.goto("/check-in");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("A small check-in");

    // 1. Select mood 4 ("Good")
    const mood4 = page.locator("input[type='radio'][value='4']");
    await mood4.check({ force: true });

    // 2. Set sliders (stress = 3, energy = 4)
    const sliders = page.locator("input[type='range']");
    await sliders.nth(0).fill("3");
    await sliders.nth(1).fill("4");

    // 3. Set sleep hours
    await page.fill("input[type='number']", "7.5");

    // 4. Select context checkbox
    const contextCheckbox = page.locator("input[type='checkbox'][value='Work / academics']");
    if ((await contextCheckbox.count()) > 0) {
      await contextCheckbox.check();
    }

    // 5. Submit check-in
    await page.click("button[type='submit']:has-text('Save check-in')");

    // Verify saved confirmation - CheckInPage renders Today's check-in summary
    await expect(page.locator("section[aria-label=\"Today's check-in\"]")).toBeVisible();
    await expect(page.locator("h2:has-text('Good')")).toBeVisible();
    await expect(page.locator("button:has-text('Check in again')")).toBeVisible();
  });

  test("3. User can create and save a reflection via the journal page", async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Speak for a moment, or write instead");

    // Fill typed reflection in TranscriptEditor
    const textarea = page.locator("textarea");
    await textarea.fill("Today felt productive. Took an evening walk to clear my head.");

    // Submit the reflection
    await page.click("button:has-text('Save reflection')");

    // Verify confirmation and data ownership note
    await expect(page.locator("h1:has-text('Your reflection is saved.')")).toBeVisible();
    await expect(page.locator("h2:has-text('Reflection saved')")).toBeVisible();
  });

  test("4. User can run the guided breathing exercise and toggle text-only mode", async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/exercises");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("One minute, one small action.");

    // Start breathing guide
    const startButton = page.locator("button:has-text('Start the one-minute guide')");
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Verify it is running with Pause and Stop buttons
    await expect(page.locator("button:has-text('Pause')")).toBeVisible();
    await expect(page.locator("button:has-text('Stop')")).toBeVisible();

    // Pause and Resume
    await page.click("button:has-text('Pause')");
    await expect(page.locator("button:has-text('Resume')")).toBeVisible();
    await page.click("button:has-text('Resume')");
    await expect(page.locator("button:has-text('Pause')")).toBeVisible();

    // Toggle text-only reduced motion mode
    const textOnlyToggle = page.locator("input#breathing-text-only");
    await textOnlyToggle.check();
    await expect(textOnlyToggle).toBeChecked();

    // Stop exercise
    await page.click("button:has-text('Stop')");
    await expect(page.locator("button:has-text('Start the one-minute guide')")).toBeVisible();

    // Verify Grounding alternative (5-4-3-2-1 technique) is present
    await expect(page.locator("#grounding-heading")).toBeVisible();
  });

  test("5. User can browse verified resources, filter categories, search, and toggle sample fixture", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    await page.goto("/resources");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Verified Support & Referral Directory");

    // Verify national helplines are listed
    await expect(page.locator("h3:has-text('Tele-MANAS')")).toBeVisible();
    await expect(page.locator("h3:has-text('KIRAN Helpline')")).toBeVisible();

    // Filter by Crisis & Distress
    await page.click("button:has-text('Crisis & Distress')");
    await expect(page.locator("text=24/7 Crisis Intervention").first()).toBeVisible();

    // Filter by Free Tele-Counseling
    await page.click("button:has-text('Free Tele-Counseling')");
    await expect(page.locator("text=iCall Psychosocial Helpline")).toBeVisible();

    // Switch to All Destinations and search by keyword
    await page.click("button:has-text('All Destinations')");
    const searchInput = page.locator("input[type='search']");
    await searchInput.fill("NIMHANS");
    await expect(page.locator("h3:has-text('NIMHANS Centre for Well-Being')")).toBeVisible();

    // Clear search
    await searchInput.fill("");

    // Toggle sample demo fixture
    const sampleCheckbox = page.locator("input[type='checkbox']");
    await sampleCheckbox.check();
    await expect(page.locator("text=Aarogyam Counseling Collective (Example)")).toBeVisible();
    // Verify sample card is visibly badged
    await expect(page.locator("span:has-text('Sample')").first()).toBeVisible();
  });

  test("6. Support page presents 24/7 crisis helplines and onward directory link", async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/support");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("section[aria-label='Immediate support']")).toBeVisible();
    await expect(page.locator("text=14416").first()).toBeVisible();

    // Check onward link to /resources
    const resourcesLink = page.locator("a[href='/resources']:has-text('Browse Verified Resource Directory')");
    await expect(resourcesLink).toBeVisible();
  });

  test("7. User can sign out and private data is cleared from view", async ({ page }) => {
    await loginAsTestUser(page);

    // Click Log out button
    const logoutBtn = page.locator("button:has-text('Log out')").first();
    await logoutBtn.click();

    // Session is signed out, user returns to AuthPanel
    await expect(page.locator("h2:has-text('Welcome back'), h2:has-text('Create your private space')")).toBeVisible();
  });
});
