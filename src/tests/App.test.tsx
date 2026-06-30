import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import {
  createMockMediaStream,
  mockGetUserMedia,
  type MockMediaStreamTrack,
} from "../test/mocks/browserMocks";

const decartMocks = vi.hoisted(() => ({
  connectRealtimeModel: vi.fn(),
  createBrowserDecartClient: vi.fn(),
  fetchRealtimeToken: vi.fn(),
  getRealtimeModel: vi.fn(),
  realtimeClient: {
    disconnect: vi.fn(),
    getConnectionState: vi.fn(),
    on: vi.fn(),
    set: vi.fn(),
    setPrompt: vi.fn(),
  },
}));

vi.mock("../lib/decartClient", () => ({
  connectRealtimeModel: decartMocks.connectRealtimeModel,
  createBrowserDecartClient: decartMocks.createBrowserDecartClient,
  fetchRealtimeToken: decartMocks.fetchRealtimeToken,
  getRealtimeModel: decartMocks.getRealtimeModel,
}));

class FakeMediaRecorder extends EventTarget {
  static instances: FakeMediaRecorder[] = [];
  static supportedMimeTypes = new Set<string>();
  static isTypeSupported = vi.fn((mimeType: string) =>
    FakeMediaRecorder.supportedMimeTypes.has(mimeType),
  );

  mimeType: string;
  state: RecordingState = "inactive";
  start = vi.fn(() => {
    this.state = "recording";
  });
  stop = vi.fn(() => {
    this.state = "inactive";
  });

  constructor(
    public stream: MediaStream,
    options: MediaRecorderOptions = {},
  ) {
    super();
    this.mimeType = options.mimeType ?? "video/webm";
    FakeMediaRecorder.instances.push(this);
  }

  emitData(data: Blob) {
    const event = new Event("dataavailable") as BlobEvent;
    Object.defineProperty(event, "data", {
      value: data,
    });
    this.dispatchEvent(event);
  }

  emitError(error = new Error("encoder failed")) {
    const event = new Event("error") as Event & { error: Error };
    Object.defineProperty(event, "error", {
      value: error,
    });
    this.dispatchEvent(event);
  }

  emitStop() {
    this.dispatchEvent(new Event("stop"));
  }

  static reset(supportedMimeTypes = ["video/webm;codecs=vp8,opus"]) {
    FakeMediaRecorder.instances = [];
    FakeMediaRecorder.supportedMimeTypes = new Set(supportedMimeTypes);
    FakeMediaRecorder.isTypeSupported.mockClear();
  }
}

type RecordingState = "inactive" | "recording" | "paused";

