import { vi } from "vitest";

type MockTrackOptions = {
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
  height = 720,
  width = 1280,
}: Pick<MockTrackOptions, "height" | "width"> = {}) {
  const track = new FakeMediaStreamTrack({ height, width });
  return new FakeMediaStream([track]) as unknown as MediaStream;
}

export function createMockMediaStreamTrack({
  height = 720,
  kind = "video",
  width = 1280,
}: MockTrackOptions = {}) {
  return new FakeMediaStreamTrack({ height, kind, width }) as unknown as MockMediaStreamTrack;
}

class FakeMediaStreamTrack {
  enabled = true;
  id = "mock-track";
  kind: string;
  label = "Mock camera";
  muted = false;
  readyState: MediaStreamTrackState = "live";
  stop = vi.fn(() => {
    this.readyState = "ended";
  });

  private settings: MediaTrackSettings;

  constructor({ height = 720, kind = "video", width = 1280 }: MockTrackOptions = {}) {
    this.kind = kind;
    this.settings = { height, width };
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
      height: this.settings.height,
      kind: this.kind,
      width: this.settings.width,
    });
  }
}

class FakeMediaStream {
  active = true;
  id = "mock-stream";
  private tracks: FakeMediaStreamTrack[];

  constructor(tracks: FakeMediaStreamTrack[] = []) {
    this.tracks = tracks;
  }

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
