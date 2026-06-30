import { describe, expect, it } from "vitest";
import {
  createMockMediaStream,
  createMockMediaStreamTrack,
  type MockMediaStreamTrack,
} from "../test/mocks/browserMocks";
import {
  createLocalRecordableStream,
  createModelOutputRecordableStream,
} from "./streamComposition";

describe("streamComposition", () => {
  it("creates a local recordable stream with local video and audio", () => {
    const localStream = createMockMediaStream({ audio: true });
    const [localVideoTrack] = localStream.getVideoTracks();
    const [localAudioTrack] = localStream.getAudioTracks();

    const composition = createLocalRecordableStream(localStream);

    expect(composition.stream).not.toBeNull();
    expect(composition.videoSource).toBe("local");
    expect(composition.audioSource).toBe("local");
    expect(composition.stream?.getVideoTracks()).toEqual([localVideoTrack]);
    expect(composition.stream?.getAudioTracks()).toEqual([localAudioTrack]);
  });

  it("uses model output video and model output audio when both are present", () => {
    const localStream = createMockMediaStream({ audio: true });
    const modelOutputStream = createMockMediaStream({ audio: true });
    const [outputVideoTrack] = modelOutputStream.getVideoTracks();
    const [outputAudioTrack] = modelOutputStream.getAudioTracks();

    const composition = createModelOutputRecordableStream({
      localStream,
      modelOutputStream,
    });

    expect(composition.stream).not.toBeNull();
    expect(composition.videoSource).toBe("model-output");
    expect(composition.audioSource).toBe("model-output");
    expect(composition.stream?.getVideoTracks()).toEqual([outputVideoTrack]);
    expect(composition.stream?.getAudioTracks()).toEqual([outputAudioTrack]);
  });

  it("uses model output video with local microphone audio when output audio is absent", () => {
    const localStream = createMockMediaStream({ audio: true });
    const modelOutputStream = createMockMediaStream();
    const [outputVideoTrack] = modelOutputStream.getVideoTracks();
    const [localAudioTrack] = localStream.getAudioTracks();

    const composition = createModelOutputRecordableStream({
      localStream,
      modelOutputStream,
    });

    expect(composition.stream).not.toBeNull();
    expect(composition.videoSource).toBe("model-output");
    expect(composition.audioSource).toBe("local");
    expect(composition.stream?.getVideoTracks()).toEqual([outputVideoTrack]);
    expect(composition.stream?.getAudioTracks()).toEqual([localAudioTrack]);
  });

  it("does not expose a model recordable stream until output video exists", () => {
    const localStream = createMockMediaStream({ audio: true });
    const outputAudioTrack = createMockMediaStreamTrack({ kind: "audio" });
    const audioOnlyOutputStream = new MediaStream([outputAudioTrack]);

    expect(
      createModelOutputRecordableStream({
        localStream,
        modelOutputStream: null,
      }).stream,
    ).toBeNull();
    expect(
      createModelOutputRecordableStream({
        localStream,
        modelOutputStream: audioOnlyOutputStream,
      }).stream,
    ).toBeNull();
  });

  it("cleanup does not stop source tracks", () => {
    const localStream = createMockMediaStream({ audio: true });
    const modelOutputStream = createMockMediaStream({ audio: true });
    const sourceTracks = [
      ...localStream.getTracks(),
      ...modelOutputStream.getTracks(),
    ] as MockMediaStreamTrack[];

    const composition = createModelOutputRecordableStream({
      localStream,
      modelOutputStream,
    });

    composition.cleanup();

    for (const track of sourceTracks) {
      expect(track.stop).not.toHaveBeenCalled();
    }
  });
});
