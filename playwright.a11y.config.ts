/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.A11Y_STORYBOOK_PORT ?? 6106);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/a11y",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `STORYBOOK_DISABLE_TELEMETRY=1 VITE_USE_MOCK_DECART=true storybook dev -p ${port} --host 127.0.0.1 --ci`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
