import { vi } from "vitest";
import {
  createFakeMediaStream,
  FakeMediaStream,
  FakeMediaStreamTrack,
  FakeRTCIceCandidate,
  FakeRTCPeerConnection,
  FakeRTCSessionDescription,
} from "./mediaFakes";

type MockTrackOptions = {
  audio?: boolean;
  height?: number;
  kind?: string;
  width?: number;
};

export type MockMediaStreamTrack = MediaStreamTrack & {
  stop: ReturnType<typeof vi.fn>;
};

export const mockGetUserMedia = vi.fn<Navigator["mediaDevices"]["getUserMedia"]>();

export function installBrowserMocks() {
  vi.stubGlobal("MediaStreamTrack", FakeMediaStreamTrack);
  vi.stubGlobal("MediaStream", FakeMediaStream);
  vi.stubGlobal("RTCPeerConnection", FakeRTCPeerConnection);
  vi.stubGlobal("RTCSessionDescription", FakeRTCSessionDescription);
  vi.stubGlobal("RTCIceCandidate", FakeRTCIceCandidate);

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: mockGetUserMedia,
    },
  });

  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: vi.fn(() => "blob:http://localhost/mock-object-url"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: vi.fn(),
  });

  resetBrowserMocks();
}

export function resetBrowserMocks() {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: mockGetUserMedia,
    },
  });
  mockGetUserMedia.mockReset();
  mockGetUserMedia.mockResolvedValue(createMockMediaStream());
}

export function createMockMediaStream({
  audio = false,
  height = 720,
  width = 1280,
}: Pick<MockTrackOptions, "audio" | "height" | "width"> = {}) {
  const stream = createFakeMediaStream({ audio, height, width });

  for (const track of stream.getTracks()) {
    vi.spyOn(track, "stop");
  }

  return stream;
}

export function createMockMediaStreamTrack({
  height = 720,
  kind = "video",
  width = 1280,
}: MockTrackOptions = {}) {
  const track = new FakeMediaStreamTrack({ height, kind, width });
  vi.spyOn(track, "stop");
  return track as unknown as MockMediaStreamTrack;
}