describe("App", () => {
  beforeEach(() => {
    FakeMediaRecorder.reset();
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    decartMocks.getRealtimeModel.mockResolvedValue({ fps: 24, height: 360, width: 640 });
    decartMocks.fetchRealtimeToken.mockResolvedValue({
      apiKey: "ek_test_client_token",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
    decartMocks.createBrowserDecartClient.mockResolvedValue({ realtime: {} });
    decartMocks.realtimeClient.disconnect.mockReset();
    decartMocks.realtimeClient.getConnectionState.mockReset();
    decartMocks.realtimeClient.getConnectionState.mockReturnValue("connected");
    decartMocks.realtimeClient.on.mockReset();
    decartMocks.realtimeClient.set.mockReset();
    decartMocks.realtimeClient.set.mockResolvedValue(undefined);
    decartMocks.realtimeClient.setPrompt.mockReset();
    decartMocks.realtimeClient.setPrompt.mockResolvedValue(undefined);
    decartMocks.connectRealtimeModel.mockReset();
    decartMocks.connectRealtimeModel.mockImplementation(async ({ stream, onConnectionChange, onRemoteStream }) => {
      onRemoteStream(stream);
      onConnectionChange("connected");
      return decartMocks.realtimeClient;
    });
  });

  afterEach(() => {
    vi.stubGlobal("MediaRecorder", undefined);
  });

  it("renders the idle video stage and ready controls", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Start camera to begin" })).toBeInTheDocument();
    expect(screen.getAllByText("Local camera").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Camera and microphone").length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/Transformation prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: /Enhance prompt/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
    expect(screen.queryByRole("region", { name: "Recording dock" })).not.toBeInTheDocument();
  });

  it("starts a local camera session without touching Decart", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream({ audio: true });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled());
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: "user",
      },
      audio: true,
    });
    expect(decartMocks.getRealtimeModel).not.toHaveBeenCalled();
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.createBrowserDecartClient).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
    expect(decartMocks.realtimeClient.disconnect).not.toHaveBeenCalled();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Live studio controls" }),
    ).not.toContainElement(screen.getByRole("region", { name: "Recording dock" }));
  });

  it("records an active local camera session without touching Decart", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream({ audio: true });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(FakeMediaRecorder.instances).toHaveLength(1);
    expect(FakeMediaRecorder.instances[0].stream.getVideoTracks()).toEqual(
      stream.getVideoTracks(),
    );
    expect(FakeMediaRecorder.instances[0].stream.getAudioTracks()).toEqual(
      stream.getAudioTracks(),
    );
    expect(FakeMediaRecorder.instances[0].start).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Recording").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /Lucy 2.1/i })).not.toBeInTheDocument();
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
  });

  it("stops local recording without stopping the live camera session", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record" }));
    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["clip"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop recording" }));

    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Stopping recording" })).toBeDisabled();

    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    await waitFor(() => expect(screen.getByText("Clip captured")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled();
    expect((document.querySelector("video") as HTMLVideoElement | null)?.srcObject).toBe(stream);
    for (const track of tracks) {
      expect(track.stop).not.toHaveBeenCalled();
    }
    expect(decartMocks.realtimeClient.disconnect).not.toHaveBeenCalled();
  });

  it("shows playback, download, and discard after recording stops", async () => {
    const user = userEvent.setup();
    vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:http://localhost/local-clip");
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record" }));

    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["clip"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop recording" }));
    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);
    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    await waitFor(() => expect(screen.getByLabelText("Recording playback")).toBeInTheDocument());
    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/local-clip",
    );
    const download = screen.getByRole("link", { name: "Download" });
    expect(download).toHaveAttribute("href", "blob:http://localhost/local-clip");
    expect(download.getAttribute("download")).toMatch(/^session-local-.*\.webm$/);
    expect(screen.getByText("4 B")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:http://localhost/local-clip");
    expect(screen.getByText("Discard this take? This removes the local clip only.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Discard clip" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/local-clip");
    expect(screen.queryByLabelText("Recording playback")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeEnabled();
    for (const track of tracks) {
      expect(track.stop).not.toHaveBeenCalled();
    }
  });

  it("stops the recorder before stopping the session when recording is active", async () => {
    const user = userEvent.setup();
    vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:http://localhost/stopped-session-clip");
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record" }));

    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["clip"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop session" }));

    expect(FakeMediaRecorder.instances[0].stop).toHaveBeenCalledTimes(1);
    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }

    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    await waitFor(() => expect(screen.getByLabelText("Recording playback")).toBeInTheDocument());
    expect(screen.getByText("Stopped")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record again" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "blob:http://localhost/stopped-session-clip",
    );
  });

  it("recording a later session replaces the previous object URL safely", async () => {
    const user = userEvent.setup();
    vi.mocked(URL.createObjectURL)
      .mockReturnValueOnce("blob:http://localhost/first-clip")
      .mockReturnValueOnce("blob:http://localhost/second-clip");
    const firstStream = createMockMediaStream({ audio: true });
    const secondStream = createMockMediaStream({ audio: true });
    mockGetUserMedia
      .mockResolvedValueOnce(firstStream)
      .mockResolvedValueOnce(secondStream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record" }));
    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["first"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop recording" }));
    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });
    await waitFor(() => expect(screen.getByLabelText("Recording playback")).toBeInTheDocument());
    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/first-clip",
    );

    await user.click(screen.getByRole("button", { name: "Stop session" }));
    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record again" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record again" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/first-clip");
    expect(FakeMediaRecorder.instances[1].stream.getVideoTracks()).toEqual(
      secondStream.getVideoTracks(),
    );
    expect(FakeMediaRecorder.instances[1].stream.getAudioTracks()).toEqual(
      secondStream.getAudioTracks(),
    );

    act(() => {
      FakeMediaRecorder.instances[1].emitData(new Blob(["second"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop recording" }));
    act(() => {
      FakeMediaRecorder.instances[1].emitStop();
    });

    await waitFor(() =>
      expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
        "src",
        "blob:http://localhost/second-clip",
      ),
    );
  });

  it("stops every local camera and microphone track", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled());

    await user.click(screen.getByRole("button", { name: "Stop session" }));

    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
    expect(decartMocks.realtimeClient.disconnect).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });

  it("starts a mocked Lucy session with the current draft", async () => {
    const user = userEvent.setup();
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.createBrowserDecartClient).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() => {
      expect(decartMocks.connectRealtimeModel).toHaveBeenCalled();
    });
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        frameRate: 24,
        width: 640,
        height: 360,
        facingMode: "user",
      },
      audio: true,
    });
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-2.1");
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState: expect.objectContaining({
          modelMode: "lucy-2.1",
          prompt: "Make the scene cinematic",
          image: null,
          enhance: true,
        }),
        modelLabel: "Lucy 2.1",
      }),
    );
    expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("shows recording controls for a mocked model-backed stream", async () => {
    const user = userEvent.setup();
    const localStream = createMockMediaStream({ audio: true });
    const outputStream = createMockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(localStream);
    decartMocks.connectRealtimeModel.mockImplementationOnce(async ({ onConnectionChange, onRemoteStream }) => {
      onRemoteStream(outputStream);
      onConnectionChange("connected");
      return decartMocks.realtimeClient;
    });
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());

    await user.click(screen.getByRole("button", { name: "Record" }));

    expect(FakeMediaRecorder.instances).toHaveLength(1);
    expect(FakeMediaRecorder.instances[0].stream.getVideoTracks()).toEqual(
      outputStream.getVideoTracks(),
    );
    expect(FakeMediaRecorder.instances[0].stream.getAudioTracks()).toEqual(
      localStream.getAudioTracks(),
    );
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-2.1");
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeEnabled();
  });

  it("stops a model recording, releases the API session, and keeps local preview plus playback", async () => {
    const user = userEvent.setup();
    vi.mocked(URL.createObjectURL).mockReturnValueOnce("blob:http://localhost/model-clip");
    const localStream = createMockMediaStream({ audio: true });
    const outputStream = createMockMediaStream();
    const localTracks = localStream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(localStream);
    decartMocks.connectRealtimeModel.mockImplementationOnce(async ({ onConnectionChange, onRemoteStream }) => {
      onRemoteStream(outputStream);
      onConnectionChange("connected");
      return decartMocks.realtimeClient;
    });
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await waitFor(() =>
      expect((document.querySelector("video") as HTMLVideoElement | null)?.srcObject).toBe(
        outputStream,
      ),
    );
    await user.click(screen.getByRole("button", { name: "Record" }));
    act(() => {
      FakeMediaRecorder.instances[0].emitData(new Blob(["model clip"], { type: "video/webm" }));
    });
    await user.click(screen.getByRole("button", { name: "Stop recording" }));
    act(() => {
      FakeMediaRecorder.instances[0].emitStop();
    });

    await waitFor(() => expect(screen.getByText("Clip captured")).toBeInTheDocument());
    await waitFor(() =>
      expect(
        screen.getByText("Recording ready. Model session ended to save usage. Local camera remains on."),
      ).toBeInTheDocument(),
    );
    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);
    expect((document.querySelector("video") as HTMLVideoElement | null)?.srcObject).toBe(
      localStream,
    );
    expect(screen.queryByLabelText(/Transformation prompt/i)).not.toBeInTheDocument();
    expect(
      screen.getByText("Local camera is on. Recording is available when the stream is ready."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Recording playback")).toHaveAttribute(
      "src",
      "blob:http://localhost/model-clip",
    );
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "blob:http://localhost/model-clip",
    );
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:http://localhost/model-clip");
    for (const track of localTracks) {
      expect(track.stop).not.toHaveBeenCalled();
    }

    await user.click(screen.getByRole("button", { name: "Discard" }));

    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:http://localhost/model-clip");
    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Discard clip" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/model-clip");
    expect(screen.queryByLabelText("Recording playback")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Record" })).toBeEnabled();
    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Stop session" }));

    for (const track of localTracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Start local camera" })).toBeEnabled();
  });

  it("keeps model recording disabled until model output is available", async () => {
    const user = userEvent.setup();
    decartMocks.connectRealtimeModel.mockImplementationOnce(async ({ onConnectionChange }) => {
      onConnectionChange("connected");
      return decartMocks.realtimeClient;
    });
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() =>
      expect(screen.getByText("Waiting for model output before recording.")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Record" })).toBeDisabled();
    expect(FakeMediaRecorder.instances).toHaveLength(0);
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-2.1");
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalled();
  });

  it("renders recorder errors from the recording hook", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream({ audio: true });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Start local camera" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Record" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Record" }));

    act(() => {
      FakeMediaRecorder.instances[0].emitError(new Error("encoder failed"));
    });

    await waitFor(() =>
      expect(
        screen.getByText("Recording failed. Try starting a new recording. (encoder failed)"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Stop session" })).toBeEnabled();
  });

  it("switches to VTON and starts with the VTON draft defaults", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /VTON/i }));
    expect(screen.getByLabelText(/Garment prompt/i)).toHaveValue("");
    await user.type(screen.getByLabelText(/Garment prompt/i), "Substitute the top with denim");
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.createBrowserDecartClient).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Start VTON session" }));

    await waitFor(() => {
      expect(decartMocks.connectRealtimeModel).toHaveBeenCalled();
    });
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-vton-3");
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState: expect.objectContaining({
          modelMode: "lucy-vton-3",
          prompt: "Substitute the top with denim",
          image: null,
          enhance: true,
        }),
        modelLabel: "Lucy VTON 3",
      }),
    );
  });

  it("validates empty drafts before opening the camera", async () => {
    const user = userEvent.setup();
    render(<App />);

    await selectLucyMode(user);
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    expect(
      screen.getByText("Enter a transformation prompt or choose a reference portrait before starting."),
    ).toBeInTheDocument();
    expect(mockGetUserMedia).not.toHaveBeenCalled();
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
  });

  it("applies prompt-only changes with a full payload that clears image state", async () => {
    const user = userEvent.setup();
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.clear(screen.getByLabelText(/Transformation prompt/i));
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene neon");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "Make the scene neon",
        image: null,
        enhance: true,
      });
    });
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("applies prompt and selected image together through the active realtime client", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), file);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        initialState: expect.objectContaining({
          prompt: "Make the scene cinematic",
          image: file,
          enhance: true,
        }),
      }),
    );

    await user.clear(screen.getByLabelText(/Transformation prompt/i));
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene neon");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "Make the scene neon",
        image: file,
        enhance: true,
      });
    });
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("applies a changed image with the existing prompt", async () => {
    const user = userEvent.setup();
    const firstFile = new File(["portrait"], "portrait.png", { type: "image/png" });
    const secondFile = new File(["portrait 2"], "portrait-2.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), firstFile);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.upload(screen.getByLabelText("Reference portrait"), secondFile);
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "Make the scene cinematic",
        image: secondFile,
        enhance: true,
      });
    });
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("applies enhance changes with the existing prompt and image", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), file);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.click(screen.getByRole("checkbox", { name: /Enhance prompt/i }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "Make the scene cinematic",
        image: file,
        enhance: false,
      });
    });
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("clears the active image when the UI image is cleared before applying a prompt", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), file);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "Make the scene cinematic",
        image: null,
        enhance: true,
      });
    });
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("can manually disable enhanced prompt for a session", async () => {
    const user = userEvent.setup();
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("checkbox", { name: /Enhance prompt/i }));
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() => {
      expect(decartMocks.connectRealtimeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          initialState: expect.objectContaining({
            enhance: false,
          }),
        }),
      );
    });
  });

  it("clears selected images from the UI without a refresh", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), file);

    expect(screen.getByAltText("Reference portrait preview")).toBeInTheDocument();
    expect(screen.getByText("portrait.png")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.queryByAltText("Reference portrait preview")).not.toBeInTheDocument();
    expect(screen.queryByText("portrait.png")).not.toBeInTheDocument();
    expect(screen.getByText("No portrait")).toBeInTheDocument();
    await waitFor(() =>
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-object-url"),
    );
  });

  it("does not include a cleared image in the next session payload", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    await user.upload(screen.getByLabelText("Reference portrait"), file);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    await waitFor(() => {
      expect(decartMocks.connectRealtimeModel).toHaveBeenCalledWith(
        expect.objectContaining({
          initialState: expect.objectContaining({
            image: null,
            prompt: "Make the scene cinematic",
          }),
        }),
      );
    });
  });

  it("resets UI, applied draft cache, file input, and realtime state without reusing stale image", async () => {
    const user = userEvent.setup();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    render(<App />);

    await selectLucyMode(user);
    const imageInput = screen.getByLabelText("Reference portrait");
    const promptInput = screen.getByLabelText(/Transformation prompt/i);

    await user.upload(imageInput, file);
    await user.type(promptInput, "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({ image: null });
    });
    expect(promptInput).toHaveValue("");
    expect(screen.queryByAltText("Reference portrait preview")).not.toBeInTheDocument();
    expect(screen.queryByText("portrait.png")).not.toBeInTheDocument();
    await waitFor(() => expect(imageInput).toHaveValue(""));

    decartMocks.realtimeClient.set.mockClear();
    await user.type(promptInput, "After reset prompt");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(decartMocks.realtimeClient.set).toHaveBeenCalledWith({
        prompt: "After reset prompt",
        image: null,
        enhance: true,
      });
    });
    expect(decartMocks.realtimeClient.set).not.toHaveBeenCalledWith(
      expect.objectContaining({ image: file }),
    );
    expect(decartMocks.realtimeClient.setPrompt).not.toHaveBeenCalled();
  });

  it("reset cancels an in-flight start before stale draft state can connect", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    const tokenRequest = createDeferred<{
      apiKey: string;
      expiresAt: string;
    }>();
    const file = new File(["portrait"], "portrait.png", { type: "image/png" });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    decartMocks.fetchRealtimeToken.mockReturnValueOnce(tokenRequest.promise);
    render(<App />);

    await selectLucyMode(user);
    const imageInput = screen.getByLabelText("Reference portrait");
    const promptInput = screen.getByLabelText(/Transformation prompt/i);

    await user.upload(imageInput, file);
    await user.type(promptInput, "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-2.1"));

    await user.click(screen.getByRole("button", { name: "Reset" }));
    tokenRequest.resolve({
      apiKey: "ek_test_client_token_after_reset",
      expiresAt: "2030-01-01T00:00:00.000Z",
    });
    await flushPromises();

    expect(promptInput).toHaveValue("");
    expect(imageInput).toHaveValue("");
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(decartMocks.createBrowserDecartClient).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
    expect(screen.getAllByText("Idle").length).toBeGreaterThan(0);
  });

  it("stops a running session and clears the UI state", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Stop session" }));

    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalled();
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
    expect(screen.getByText("Stopped")).toBeInTheDocument();
  });

  it("disconnects and stops the camera stream when unmounted mid-session", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { unmount } = render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Stop session" })).toBeInTheDocument());

    unmount();

    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it("shows webcam permission errors", async () => {
    const user = userEvent.setup();
    const permissionError = Object.assign(new Error("Denied"), { name: "NotAllowedError" });
    mockGetUserMedia.mockRejectedValueOnce(permissionError);
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    expect(
      await screen.findByText("Camera permission was denied. Allow camera access and try again."),
    ).toBeInTheDocument();
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
  });

  it("shows token creation errors and stops the camera stream", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    decartMocks.fetchRealtimeToken.mockRejectedValueOnce(
      new Error("Could not create realtime session token. Check DECART_API_KEY on the local server."),
    );
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    expect(
      await screen.findByText(
        "Could not create realtime session token. Check DECART_API_KEY on the local server.",
      ),
    ).toBeInTheDocument();
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
  });

  it("shows connection errors and stops the camera stream", async () => {
    const user = userEvent.setup();
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    decartMocks.connectRealtimeModel.mockRejectedValueOnce(
      new Error("Could not connect to Lucy 2.1. Check API access, model availability, and network."),
    );
    render(<App />);

    await selectLucyMode(user);
    await user.type(screen.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await user.click(screen.getByRole("button", { name: "Start Lucy session" }));

    expect(
      await screen.findByText(
        "Could not connect to Lucy 2.1. Check API access, model availability, and network.",
      ),
    ).toBeInTheDocument();
    expect(track.stop).toHaveBeenCalledTimes(1);
  });
});

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

function flushPromises() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function selectLucyMode(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /Lucy 2.1/i }));
}
