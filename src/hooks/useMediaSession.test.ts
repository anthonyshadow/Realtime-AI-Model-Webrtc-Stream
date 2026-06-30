import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMockMediaStream,
  mockGetUserMedia,
  type MockMediaStreamTrack,
} from "../test/mocks/browserMocks";
import { useMediaSession } from "./useMediaSession";

describe("useMediaSession", () => {
  it("starts and stops local camera and microphone streams", async () => {
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useMediaSession());
    let startedStream: MediaStream | null = null;

    await act(async () => {
      startedStream = await result.current.startLocalCamera();
    });

    expect(startedStream).toBe(stream);
    expect(result.current.localStream).toBe(stream);
    expect(result.current.mediaStatus).toBe("ready");
    expect(result.current.mediaError).toBeNull();
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: "user",
      },
      audio: true,
    });

    act(() => {
      result.current.stop();
    });

    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
    expect(result.current.localStream).toBeNull();
    expect(result.current.mediaStatus).toBe("idle");
  });

  it("maps permission errors and leaves no active stream", async () => {
    const permissionError = Object.assign(new Error("Denied"), { name: "NotAllowedError" });
    mockGetUserMedia.mockRejectedValueOnce(permissionError);
    const { result } = renderHook(() => useMediaSession());

    await act(async () => {
      await expect(result.current.startLocalCamera()).rejects.toThrow("Denied");
    });

    expect(result.current.localStream).toBeNull();
    expect(result.current.mediaStatus).toBe("error");
    expect(result.current.mediaError).toBe(
      "Camera permission was denied. Allow camera access and try again.",
    );
  });

  it("starts model camera with microphone audio for output recording fallback", async () => {
    const stream = createMockMediaStream({ audio: true });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useMediaSession());

    await act(async () => {
      await result.current.startModelCamera({ fps: 24, height: 360, width: 640 });
    });

    expect(result.current.localStream).toBe(stream);
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        frameRate: 24,
        width: 640,
        height: 360,
        facingMode: "user",
      },
      audio: true,
    });
  });

  it("stops active media tracks on unmount", async () => {
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result, unmount } = renderHook(() => useMediaSession());

    await act(async () => {
      await result.current.startLocalCamera();
    });

    unmount();

    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
  });
});
