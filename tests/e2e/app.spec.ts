import { expect, test, type Page } from "@playwright/test";

const LOCAL_TEST_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const realtimeTokenRequests = new WeakMap<Page, unknown[]>();
const unexpectedExternalRequests = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  await blockUnexpectedExternalRequests(page);
  realtimeTokenRequests.set(page, []);
  await installMockBrowserApis(page);
  await mockRealtimeToken(page);
});

test.afterEach(async ({ page }) => {
  expect(unexpectedExternalRequests.get(page) ?? []).toEqual([]);
});

test("loads, accepts a VTON prompt and garment image, starts, applies, and stops a mocked session", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Start camera to begin" })).toBeVisible();
  await page.getByRole("button", { name: /VTON/i }).click();
  await expect(page.getByLabel(/Garment prompt/i)).toHaveValue("");

  await page.getByLabel(/Garment prompt/i).fill("Substitute the current top with a cobalt rain jacket");
  await page.getByLabel(/Garment image/i).setInputFiles({
    name: "jacket.png",
    mimeType: "image/png",
    buffer: Buffer.from("mock garment"),
  });

  await expect(page.getByText("jacket.png")).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();

  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.getByText("Live")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(1);
  expect(realtimeTokenRequests.get(page)).toEqual([{ model: "lucy-vton-3" }]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.initialStates.at(-1)))
    .toEqual({
      prompt: "Substitute the current top with a cobalt rain jacket",
      enhance: true,
      imageName: "jacket.png",
    });

  await page.getByLabel(/Garment prompt/i).fill("Substitute the current top with a matte black shell");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.sets.at(-1)))
    .toEqual({
      prompt: "Substitute the current top with a matte black shell",
      enhance: true,
      imageName: "jacket.png",
    });

  await page.getByRole("button", { name: "Stop" }).click();

  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  await expect(page.getByText("Stopped")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.disconnects))
    .toBe(1);
});

test("shows a useful API failure message", async ({ page }) => {
  await mockRealtimeToken(page, {
    status: 500,
    body: {
      error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    },
  });

  await page.goto("/");
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start" }).click();

  await expect(
    page.getByText("Could not create realtime session token. Check DECART_API_KEY on the local server."),
  ).toBeVisible();
  expect(realtimeTokenRequests.get(page)).toEqual([{ model: "lucy-2.1" }]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(0);
});

test("shows a useful camera permission denied message", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__E2E_CAMERA_DENIED__ = true;
  });

  await page.goto("/");
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start" }).click();

  await expect(
    page.getByText("Camera permission was denied. Allow camera access and try again."),
  ).toBeVisible();
  expect(realtimeTokenRequests.get(page)).toEqual([]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(0);
});

test("shows a useful Decart connection failure message", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__E2E_DECART_CONNECT_ERROR__ = true;
  });

  await page.goto("/");
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start" }).click();

  await expect(
    page.getByText("Could not connect to Lucy 2.1. Check API access, model availability, and network."),
  ).toBeVisible();
  expect(realtimeTokenRequests.get(page)).toEqual([{ model: "lucy-2.1" }]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(0);
});

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

async function mockRealtimeToken(
  page: Page,
  response: {
    body: Record<string, unknown>;
    status: number;
  } = {
    status: 200,
    body: {
      apiKey: "ek_e2e_client_token",
      expiresAt: "2030-01-01T00:00:00.000Z",
    },
  },
) {
  await page.unroute("**/api/realtime-token").catch(() => undefined);
  await page.route("**/api/realtime-token", async (route) => {
    realtimeTokenRequests.get(page)?.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/json",
      status: response.status,
      body: JSON.stringify(response.body),
    });
  });
}

function isExternalUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol)) {
    return false;
  }

  return !LOCAL_TEST_HOSTS.has(url.hostname);
}

async function installMockBrowserApis(page: Page) {
  await page.addInitScript(() => {
    (window as any).__E2E_DECART_EVENTS__ = {
      connects: 0,
      disconnects: 0,
      initialStates: [],
      sets: [],
    };

    const createE2EMediaStream = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const context = canvas.getContext("2d");
      context!.fillStyle = "#101010";
      context!.fillRect(0, 0, canvas.width, canvas.height);
      context!.fillStyle = "#67e8f9";
      context!.fillRect(80, 80, 120, 120);

      const stream = canvas.captureStream(24);
      const [track] = stream.getVideoTracks();
      const readOriginalSettings = track.getSettings.bind(track);
      track.getSettings = () => ({
        ...readOriginalSettings(),
        width: 640,
        height: 360,
      });

      return stream;
    };

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          if ((window as any).__E2E_CAMERA_DENIED__) {
            const error = new Error("Denied");
            error.name = "NotAllowedError";
            throw error;
          }

          return createE2EMediaStream();
        },
      },
    });

    HTMLMediaElement.prototype.play = () => Promise.resolve();
    HTMLMediaElement.prototype.pause = () => undefined;
    HTMLMediaElement.prototype.load = () => undefined;

    (globalThis as any).__DECART_TEST_SDK__ = {
      createDecartClient: () => ({
        realtime: {
          connect: async (_stream: unknown, options: any) => {
            if ((window as any).__E2E_DECART_CONNECT_ERROR__) {
              throw new Error("Mock Decart connection failed.");
            }

            (window as any).__E2E_DECART_EVENTS__.connects += 1;
            (window as any).__E2E_DECART_EVENTS__.initialStates.push({
              prompt: options.initialState?.prompt?.text ?? null,
              enhance: options.initialState?.prompt?.enhance ?? null,
              imageName: options.initialState?.image?.name ?? null,
            });
            options.onRemoteStream(createE2EMediaStream());
            options.onConnectionChange("connected");

            return {
              disconnect: () => {
                (window as any).__E2E_DECART_EVENTS__.disconnects += 1;
              },
              getConnectionState: () => "connected",
              on: () => undefined,
              setPrompt: async (prompt: string, promptOptions: { enhance?: boolean } = {}) => {
                (window as any).__E2E_DECART_EVENTS__.sets.push({
                  prompt,
                  enhance: promptOptions.enhance ?? null,
                  imageName: null,
                });
                options.onConnectionChange?.("generating");
              },
              set: async (payload: any) => {
                (window as any).__E2E_DECART_EVENTS__.sets.push({
                  prompt: payload.prompt ?? null,
                  enhance: payload.enhance ?? null,
                  imageName: payload.image?.name ?? null,
                });
                options.onConnectionChange("generating");
              },
            };
          },
        },
      }),
      models: {
        realtime: (modelId: string) => ({
          id: modelId,
          fps: 24,
          width: 640,
          height: 360,
        }),
      },
      noopLogger: {},
    };
  });
}
