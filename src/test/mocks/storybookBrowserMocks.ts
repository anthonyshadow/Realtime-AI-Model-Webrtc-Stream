import type { ConnectionState } from "@decartai/sdk";

export type StorybookCameraMode = "denied" | "ready" | "unavailable";
export type StorybookConnectionMode = "connected" | "connect-error";

export type StorybookBrowserMockOptions = {
  camera?: StorybookCameraMode;
  connection?: StorybookConnectionMode;
};

type StorybookDecartEvents = {
  connects: number;
  disconnects: number;
  initialStates: Array<{
    enhance: boolean | null;
    imageName: string | null;
    prompt: string | null;
  }>;
  sets: Array<{
    enhance: boolean | null;
    imageName: string | null;
    prompt: string | null;
  }>;
};

type CanvasStreamOptions = {
  accent?: string;
  fps?: number;
  height?: number;
  label?: string;
  width?: number;
};

type RealtimeConnectOptions = {
  initialState?: {
    image?: File;
    prompt?: {
      enhance?: boolean;
      text?: string;
    };
  };
  onConnectionChange?: (state: ConnectionState) => void;
  onRemoteStream?: (stream: MediaStream) => void;
};

type RealtimeSetPayload = {
  enhance?: boolean;
  image?: File;
  prompt?: string;
};

declare global {
  interface Window {
    __STORYBOOK_DECART_EVENTS__?: StorybookDecartEvents;
  }
}

const DEFAULT_OPTIONS: Required<StorybookBrowserMockOptions> = {
  camera: "ready",
  connection: "connected",
};

const retainedCanvases: HTMLCanvasElement[] = [];
let currentOptions: Required<StorybookBrowserMockOptions> = DEFAULT_OPTIONS;

export function installStorybookBrowserMocks(options: StorybookBrowserMockOptions = {}) {
  if (typeof window === "undefined") {
    return;
  }

  installRtcMocks();
  patchMediaDevices();
  patchVideoElement();
  patchObjectUrl();
  installDecartSdkMock();
  resetStorybookBrowserMocks(options);
}

export function resetStorybookBrowserMocks(options: StorybookBrowserMockOptions = {}) {
  if (typeof window === "undefined") {
    return;
  }

  currentOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  window.__STORYBOOK_DECART_EVENTS__ = {
    connects: 0,
    disconnects: 0,
    initialStates: [],
    sets: [],
  };
}

export function setStorybookCameraMode(camera: StorybookCameraMode) {
  currentOptions = {
    ...currentOptions,
    camera,
  };
}

export function setStorybookConnectionMode(connection: StorybookConnectionMode) {
  currentOptions = {
    ...currentOptions,
    connection,
  };
}

export function createStorybookMediaStream({
  accent = "#67e8f9",
  fps = 24,
  height = 720,
  label = "Mock realtime stream",
  width = 1280,
}: CanvasStreamOptions = {}): MediaStream {
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (context && "captureStream" in canvas) {
      drawMockFrame(context, { accent, height, label, width });
      retainedCanvases.push(canvas);

      if (retainedCanvases.length > 12) {
        retainedCanvases.shift();
      }

      const stream = canvas.captureStream(fps);
      patchVideoTrackSettings(stream, { fps, height, width });
      return stream;
    }
  }

  return new FakeMediaStream([
    new FakeMediaStreamTrack({
      fps,
      height,
      width,
    }),
  ]) as unknown as MediaStream;
}

function patchMediaDevices() {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: async () => {
        if (currentOptions.camera === "unavailable") {
          throw new Error("Camera access is not available in this browser.");
        }

        if (currentOptions.camera === "denied") {
          const error = new Error("Denied");
          error.name = "NotAllowedError";
          throw error;
        }

        return createStorybookMediaStream({
          accent: "#22d3ee",
          label: "Mock camera stream",
        });
      },
    },
  });
}

function patchVideoElement() {
  HTMLMediaElement.prototype.play = () => Promise.resolve();
  HTMLMediaElement.prototype.pause = () => undefined;
  HTMLMediaElement.prototype.load = () => undefined;
}

function patchObjectUrl() {
  if (!URL.createObjectURL) {
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: () => placeholderImageDataUrl,
    });
  }

  if (!URL.revokeObjectURL) {
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: () => undefined,
    });
  }
}

function installRtcMocks() {
  Object.defineProperty(window, "RTCPeerConnection", {
    configurable: true,
    value: FakeRTCPeerConnection,
  });
  Object.defineProperty(window, "RTCSessionDescription", {
    configurable: true,
    value: FakeRTCSessionDescription,
  });
  Object.defineProperty(window, "RTCIceCandidate", {
    configurable: true,
    value: FakeRTCIceCandidate,
  });
}

