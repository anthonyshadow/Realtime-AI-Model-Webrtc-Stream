import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

const LOCAL_TEST_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const unexpectedExternalRequests = new WeakMap<Page, string[]>();

const STABLE_STORIES = [
  {
    id: "control-panel-controlpanel--idle-lucy",
    name: "Control panel idle state",
  },
  {
    id: "control-panel-promptinput--lucy-prompt",
    name: "Prompt input",
  },
  {
    id: "control-panel-imageupload--empty-reference-portrait",
    name: "Image upload empty state",
  },
  {
    id: "control-panel-sessioncontrols--idle",
    name: "Idle session controls",
  },
  {
    id: "video-stage-videoplaceholder--lucy",
    name: "Lucy video placeholder",
  },
];

type AxeViolation = {
  help: string;
  id: string;
  impact: "critical" | "minor" | "moderate" | "serious" | null;
  nodes: Array<{
    failureSummary?: string;
    target: string[];
  }>;
};

test.beforeEach(async ({ page }) => {
  await blockUnexpectedExternalRequests(page);
});

test.afterEach(async ({ page }) => {
  expect(unexpectedExternalRequests.get(page) ?? []).toEqual([]);
});

for (const story of STABLE_STORIES) {
  test(`${story.name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator("#storybook-root").waitFor({ state: "attached" });
    await expect(page.locator("#storybook-root")).not.toBeEmpty();
    await page.addScriptTag({ content: axe.source });

    const violations = await page.evaluate(async () => {
      const axeApi = (
        window as typeof window & {
          axe: {
            run: (
              context: Element,
              options: Record<string, unknown>,
            ) => Promise<{ violations: AxeViolation[] }>;
          };
        }
      ).axe;
      const results = await axeApi.run(document.body, {
        resultTypes: ["violations"],
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        },
      });

      return results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
    });

    expect(formatViolations(violations)).toEqual([]);
  });
}

async function blockUnexpectedExternalRequests(page: Page) {
  const unexpectedRequests: string[] = [];
  unexpectedExternalRequests.set(page, unexpectedRequests);

  page.on("websocket", (socket) => {
    if (isExternalUrl(socket.url())) {
      unexpectedRequests.push(`WS ${socket.url()}`);
    }
  });

  await page.route("**/*", async (route) => {
    const request = route.request();

    if (isExternalUrl(request.url())) {
      unexpectedRequests.push(`${request.method()} ${request.url()}`);
      await route.abort("blockedbyclient");
      return;
    }

    await route.fallback();
  });
}

function isExternalUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol)) {
    return false;
  }

  return !LOCAL_TEST_HOSTS.has(url.hostname);
}

function formatViolations(violations: AxeViolation[]) {
  return violations.map((violation) => ({
    help: violation.help,
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
}
