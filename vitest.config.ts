import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, defineProject } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      defineProject({
        plugins: [react()],
        test: {
          name: "browser",
          environment: "jsdom",
          environmentOptions: {
            jsdom: {
              url: "http://localhost:3000/",
            },
          },
          setupFiles: ["src/test/setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
        },
      }),
      defineProject({
        test: {
          name: "server",
          environment: "node",
          include: ["server/**/*.{test,spec}.{ts,tsx}"],
        },
      }),
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
            storybookScript: "npm run storybook -- --host 127.0.0.1",
            storybookUrl: "http://127.0.0.1:6006",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "src/main.tsx",
        "src/test/**",
        "server/index.ts",
        "server/localhostCertificate.ts",
        "tests/**",
      ],
    },
  },
});
