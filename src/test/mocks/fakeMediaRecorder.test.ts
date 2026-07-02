import { afterEach, describe, expect, it } from "vitest";
import { createMockMediaStream } from "./browserMocks";
import {
  FakeMediaRecorder,
  installFakeMediaRecorder,
  uninstallFakeMediaRecorder,
} from "./fakeMediaRecorder";

describe("FakeMediaRecorder", () => {
  afterEach(() => {
    uninstallFakeMediaRecorder();
  });

  it("installs a configurable global MediaRecorder", () => {
    installFakeMediaRecorder({
      supportedMimeTypes: ["video/mp4"],
    });

    expect(globalThis.MediaRecorder).toBe(FakeMediaRecorder);
    expect(FakeMediaRecorder.isTypeSupported("video/mp4")).toBe(true);
    expect(FakeMediaRecorder.isTypeSupported("video/webm")).toBe(false);
  });

  it("records instances and can emit recorder events", () => {
    installFakeMediaRecorder();
    const stream = createMockMediaStream();
    const recorder = new FakeMediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.addEventListener("dataavailable", (event) => {
      chunks.push((event as BlobEvent).data);
    });
    recorder.start();
    recorder.emitData(new Blob(["clip"]));
    recorder.emitStop();

    expect(FakeMediaRecorder.instances).toEqual([recorder]);
    expect(recorder.state).toBe("recording");
    expect(chunks).toHaveLength(1);
  });

  it("can simulate start failures", () => {
    installFakeMediaRecorder({ shouldThrowOnStart: true });
    const recorder = new FakeMediaRecorder(createMockMediaStream());

    expect(() => recorder.start()).toThrow("start failed");
    expect(recorder.state).toBe("inactive");
  });
});
