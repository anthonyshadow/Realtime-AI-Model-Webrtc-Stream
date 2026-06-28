import { describe, expect, it, vi } from "vitest";
import {
  createMockMediaStream,
  mockGetUserMedia,
  type MockMediaStreamTrack,
} from "../test/mocks/browserMocks";
import {
  attachStreamToVideo,
  getCameraStream,
  getLocalCameraStream,
  stopMediaStream,
} from "./media";

describe("media helpers", () => {
  it("requests a camera stream using the selected model dimensions", async () => {
    const stream = createMockMediaStream({ width: 640, height: 360 });
    mockGetUserMedia.mockResolvedValueOnce(stream);

    await expect(getCameraStream({ fps: 24, width: 640, height: 360 })).resolves.toBe(stream);

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        frameRate: 24,
        width: 640,
        height: 360,
        facingMode: "user",
      },
      audio: false,
    });
  });

  it("requests local camera and microphone without model dimensions", async () => {
    const stream = createMockMediaStream({ audio: true, width: 640, height: 360 });
    mockGetUserMedia.mockResolvedValueOnce(stream);

    await expect(getLocalCameraStream()).resolves.toBe(stream);

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: "user",
      },
      audio: true,
    });
  });

  it("throws a useful error when camera APIs are unavailable", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });

    await expect(getCameraStream({ fps: 24, width: 640, height: 360 })).rejects.toThrow(
      "Camera access is not available in this browser.",
    );
  });

  it("stops every track in a stream", () => {
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];

    stopMediaStream(stream);

    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it("stops every local video and audio track in a stream", () => {
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];

    stopMediaStream(stream);

    expect(tracks).toHaveLength(2);
    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
  });

  it("attaches and clears streams on video elements", () => {
    const stream = createMockMediaStream();
    const video = document.createElement("video");
    const pause = vi.spyOn(video, "pause");
    const load = vi.spyOn(video, "load");

    attachStreamToVideo(video, stream);
    expect(video.srcObject).toBe(stream);

    attachStreamToVideo(video, null);
    expect(video.srcObject).toBeNull();
    expect(pause).toHaveBeenCalled();
    expect(load).toHaveBeenCalled();
  });
});
