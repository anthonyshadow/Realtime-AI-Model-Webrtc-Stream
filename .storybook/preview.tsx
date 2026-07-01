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
    viewport: {
      viewports: {
        mobile320: {
          name: "Mobile 320",
          styles: { width: "320px", height: "760px" },
        },
        mobile360: {
          name: "Mobile 360",
          styles: { width: "360px", height: "760px" },
        },
        mobile390: {
          name: "Mobile 390",
          styles: { width: "390px", height: "844px" },
        },
        mobile430: {
          name: "Mobile 430",
          styles: { width: "430px", height: "932px" },
        },
        tablet768: {
          name: "Tablet 768",
          styles: { width: "768px", height: "1024px" },
        },
        desktop1024: {
          name: "Desktop 1024",
          styles: { width: "1024px", height: "768px" },
        },
        desktop1280: {
          name: "Desktop 1280",
          styles: { width: "1280px", height: "800px" },
        },
        desktop1440: {
          name: "Desktop 1440",
          styles: { width: "1440px", height: "900px" },
        },
        large1600: {
          name: "Large 1600",
          styles: { width: "1600px", height: "960px" },
        },
      },
    },
  },
};

export default preview;
