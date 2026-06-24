import type { LucyModelSpec } from "../types/decart";

export async function getCameraStream(model: LucyModelSpec): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera access is not available in this browser.");
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      frameRate: model.fps,
      width: model.width,
      height: model.height,
      facingMode: "user",
    },
    audio: false,
  });
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
