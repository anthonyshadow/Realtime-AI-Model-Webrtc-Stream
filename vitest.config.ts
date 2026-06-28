import react from "@vitejs/plugin-react";
import { defineConfig, defineProject } from "vitest/config";

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