function installDecartSdkMock() {
  (globalThis as { __DECART_TEST_SDK__?: unknown }).__DECART_TEST_SDK__ = {
    createDecartClient: () => ({
      realtime: {
        connect: async (_stream: MediaStream, options: RealtimeConnectOptions) => {
          if (currentOptions.connection === "connect-error") {
            throw new Error("Mock Decart connection failed.");
          }

          const events = window.__STORYBOOK_DECART_EVENTS__;

          if (events) {
            events.connects += 1;
            events.initialStates.push(summarizeInitialState(options.initialState));
          }

          options.onRemoteStream?.(
            createStorybookMediaStream({
              accent: "#34d399",
              label: "Mock Decart stream",
            }),
          );
          options.onConnectionChange?.("connected");

          return {
            disconnect: () => {
              const events = window.__STORYBOOK_DECART_EVENTS__;

              if (events) {
                events.disconnects += 1;
              }
            },
            getConnectionState: () => "connected" as ConnectionState,
            on: () => undefined,
            set: async (payload: RealtimeSetPayload) => {
              window.__STORYBOOK_DECART_EVENTS__?.sets.push(summarizeSetPayload(payload));
              options.onConnectionChange?.("generating");
            },
          };
        },
      },
    }),
    models: {
      realtime: (modelId: string) => ({
        fps: 24,
        height: 720,
        id: modelId,
        width: 1280,
      }),
    },
    noopLogger: {},
  };
}

function summarizeInitialState(initialState: RealtimeConnectOptions["initialState"]) {
  return {
    enhance: initialState?.prompt?.enhance ?? null,
    imageName: initialState?.image?.name ?? null,
    prompt: initialState?.prompt?.text ?? null,
  };
}

function summarizeSetPayload(payload: RealtimeSetPayload) {
  return {
    enhance: payload.enhance ?? null,
    imageName: payload.image?.name ?? null,
    prompt: payload.prompt ?? null,
  };
}

function drawMockFrame(
  context: CanvasRenderingContext2D,
  {
    accent,
    height,
    label,
    width,
  }: Required<Pick<CanvasStreamOptions, "accent" | "height" | "label" | "width">>,
) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#0a0a0a");
  gradient.addColorStop(0.58, "#1f2937");
  gradient.addColorStop(1, "#020617");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = accent;
  context.globalAlpha = 0.78;
  context.fillRect(width * 0.18, height * 0.2, width * 0.16, height * 0.32);
  context.fillRect(width * 0.42, height * 0.34, width * 0.32, height * 0.18);
  context.globalAlpha = 1;

  context.fillStyle = "rgba(255, 255, 255, 0.88)";
  context.font = "600 32px Inter, system-ui, sans-serif";
  context.fillText(label, width * 0.08, height * 0.86);
}

function patchVideoTrackSettings(
  stream: MediaStream,
  {
    fps,
    height,
    width,
  }: Required<Pick<CanvasStreamOptions, "fps" | "height" | "width">>,
) {
  for (const track of stream.getVideoTracks()) {
    const readSettings = track.getSettings.bind(track);

    track.getSettings = () => ({
      ...readSettings(),
      frameRate: fps,
      height,
      width,
    });
  }
}

type FakeTrackOptions = {
  fps: number;
  height: number;
  kind?: string;
  width: number;
};

class FakeMediaStreamTrack {
  enabled = true;
  id = "storybook-mock-track";
  kind: string;
  label = "Storybook mock camera";
  muted = false;
  readyState: MediaStreamTrackState = "live";

  private settings: MediaTrackSettings;

  constructor({ fps, height, kind = "video", width }: FakeTrackOptions) {
    this.kind = kind;
    this.settings = {
      frameRate: fps,
      height,
      width,
    };
  }

  stop() {
    this.readyState = "ended";
  }
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
  getCapabilities() {
    return {};
  }
  getConstraints() {
    return {};
  }
  getSettings() {
    return this.settings;
  }
  applyConstraints() {
    return Promise.resolve();
  }
  clone() {
    return new FakeMediaStreamTrack({
      fps: this.settings.frameRate ?? 24,
      height: this.settings.height ?? 720,
      kind: this.kind,
      width: this.settings.width ?? 1280,
    });
  }
}

class FakeMediaStream {
  active = true;
  id = "storybook-mock-stream";

  constructor(private tracks: FakeMediaStreamTrack[] = []) {}

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
  addTrack(track: FakeMediaStreamTrack) {
    this.tracks.push(track);
  }
  removeTrack(track: FakeMediaStreamTrack) {
    this.tracks = this.tracks.filter((item) => item !== track);
  }
  getTracks() {
    return this.tracks;
  }
  getVideoTracks() {
    return this.tracks.filter((track) => track.kind === "video");
  }
  getAudioTracks() {
    return this.tracks.filter((track) => track.kind === "audio");
  }
  clone() {
    return new FakeMediaStream(this.tracks.map((track) => track.clone()));
  }
}

class FakeRTCPeerConnection {
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

class FakeRTCSessionDescription {
  constructor(public init: RTCSessionDescriptionInit) {}
}

class FakeRTCIceCandidate {
  constructor(public init?: RTCIceCandidateInit) {}
}

const placeholderImageDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
