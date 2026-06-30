import { expect, test, type Page } from "@playwright/test";

const LOCAL_TEST_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const decartNetworkRequests = new WeakMap<Page, string[]>();
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

  await page.getByRole("button", { name: "Start VTON session" }).click();

  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
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

  await page.getByRole("button", { name: "Stop session" }).click();

  await expect(page.getByRole("button", { name: "Start VTON session" })).toBeVisible();
  await expect(page.getByText("Stopped")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.disconnects))
    .toBe(1);
});

test("starts and stops local camera without token or Decart connect", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.locator("button[aria-pressed='true']").filter({ hasText: "Local camera" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start local camera" }).click();

  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
  await expect(page.getByText("Live")).toBeVisible();
  expect(realtimeTokenRequests.get(page)).toEqual([]);
  expect(decartNetworkRequests.get(page)).toEqual([]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(0);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_MEDIA_REQUESTS__.at(-1)))
    .toEqual({
      video: {
        facingMode: "user",
      },
      audio: true,
    });

  await page.getByRole("button", { name: "Stop session" }).click();

  await expect(page.getByRole("button", { name: "Start local camera" })).toBeVisible();
  await expect(page.getByText("Stopped")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.disconnects))
    .toBe(0);
});

test("starts Lucy 2.1 through the Decart path", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start Lucy session" }).click();

  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(1);
  expect(realtimeTokenRequests.get(page)).toEqual([{ model: "lucy-2.1" }]);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.initialStates.at(-1)))
    .toEqual({
      prompt: "Make the scene cinematic",
      enhance: true,
      imageName: null,
    });
});

test("applies Lucy prompt, image, and enhance changes atomically", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByLabel(/Reference portrait/i).setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from("mock portrait"),
  });
  await page.getByText("Options").click();
  await page.getByRole("checkbox", { name: /Enhance prompt/i }).click();

  await expect(page.getByText("portrait.png")).toBeVisible();

  await page.getByRole("button", { name: "Start Lucy session" }).click();

  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.initialStates.at(-1)))
    .toEqual({
      prompt: "Make the scene cinematic",
      enhance: false,
      imageName: "portrait.png",
    });

  await page.getByLabel(/Transformation prompt/i).fill("Make the scene neon");
  await page.getByRole("checkbox", { name: /Enhance prompt/i }).click();
  await page.getByRole("button", { name: "Apply" }).click();

  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.sets.at(-1)))
    .toEqual({
      prompt: "Make the scene neon",
      enhance: true,
      imageName: "portrait.png",
    });

  await page.getByRole("button", { name: "Clear" }).click();
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page.getByText("No portrait")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.sets.at(-1)))
    .toEqual({
      prompt: "Make the scene neon",
      enhance: true,
      imageName: null,
    });
});

test("reset clears prompt, reference image, file input, and mocked realtime state", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByLabel(/Reference portrait/i).setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from("mock portrait"),
  });

  await expect(page.getByText("portrait.png")).toBeVisible();

  await page.getByRole("button", { name: "Start Lucy session" }).click();

  await expect(page.getByRole("button", { name: "Stop session" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.initialStates.at(-1)))
    .toEqual({
      prompt: "Make the scene cinematic",
      enhance: true,
      imageName: "portrait.png",
    });

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel(/Transformation prompt/i)).toHaveValue("");
  await expect(page.getByText("No portrait")).toBeVisible();
  await expect(page.getByLabel(/Reference portrait/i)).toHaveValue("");
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.sets.at(-1)))
    .toEqual({
      prompt: null,
      enhance: null,
      imageName: null,
    });

  await page.getByLabel(/Transformation prompt/i).fill("After reset prompt");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.sets.at(-1)))
    .toEqual({
      prompt: "After reset prompt",
      enhance: true,
      imageName: null,
    });
});

