export type RecordableStreamSource = "none" | "local" | "model-output";
export type RecordableAudioSource = "none" | "local" | "model-output";

export type RecordableStreamComposition = {
  audioSource: RecordableAudioSource;
  cleanup: () => void;
  stream: MediaStream | null;
  videoSource: RecordableStreamSource;
};

const NO_RECORDABLE_STREAM: RecordableStreamComposition = {
  audioSource: "none",
  cleanup: () => undefined,
  stream: null,
  videoSource: "none",
};

export function createLocalRecordableStream(
  localStream: MediaStream | null,
): RecordableStreamComposition {
  if (!localStream) {
    return NO_RECORDABLE_STREAM;
  }

  const videoTracks = localStream.getVideoTracks();

  if (videoTracks.length === 0) {
    return NO_RECORDABLE_STREAM;
  }

  const audioTracks = localStream.getAudioTracks();

  return {
    audioSource: audioTracks.length > 0 ? "local" : "none",
    cleanup: () => undefined,
    stream: new MediaStream([...videoTracks, ...audioTracks]),
    videoSource: "local",
  };
}

export function createModelOutputRecordableStream({
  localStream,
  modelOutputStream,
}: {
  localStream: MediaStream | null;
  modelOutputStream: MediaStream | null;
}): RecordableStreamComposition {
  if (!modelOutputStream) {
    return NO_RECORDABLE_STREAM;
  }

  const outputVideoTracks = modelOutputStream.getVideoTracks();

  if (outputVideoTracks.length === 0) {
    return NO_RECORDABLE_STREAM;
  }

  const outputAudioTracks = modelOutputStream.getAudioTracks();
  const localAudioTracks = localStream?.getAudioTracks() ?? [];
  const audioTracks = outputAudioTracks.length > 0
    ? outputAudioTracks
    : localAudioTracks;

  return {
    audioSource: outputAudioTracks.length > 0
      ? "model-output"
      : audioTracks.length > 0
        ? "local"
        : "none",
    cleanup: () => undefined,
    stream: new MediaStream([...outputVideoTracks, ...audioTracks]),
    videoSource: "model-output",
  };
}
