import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockMediaStream } from "../test/mocks/browserMocks";
import { useSessionRecording } from "./useSessionRecording";

class FakeMediaRecorder extends EventTarget {
  static instances: FakeMediaRecorder[] = [];
  static supportedMimeTypes = new Set<string>();
  static shouldThrowOnStart = false;
  static isTypeSupported = vi.fn((mimeType: string) =>
    FakeMediaRecorder.supportedMimeTypes.has(mimeType),
  );

  mimeType: string;
  state: RecordingState = "inactive";
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

  static reset(supportedMimeTypes = ["video/webm;codecs=vp8,opus"]) {
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.supportedMimeTypes = new Set(supportedMimeTypes);
    FakeMediaRecorder.shouldThrowOnStart = false;
    FakeMediaRecorder.isTypeSupported.mockClear();
  }
}

type RecordingState = "inactive" | "recording" | "paused";

describe("useSessionRecording", () => {
  beforeEach(() => {
    FakeMediaRecorder.reset();
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
  });

  afterEach(() => {
    vi.stubGlobal("MediaRecorder", undefined);
    vi.useRealTimers();
  });

  it("reports unsupported browsers without assuming MediaRecorder exists", () => {
    vi.stubGlobal("MediaRecorder", undefined);
    const stream = createMockMediaStream();
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "local" }),
    );

    expect(result.current.state).toBe("error");
    expect(result.current.isSupported).toBe(false);
    expect(result.current.canRecord).toBe(false);
    expect(result.current.error).toBe("Recording is not supported in this browser.");
  });

  it("handles starting with no stream safely", () => {
    const { result } = renderHook(() =>
      useSessionRecording(null, { sessionMode: "local" }),
    );
    let didStart = true;

    act(() => {
      didStart = result.current.startRecording();
    });

    expect(didStart).toBe(false);
    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe("Start a live session before recording.");
    expect(FakeMediaRecorder.instances).toHaveLength(0);
  });

  it("starts recording with the selected supported MIME type", () => {
    const stream = createMockMediaStream({ audio: true });
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "local" }),
    );
    let didStart = false;

    expect(result.current.state).toBe("ready");
    expect(result.current.mimeType).toBe("video/webm;codecs=vp8,opus");

    act(() => {
      didStart = result.current.startRecording();
    });

    expect(didStart).toBe(true);
    expect(result.current.state).toBe("recording");
    expect(result.current.isRecording).toBe(true);
    expect(result.current.startedAt).toBeInstanceOf(Date);
    expect(FakeMediaRecorder.instances).toHaveLength(1);
    expect(FakeMediaRecorder.instances[0].stream).toBe(stream);
    expect(FakeMediaRecorder.instances[0].mimeType).toBe("video/webm;codecs=vp8,opus");
    expect(FakeMediaRecorder.instances[0].start).toHaveBeenCalledTimes(1);
  });

  it("collects chunks and creates a recorded Blob, URL, filename, duration, and size", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 28, 16, 45, 0));
    const stream = createMockMediaStream();
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "lucy-2.1" }),
    );

    act(() => {
      result.current.startRecording();
    });

    const recorder = FakeMediaRecorder.instances[0];
    act(() => {
      recorder.emitData(new Blob(["hello"], { type: "video/webm" }));
      recorder.emitData(new Blob([" world"], { type: "video/webm" }));
      vi.advanceTimersByTime(7000);
    });

    expect(result.current.elapsedSeconds).toBe(7);
    expect(result.current.elapsedLabel).toBe("00:07");

    vi.setSystemTime(new Date(2026, 5, 28, 16, 45, 7));
    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.state).toBe("stopping");
    expect(recorder.stop).toHaveBeenCalledTimes(1);

    act(() => {
      recorder.emitStop();
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(result.current.blob?.size).toBe(11);
    expect(result.current.objectUrl).toBe("blob:http://localhost/mock-object-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(result.current.blob);
    expect(result.current.filename).toBe("session-lucy-2-1-2026-06-28-16-45.webm");
    expect(result.current.durationSeconds).toBe(7);
    expect(result.current.durationLabel).toBe("00:07");
    expect(result.current.sizeBytes).toBe(11);
    expect(result.current.sizeLabel).toBe("11 B");
  });

  it("revokes object URLs on delete, reset, replacement, and unmount", () => {
    const createObjectUrlMock = vi.mocked(URL.createObjectURL);
    createObjectUrlMock
      .mockReturnValueOnce("blob:http://localhost/first-recording")
      .mockReturnValueOnce("blob:http://localhost/second-recording")
      .mockReturnValueOnce("blob:http://localhost/third-recording");
    const stream = createMockMediaStream();
    const { rerender, result, unmount } = renderHook(
      ({ currentStream }) =>
        useSessionRecording(currentStream, { sessionMode: "local" }),
      {
        initialProps: {
          currentStream: stream as MediaStream | null,
        },
      },
    );

    recordSingleChunk(result.current.startRecording);
    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["first"]));
      result.current.stopRecording();
      FakeMediaRecorder.instances[0].emitStop();
    });

    expect(result.current.objectUrl).toBe("blob:http://localhost/first-recording");

    act(() => {
      result.current.deleteRecording();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/first-recording");
    expect(result.current.state).toBe("ready");
    expect(result.current.objectUrl).toBeNull();

    recordSingleChunk(result.current.startRecording);
    act(() => {
      FakeMediaRecorder.instances[1].emitData(new Blob(["second"]));
      result.current.stopRecording();
      FakeMediaRecorder.instances[1].emitStop();
    });

    expect(result.current.objectUrl).toBe("blob:http://localhost/second-recording");

    act(() => {
      rerender({ currentStream: createMockMediaStream() });
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/second-recording");
    expect(result.current.state).toBe("ready");
    expect(result.current.objectUrl).toBeNull();

    recordSingleChunk(result.current.startRecording);
    act(() => {
      FakeMediaRecorder.instances[2].emitData(new Blob(["third"]));
      result.current.stopRecording();
      FakeMediaRecorder.instances[2].emitStop();
    });

    expect(result.current.objectUrl).toBe("blob:http://localhost/third-recording");
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/third-recording");
  });

  it("handles recorder error events with a user-safe error", () => {
    const stream = createMockMediaStream();
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "local" }),
    );

    act(() => {
      result.current.startRecording();
    });

    const recorder = FakeMediaRecorder.instances[0];
    act(() => {
      recorder.emitError(new Error("encoder failed"));
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe(
      "Recording failed. Try starting a new recording. (encoder failed)",
    );
    expect(result.current.blob).toBeNull();
    expect(result.current.objectUrl).toBeNull();
    expect(recorder.stop).toHaveBeenCalledTimes(1);
  });

  it("handles recorder start failures with a user-safe error", () => {
    FakeMediaRecorder.shouldThrowOnStart = true;
    const stream = createMockMediaStream();
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "local" }),
    );
    let didStart = true;

    act(() => {
      didStart = result.current.startRecording();
    });

    expect(didStart).toBe(false);
    expect(result.current.state).toBe("error");
    expect(result.current.error).toBe(
      "Could not start recording. Check browser recording support and try again.",
    );
    expect(FakeMediaRecorder.instances[0].stop).not.toHaveBeenCalled();
  });

  it("calling stop when not recording is safe", () => {
    const stream = createMockMediaStream();
    const { result } = renderHook(() =>
      useSessionRecording(stream, { sessionMode: "local" }),
    );

    act(() => {
      result.current.stopRecording();
    });

    expect(result.current.state).toBe("ready");
    expect(FakeMediaRecorder.instances).toHaveLength(0);
  });

  it("resets readiness when the stream is replaced", () => {
    const firstStream = createMockMediaStream();
    const secondStream = createMockMediaStream({ audio: true });
    const { rerender, result } = renderHook(
      ({ currentStream }) =>
        useSessionRecording(currentStream, { sessionMode: "local" }),
      {
        initialProps: {
          currentStream: firstStream as MediaStream | null,
        },
      },
    );

    act(() => {
      result.current.startRecording();
      FakeMediaRecorder.instances[0].emitData(new Blob(["first"]));
      result.current.stopRecording();
      FakeMediaRecorder.instances[0].emitStop();
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.blob).toBeInstanceOf(Blob);

    act(() => {
      rerender({ currentStream: secondStream });
    });

    expect(result.current.state).toBe("ready");
    expect(result.current.blob).toBeNull();
    expect(result.current.objectUrl).toBeNull();

    act(() => {
      result.current.startRecording();
    });

    expect(FakeMediaRecorder.instances[1].stream).toBe(secondStream);
  });

  it("finalizes the active recorder when the source stream disappears", () => {
    const stream = createMockMediaStream();
    const { rerender, result } = renderHook(
      ({ currentStream }) =>
        useSessionRecording(currentStream, { sessionMode: "local" }),
      {
        initialProps: {
          currentStream: stream as MediaStream | null,
        },
      },
    );

    act(() => {
      result.current.startRecording();
      FakeMediaRecorder.instances[0].emitData(new Blob(["clip"]));
      rerender({ currentStream: null });
    });

    expect(result.current.state).toBe("stopping");
    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);

    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.blob?.size).toBe(4);
  });

  it("finalizes the active recorder when the source stream is replaced while recording", () => {
    const firstStream = createMockMediaStream();
    const secondStream = createMockMediaStream({ audio: true });
    const { rerender, result } = renderHook(
      ({ currentStream }) =>
        useSessionRecording(currentStream, { sessionMode: "local" }),
      {
        initialProps: {
          currentStream: firstStream,
        },
      },
    );

    act(() => {
      result.current.startRecording();
      FakeMediaRecorder.instances[0].emitData(new Blob(["clip"]));
      rerender({ currentStream: secondStream });
    });

    expect(result.current.state).toBe("stopping");
    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);

    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.blob?.size).toBe(4);
    expect(FakeMediaRecorder.instances[0].stream).toBe(firstStream);
  });
});

function recordSingleChunk(startRecording: () => boolean) {
  act(() => {
    startRecording();
  });
}