test("records, reviews, downloads, discards, and replaces local clips safely", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start local camera" }).click();
  await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();

  await page.getByRole("button", { name: "Record" }).click();
  await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_RECORDING_EVENTS__.starts))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_RECORDING_EVENTS__.instances.at(-1)))
    .toEqual({
      audioTracks: 1,
      mimeType: "video/webm;codecs=vp8,opus",
      videoTracks: 1,
    });

  await page.getByRole("button", { name: "Stop recording" }).click();
  await expect(page.getByText("Clip captured")).toBeVisible();
  const firstObjectUrl = await page.getByLabel("Recording playback").getAttribute("src");
  expect(firstObjectUrl).toBe("blob:http://localhost/e2e-object-url-1");

  const firstDownload = page.getByRole("link", { name: "Download" });
  await expect(firstDownload).toHaveAttribute("href", firstObjectUrl!);
  await expect(firstDownload).toHaveAttribute(
    "download",
    /^session-local-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.webm$/,
  );

  await page.getByRole("button", { name: "Discard" }).click();
  await expect(page.getByText("Discard this take? This removes the local clip only.")).toBeVisible();
  await page.getByRole("button", { name: "Discard clip" }).click();

  await expect(page.getByLabel("Recording playback")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual(["blob:http://localhost/e2e-object-url-1"]);

  await page.getByRole("button", { name: "Record" }).click();
  await page.getByRole("button", { name: "Stop session" }).click();

  await expect(page.getByText("Stopped")).toBeVisible();
  await expect(page.getByRole("button", { name: "Record again" })).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_RECORDING_EVENTS__.stops))
    .toBe(2);
  await expect(page.getByLabel("Recording playback")).toHaveAttribute(
    "src",
    "blob:http://localhost/e2e-object-url-2",
  );

  const secondObjectUrl = await page.getByLabel("Recording playback").getAttribute("src");
  expect(secondObjectUrl).toBe("blob:http://localhost/e2e-object-url-2");

  await page.getByRole("button", { name: "Discard" }).click();
  await page.getByRole("button", { name: "Discard clip" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual([
      "blob:http://localhost/e2e-object-url-1",
      "blob:http://localhost/e2e-object-url-2",
    ]);
});

test("stopping a model recording releases API usage and keeps local preview playback", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start Lucy session" }).click();

  await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(1);
  expect(realtimeTokenRequests.get(page)).toEqual([{ model: "lucy-2.1" }]);

  await page.getByRole("button", { name: "Record" }).click();
  await page.getByRole("button", { name: "Stop recording" }).click();

  await expect(
    page.getByText("Recording ready. Model session ended to save usage. Local camera remains on."),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.disconnects))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(1);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_MEDIA_REQUESTS__.length))
    .toBe(1);
  await expect(
    page.getByText("Local camera is on. Recording is available when the stream is ready."),
  ).toBeVisible();
  await expect(page.getByLabel(/Transformation prompt/i)).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => Boolean((document.querySelector("video") as HTMLVideoElement | null)?.srcObject)),
    )
    .toBe(true);

  await expect(page.getByLabel("Recording playback")).toHaveAttribute(
    "src",
    "blob:http://localhost/e2e-object-url-1",
  );
  await expect(page.getByRole("link", { name: "Download" })).toHaveAttribute(
    "href",
    "blob:http://localhost/e2e-object-url-1",
  );
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual([]);

  await page.getByRole("button", { name: "Discard" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_DECART_EVENTS__.connects))
    .toBe(1);
  await page.getByRole("button", { name: "Discard clip" }).click();

  await expect(page.getByLabel("Recording playback")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual(["blob:http://localhost/e2e-object-url-1"]);
  await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();
});

test("restarting a session and recording again revokes the previous clip URL", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Start local camera" }).click();
  await expect(page.getByRole("button", { name: "Record" })).toBeEnabled();
  await page.getByRole("button", { name: "Record" }).click();
  await page.getByRole("button", { name: "Stop recording" }).click();
  await expect(page.getByText("Clip captured")).toBeVisible();
  await expect(page.getByLabel("Recording playback")).toHaveAttribute(
    "src",
    "blob:http://localhost/e2e-object-url-1",
  );

  await page.getByRole("button", { name: "Stop session" }).click();
  await page.getByRole("button", { name: "Start local camera" }).click();
  await expect(page.getByRole("button", { name: "Record again" })).toBeEnabled();
  await page.getByRole("button", { name: "Record again" }).click();

  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual(["blob:http://localhost/e2e-object-url-1"]);

  await page.getByRole("button", { name: "Stop recording" }).click();
  await expect(page.getByLabel("Recording playback")).toHaveAttribute(
    "src",
    "blob:http://localhost/e2e-object-url-2",
  );
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_RECORDING_EVENTS__.starts))
    .toBe(2);

  await page.getByRole("button", { name: "Discard" }).click();
  await page.getByRole("button", { name: "Discard clip" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__E2E_OBJECT_URL_EVENTS__.revoked))
    .toEqual([
      "blob:http://localhost/e2e-object-url-1",
      "blob:http://localhost/e2e-object-url-2",
    ]);
});

