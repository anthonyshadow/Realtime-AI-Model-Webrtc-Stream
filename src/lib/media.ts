import type { LucyModelSpec } from "../types/decart";

const CAMERA_DIMENSIONS_TIMEOUT_MS = 2500;
const CAMERA_DIMENSIONS_POLL_MS = 50;

type CameraStreamOptions = {
  audio?: boolean | MediaTrackConstraints;
};

export async function getCameraStream(
  model: LucyModelSpec,
  options: CameraStreamOptions = {},
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access is not available in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      frameRate: model.fps,
      width: model.width,
      height: model.height,
      facingMode: "user",
    },
    audio: options.audio ?? false,
  });

  try {
    await waitForVideoTrackDimensions(stream);
  } catch (error) {
    stopMediaStream(stream);
    throw error;
  }

  return stream;
}

export async function getLocalCameraStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access is not available in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
    },
    audio: true,
  });

  try {
    await waitForVideoTrackDimensions(stream);
  } catch (error) {
    stopMediaStream(stream);
    throw error;
  }

  return stream;
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function attachStreamToVideo(video: HTMLVideoElement | null, stream: MediaStream | null) {
  if (!video) {
    return;
  }

  video.srcObject = stream;

  if (!stream) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    return;
  }

  void video.play().catch(() => undefined);
}

async function waitForVideoTrackDimensions(stream: MediaStream) {
  const [videoTrack] = stream.getVideoTracks();

  if (!videoTrack) {
    throw new Error("Camera did not provide a video track.");
  }

  const warmupVideo = createWarmupVideo(videoTrack);
  const startedAt = Date.now();

  try {
    while (Date.now() - startedAt < CAMERA_DIMENSIONS_TIMEOUT_MS) {
      if (hasVideoDimensions(videoTrack)) {
        return;
      }

      if (videoTrack.readyState === "ended") {
        throw new Error("Camera stream ended before it produced video.");
      }

      await sleep(CAMERA_DIMENSIONS_POLL_MS);
    }
  } finally {
    warmupVideo?.pause();

    if (warmupVideo) {
      warmupVideo.srcObject = null;
    }
  }

  throw new Error("Camera started, but the browser did not report video dimensions.");
}

function hasVideoDimensions(track: MediaStreamTrack) {
  const { width, height } = track.getSettings();
  return Boolean(width && height);
}

function createWarmupVideo(track: MediaStreamTrack) {
  if (typeof document === "undefined") {
    return null;
  }

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = new MediaStream([track]);
  void video.play().catch(() => undefined);

  return video;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
