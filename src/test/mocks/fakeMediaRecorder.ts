import { vi } from "vitest";

export type FakeRecordingState = "inactive" | "paused" | "recording";

export type FakeMediaRecorderResetOptions = {
  shouldThrowOnStart?: boolean;
  supportedMimeTypes?: string[];
};

export class FakeMediaRecorder extends EventTarget {
  static instances: FakeMediaRecorder[] = [];
  static shouldThrowOnStart = false;
  static supportedMimeTypes = new Set<string>();
  static isTypeSupported = vi.fn((mimeType: string) =>
    FakeMediaRecorder.supportedMimeTypes.has(mimeType),
  );

  mimeType: string;
  state: FakeRecordingState = "inactive";
  start = vi.fn(() => {
    if (FakeMediaRecorder.shouldThrowOnStart) {
      throw new Error("start failed");
    }

    this.state = "recording";
  });
  stop = vi.fn(() => {
    this.state = "inactive";
  });

  constructor(
    public stream: MediaStream,
    options: MediaRecorderOptions = {},
  ) {
    super();
    this.mimeType = options.mimeType ?? "video/webm";
    FakeMediaRecorder.instances.push(this);
  }

  emitData(data: Blob) {
    const event = new Event("dataavailable") as BlobEvent;
    Object.defineProperty(event, "data", {
      value: data,
    });
    this.dispatchEvent(event);
  }

  emitError(error = new Error("encoder failed")) {
    const event = new Event("error") as Event & { error: Error };
    Object.defineProperty(event, "error", {
      value: error,
    });
    this.dispatchEvent(event);
  }

  emitStop() {
    this.dispatchEvent(new Event("stop"));
  }

  static reset({
    shouldThrowOnStart = false,
    supportedMimeTypes = ["video/webm;codecs=vp8,opus"],
  }: FakeMediaRecorderResetOptions = {}) {
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.supportedMimeTypes = new Set(supportedMimeTypes);
    FakeMediaRecorder.shouldThrowOnStart = shouldThrowOnStart;
    FakeMediaRecorder.isTypeSupported.mockClear();
  }
}

export function installFakeMediaRecorder(
  options?: FakeMediaRecorderResetOptions,
) {
  FakeMediaRecorder.reset(options);
  vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
}

export function uninstallFakeMediaRecorder() {
  vi.stubGlobal("MediaRecorder", undefined);
}
