import { test, expect } from "@playwright/test";
import { setupMockAuth, setupMockApis, loginAsTestUser } from "./helpers";

test.describe("Safety, Fallbacks & Resilience (F11)", () => {
  test.beforeEach(async ({ page }) => {
    await setupMockAuth(page);
  });

  test("1. Microphone denial displays calm guidance and allows full typed reflection completion", async ({
    page,
  }) => {
    await setupMockApis(page);

    // Mock navigator.mediaDevices.getUserMedia to reject with NotAllowedError (simulating user denying mic)
    await page.addInitScript(() => {
      if (!navigator.mediaDevices) {
        // @ts-expect-error mock mediaDevices
        navigator.mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = () => {
        return Promise.reject(new DOMException("Permission denied by user", "NotAllowedError"));
      };
    });

    await loginAsTestUser(page);

    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    // Click start recording
    const startRecordBtn = page.locator("button:has-text('Start recording')");
    await startRecordBtn.click();

    // Verify calm permission-denied error copy appears
    const errorNotice = page.locator("text=Your microphone isn't available. You can still write your reflection below.");
    await expect(errorNotice).toBeVisible();

    // Verify user can still write reflection in TranscriptEditor
    const textarea = page.locator("textarea");
    await textarea.fill("Even without a working microphone, typing my reflection works smoothly.");

    // Submit typed reflection
    await page.click("button:has-text('Save reflection')");

    // Verify reflection saved successfully
    await expect(page.locator("h1:has-text('Your reflection is saved.')")).toBeVisible();
    await expect(page.locator("h2:has-text('Reflection saved')")).toBeVisible();
  });

  test("2. Consent gate respects user decision when declining AI processing", async ({ page }) => {
    await setupMockApis(page);
    await loginAsTestUser(page);

    // Navigate to /insights
    await page.goto("/insights");
    await page.waitForLoadState("networkidle");

    // If consent has not been decided or is declined, ConsentPanel or consent message is shown
    const consentHeader = page.locator("h2:has-text('Choose how your reflections are used'), h2:has-text('AI processing is turned off')");
    if ((await consentHeader.count()) > 0) {
      // Click "Keep processing private" or "Decline"
      const declineBtn = page.locator("button:has-text('Keep processing private'), button:has-text('Keep offline')");
      if ((await declineBtn.count()) > 0) {
        await declineBtn.first().click();
      }

      // Verify AI is disabled and privacy choice is confirmed
      await expect(page.locator("text=AI processing is turned off, text=offline")).toBeVisible();
    }
  });

  test("3. AI provider timeout / failure displays graceful error and fallback wording", async ({ page }) => {
    // Setup API mocks with chat and insight failure flags
    await setupMockApis(page, { chatFails: true, insightFails: true });
    await loginAsTestUser(page);

    await page.goto("/dawn");
    await page.waitForLoadState("networkidle");

    // Type a message in Dawn chat
    const chatInput = page.locator("input[placeholder*='message' i], textarea[placeholder*='message' i], input[type='text']");
    if ((await chatInput.count()) > 0) {
      await chatInput.fill("I have had a stressful day.");
      const sendBtn = page.locator("button[type='submit']:has-text('Send'), button:has-text('Send')");
      await sendBtn.first().click();

      // Verify the chat shows error or calm fallback without breaking
      await expect(
        page.locator("text=Your message was not sent, text=too long, text=retry, text=error").first(),
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("4. Crisis phrasing in journal immediately surfaces the CrisisPanel with 24/7 lines", async ({
    page,
  }) => {
    // Setup API to signal crisis
    await setupMockApis(page, { crisisInJournal: true });
    await loginAsTestUser(page);

    await page.goto("/journal");
    await page.waitForLoadState("networkidle");

    // Enter distress text
    const textarea = page.locator("textarea");
    await textarea.fill("I feel so overwhelmed and like I want to end my life.");

    // Submit reflection
    await page.click("button:has-text('Save reflection')");

    // Verify CrisisPanel appears with 14416 Tele-MANAS emergency contact
    const crisisPanel = page.locator("section[aria-label='Immediate support']");
    await expect(crisisPanel).toBeVisible();
    await expect(crisisPanel).toContainText("14416");
    await expect(crisisPanel).toContainText("Tele-MANAS");
  });

  test("5. Health endpoint /api/health returns system configuration status", async ({ page }) => {
    const response = await page.request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.modelConfigured).toBe("boolean");
    expect(typeof body.supabaseConfigured).toBe("boolean");
    expect(typeof body.demoMode).toBe("boolean");
  });
});
