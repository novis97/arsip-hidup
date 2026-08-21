import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: process.env.TEST_BASE_URL ?? "http://localhost:4321" },
  webServer: {
    command: "pnpm --filter @ahi/web preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
