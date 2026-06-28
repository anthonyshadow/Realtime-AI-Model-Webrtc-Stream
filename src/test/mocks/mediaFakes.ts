export type FakeMediaStreamTrackOptions = {
  fps?: number;
  height?: number;
  kind?: string;
  label?: string;
  trackId?: string;
  width?: number;
};

export class FakeMediaStreamTrack {
  enabled = true;
  id: string;
  kind: string;
  label: string;
  muted = false;
  readyState: MediaStreamTrackState = "live";

  private settings: MediaTrackSettings;

  constructor({
    fps,
    height = 720,
    kind = "video",
    label = "Mock camera",
    trackId = "mock-track",
    width = 1280,
  }: FakeMediaStreamTrackOptions = {}) {
    this.id = trackId;
    this.kind = kind;
    this.label = label;
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
      fps: this.settings.frameRate,
      height: this.settings.height,
      kind: this.kind,
      label: this.label,
      trackId: this.id,
      width: this.settings.width,
    });
  }
}

export class FakeMediaStream {
  id: string;

  constructor(
    private tracks: FakeMediaStreamTrack[] = [],
    streamId = "mock-stream",
  ) {
    this.id = streamId;
  }

  get active() {
    return this.tracks.some((track) => track.readyState === "live");
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
    return new FakeMediaStream(this.tracks.map((track) => track.clone()), this.id);
  }
}

export class FakeRTCPeerConnection {
  addEventListener() {}
  removeEventListener() {}
  close() {}
}

export class FakeRTCSessionDescription {
  constructor(public init: RTCSessionDescriptionInit) {}
}

export class FakeRTCIceCandidate {
  constructor(public init?: RTCIceCandidateInit) {}
}

export function createFakeMediaStream({
  fps,
  height = 720,
  label = "Mock camera",
  streamId = "mock-stream",
  trackId = "mock-track",
  width = 1280,
}: FakeMediaStreamTrackOptions & { streamId?: string } = {}) {
  return new FakeMediaStream(
    [
      new FakeMediaStreamTrack({
        fps,
        height,
        label,
        trackId,
        width,
      }),
    ],
    streamId,
  ) as unknown as MediaStream;
}
