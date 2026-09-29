import { Page, expect } from "@playwright/test";

export const MOCK_USER_ID = "usr_svasthi_test_01";
export const MOCK_USER_EMAIL = "builder@svasthi.test";

/**
 * Sets up network interception for Supabase Auth endpoints.
 * Makes login/signup and session restoration deterministic in test environments.
 */
export async function setupMockAuth(page: Page, options: { email?: string } = {}) {
  const email = options.email ?? MOCK_USER_EMAIL;

  await page.route("**/auth/v1/token*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-jwt-access-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "mock-jwt-refresh-token",
        user: {
          id: MOCK_USER_ID,
          aud: "authenticated",
          role: "authenticated",
          email,
          app_metadata: { provider: "email" },
          user_metadata: {},
          created_at: "2026-09-01T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: MOCK_USER_ID,
        aud: "authenticated",
        role: "authenticated",
        email,
        app_metadata: { provider: "email" },
        user_metadata: {},
        created_at: "2026-09-01T00:00:00.000Z",
      }),
    });
  });

  await page.route("**/auth/v1/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });
}

/**
 * Sets up mocks for internal Next.js API routes (/api/*).
 */
export async function setupMockApis(
  page: Page,
  options: {
    chatFails?: boolean;
    insightFails?: boolean;
    crisisInJournal?: boolean;
  } = {},
) {
  // Check-ins API
  await page.route("**/api/check-ins", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() || {};
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          checkIn: {
            id: "chk_mock_" + Date.now(),
            createdAt: new Date().toISOString(),
            mood: payload.mood ?? 3,
            stress: payload.stress ?? 4,
            energy: payload.energy ?? 3,
            sleepHours: payload.sleepHours ?? 7,
            contexts: payload.contexts ?? ["Work / academics"],
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ checkIns: [] }),
      });
    }
  });

  // Journals API
  await page.route("**/api/journals", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() || {};
      const transcript = (payload.transcript || "").toLowerCase();
      const hasCrisis =
        options.crisisInJournal ||
        transcript.includes("kill myself") ||
        transcript.includes("suicide") ||
        transcript.includes("end my life");

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          journal: {
            id: "jrn_mock_" + Date.now(),
            createdAt: new Date().toISOString(),
            transcript: payload.transcript || "Today was a quiet day.",
            features: payload.features ?? null,
            aiConsent: payload.aiConsent ?? false,
          },
          crisisSignal: hasCrisis,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ journals: [] }),
      });
    }
  });

  // Chat API (Dawn)
  await page.route("**/api/chat", async (route) => {
    if (options.chatFails) {
      await route.fulfill({
        status: 504,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "The model took too long to answer. Here is a guided reflection instead." },
        }),
      });
      return;
    }

    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() || {};
      const message = (payload.message || "").toLowerCase();
      const hasCrisis =
        message.includes("kill myself") ||
        message.includes("suicide") ||
        message.includes("end it all");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: hasCrisis
            ? "I am very concerned about your safety. Please connect with human support right away."
            : "I hear you. Taking a quiet breath together can often help untangle the knot of the day.",
          crisis: hasCrisis,
          source: "guided-fallback",
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ messages: [] }),
      });
    }
  });

  // Insights API
  await page.route("**/api/insights", async (route) => {
    if (options.insightFails) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Unable to generate insights right now. Please try again shortly." },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        insight: {
          id: "ins_mock_" + Date.now(),
          createdAt: new Date().toISOString(),
          title: "Steadier breathing and calm reflection",
          evidence: ["Self-reported mood: 3/5", "Quiet tone noted in voice reflection"],
          suggestion: "Take a short pause or try the one-minute breathing exercise when pressure rises.",
          level: "Steady",
          referral: false,
          disclaimer:
            "Svasthi provides wellness observations, not medical diagnoses or treatment. If you are experiencing persistent distress, please speak with a healthcare professional.",
          crisis: false,
          source: "fallback",
        },
      }),
    });
  });
}

/**
 * Logs in via the real UI AuthPanel using the mocked Supabase endpoint.
 */
export async function loginAsTestUser(page: Page, email = MOCK_USER_EMAIL, password = "password123") {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // If already signed in, return
  const logoutBtn = page.locator("button:has-text('Log out')");
  if ((await logoutBtn.count()) > 0) {
    return;
  }

  // Ensure login mode is active
  const createAccountSwitch = page.locator("button:has-text('Already have an account? Log in')");
  if ((await createAccountSwitch.count()) > 0) {
    await createAccountSwitch.click();
  }

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]:has-text("Log in")');

  // Verify we reached signed in state
  await expect(page.locator("button:has-text('Log out')").first()).toBeVisible({ timeout: 10000 });
}
