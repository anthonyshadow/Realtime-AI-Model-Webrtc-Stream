import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockMediaStream } from "../test/mocks/browserMocks";
import {
  FakeMediaRecorder,
  installFakeMediaRecorder,
  uninstallFakeMediaRecorder,
} from "../test/mocks/fakeMediaRecorder";
import { useSessionRecording } from "./useSessionRecording";

describe("useSessionRecording", () => {
  beforeEach(() => {
    installFakeMediaRecorder();
  });

  afterEach(() => {
    uninstallFakeMediaRecorder();
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

  it("revokes object URLs on delete, new recording, and unmount", () => {
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

    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:http://localhost/second-recording");
    expect(result.current.state).toBe("recorded");
    expect(result.current.objectUrl).toBe("blob:http://localhost/second-recording");

    recordSingleChunk(result.current.startRecording);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/second-recording");
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
      "Recording failed. Try again or restart the session.",
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
      "Recording failed. Try again or restart the session.",
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

  it("keeps a recorded clip when the stream is replaced until recording again", () => {
    vi.mocked(URL.createObjectURL)
      .mockReturnValueOnce("blob:http://localhost/first-recording")
      .mockReturnValueOnce("blob:http://localhost/second-recording");
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
    expect(result.current.objectUrl).toBe("blob:http://localhost/first-recording");

    act(() => {
      rerender({ currentStream: secondStream });
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.blob).toBeInstanceOf(Blob);
    expect(result.current.objectUrl).toBe("blob:http://localhost/first-recording");

    act(() => {
      result.current.startRecording();
      FakeMediaRecorder.instances[1].emitData(new Blob(["second"]));
      result.current.stopRecording();
      FakeMediaRecorder.instances[1].emitStop();
    });

    expect(FakeMediaRecorder.instances[1].stream).toBe(secondStream);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/first-recording");
    expect(result.current.objectUrl).toBe("blob:http://localhost/second-recording");
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

  it("deleting a recorded clip after the stream disappears returns to idle", () => {
    vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:http://localhost/stopped-recording");
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
      result.current.stopRecording();
      FakeMediaRecorder.instances[0].emitStop();
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.objectUrl).toBe("blob:http://localhost/stopped-recording");

    act(() => {
      rerender({ currentStream: null });
    });

    expect(result.current.state).toBe("recorded");
    expect(result.current.objectUrl).toBe("blob:http://localhost/stopped-recording");

    act(() => {
      result.current.deleteRecording();
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/stopped-recording");
    expect(result.current.state).toBe("idle");
    expect(result.current.objectUrl).toBeNull();
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