test("shows a useful API failure message", async ({ page }) => {
  await mockRealtimeToken(page, {
    status: 500,
    body: {
      error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    },
  });

  await page.goto("/");
  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start Lucy session" }).click();

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
  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start Lucy session" }).click();

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
  await page.getByRole("button", { name: /Lucy 2.1/i }).click();
  await page.getByLabel(/Transformation prompt/i).fill("Make the scene cinematic");
  await page.getByRole("button", { name: "Start Lucy session" }).click();

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
  const decartRequests: string[] = [];
  decartNetworkRequests.set(page, decartRequests);
  unexpectedExternalRequests.set(page, unexpectedRequests);

  page.on("request", (request) => {
    if (isDecartApiOrNetworkRequest(request.url())) {
      decartRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  page.on("websocket", (socket) => {
    if (isDecartApiOrNetworkRequest(socket.url())) {
      decartRequests.push(`WS ${socket.url()}`);
    }

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

function isDecartApiOrNetworkRequest(rawUrl: string) {
  const url = new URL(rawUrl);
  const normalizedTarget = `${url.hostname}${url.pathname}`.toLowerCase();

  return url.pathname === "/api/realtime-token" || (
    !LOCAL_TEST_HOSTS.has(url.hostname) && normalizedTarget.includes("decart")
  );
}

async function installMockBrowserApis(page: Page) {
  await page.addInitScript(() => {
    (window as any).__E2E_DECART_EVENTS__ = {
      connects: 0,
      disconnects: 0,
      initialStates: [],
      sets: [],
    };
    (window as any).__E2E_MEDIA_REQUESTS__ = [];
    (window as any).__E2E_OBJECT_URL_EVENTS__ = {
      created: [],
      revoked: [],
    };
    (window as any).__E2E_RECORDING_EVENTS__ = {
      instances: [],
      starts: 0,
      stops: 0,
    };
    let e2eObjectUrlId = 0;

    URL.createObjectURL = (value: Blob | MediaSource) => {
      e2eObjectUrlId += 1;
      const objectUrl = `blob:http://localhost/e2e-object-url-${e2eObjectUrlId}`;

      (window as any).__E2E_OBJECT_URL_EVENTS__.created.push({
        size: value instanceof Blob ? value.size : null,
        type: value instanceof Blob ? value.type : null,
        url: objectUrl,
      });

      return objectUrl;
    };

    URL.revokeObjectURL = (objectUrl: string) => {
      (window as any).__E2E_OBJECT_URL_EVENTS__.revoked.push(objectUrl);
    };

    class E2EMediaRecorder extends EventTarget {
      static isTypeSupported(mimeType: string) {
        return mimeType === "video/webm;codecs=vp8,opus" || mimeType === "video/webm";
      }

      mimeType: string;
      state: RecordingState = "inactive";

      constructor(
        public stream: MediaStream,
        options: MediaRecorderOptions = {},
      ) {
        super();
        this.mimeType = options.mimeType ?? "video/webm";
        (window as any).__E2E_RECORDING_EVENTS__.instances.push({
          audioTracks: stream.getAudioTracks().length,
          mimeType: this.mimeType,
          videoTracks: stream.getVideoTracks().length,
        });
      }

      start() {
        this.state = "recording";
        (window as any).__E2E_RECORDING_EVENTS__.starts += 1;
      }

      stop() {
        if (this.state === "inactive") {
          return;
        }

        this.state = "inactive";
        (window as any).__E2E_RECORDING_EVENTS__.stops += 1;

        window.setTimeout(() => {
          const dataEvent = new Event("dataavailable") as BlobEvent;
          Object.defineProperty(dataEvent, "data", {
            value: new Blob(["e2e recording"], { type: this.mimeType }),
          });
          this.dispatchEvent(dataEvent);
          this.dispatchEvent(new Event("stop"));
        }, 0);
      }
    }

    (window as any).MediaRecorder = E2EMediaRecorder;
    (globalThis as any).MediaRecorder = E2EMediaRecorder;

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

      const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;

      if (AudioContextConstructor) {
        const audioContext = new AudioContextConstructor();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();
        const [audioTrack] = destination.stream.getAudioTracks();

        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      }

      return stream;
    };

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async (constraints: MediaStreamConstraints) => {
          (window as any).__E2E_MEDIA_REQUESTS__.push(constraints);

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
