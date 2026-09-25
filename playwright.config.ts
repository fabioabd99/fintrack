import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Use an already running dev server if set (Next won't start a second one).
const EXTERNAL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        // use the installed Chrome
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],

  // separate port so it doesn't clash with `pnpm dev`
  webServer: EXTERNAL
    ? undefined
    : {
        command: `pnpm dev --port ${PORT}`,
        url: `http://localhost:${PORT}/sign-in`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
