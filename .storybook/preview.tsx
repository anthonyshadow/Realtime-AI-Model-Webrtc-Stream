import type { Preview } from "@storybook/react-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { UnhandledRequestCallback } from "msw";
import "../src/index.css";
import { handlers } from "../src/test/mocks/handlers";
import {
  installStorybookBrowserMocks,
  resetStorybookBrowserMocks,
  type StorybookBrowserMockOptions,
} from "../src/test/mocks/storybookBrowserMocks";

const handleUnhandledRequest: UnhandledRequestCallback = (request, print) => {
  const url = new URL(request.url);
  const isLocalAsset =
    ["127.0.0.1", "localhost"].includes(url.hostname) &&
    !url.pathname.startsWith("/api/");

  if (isLocalAsset) {
    return;
  }

  print.error();
};

initialize({
  quiet: true,
  onUnhandledRequest: handleUnhandledRequest,
});

installStorybookBrowserMocks();

const preview: Preview = {
  decorators: [
    (Story, context) => {
      resetStorybookBrowserMocks(
        context.parameters.browserMocks as StorybookBrowserMockOptions | undefined,
      );

      return <Story />;
    },
  ],
  loaders: [mswLoader],
  parameters: {
    backgrounds: {
      default: "studio",
      values: [
        { name: "studio", value: "#050505" },
        { name: "panel", value: "#171717" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      source: {
        type: "dynamic",
      },
    },
    layout: "fullscreen",
    msw: {
      handlers,
    },
  },
};

export default preview;
