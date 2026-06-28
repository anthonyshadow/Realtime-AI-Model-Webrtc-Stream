import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";

const config = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    define: {
      ...viteConfig.define,
      "import.meta.env.VITE_USE_MOCK_DECART": JSON.stringify("true"),
    },
    plugins: [...(viteConfig.plugins ?? []), tailwindcss()],
  }),
} satisfies StorybookConfig;

export default config;
