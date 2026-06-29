import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockMediaStream,
  mockGetUserMedia,
  type MockMediaStreamTrack,
} from "../test/mocks/browserMocks";
import { useLiveSession } from "./useLiveSession";

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
  },
}));

vi.mock("../lib/decartClient", () => ({
  connectRealtimeModel: decartMocks.connectRealtimeModel,
  createBrowserDecartClient: decartMocks.createBrowserDecartClient,
  fetchRealtimeToken: decartMocks.fetchRealtimeToken,
  getRealtimeModel: decartMocks.getRealtimeModel,
}));

describe("useLiveSession", () => {
  beforeEach(() => {
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
    decartMocks.connectRealtimeModel.mockReset();
    decartMocks.connectRealtimeModel.mockImplementation(async ({ stream, onConnectionChange, onRemoteStream }) => {
      onRemoteStream(stream);
      onConnectionChange("connected");
      return decartMocks.realtimeClient;
    });
  });

  it("starts the local branch without fetching a token or connecting Decart", async () => {
    const stream = createMockMediaStream({ audio: true });
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useLiveSession());
    let didStart = false;

    await act(async () => {
      didStart = await result.current.start({ sessionMode: "local" });
    });

    expect(didStart).toBe(true);
    expect(result.current.status).toBe("connected");
    expect(result.current.activeSessionMode).toBe("local");
    expect(result.current.localStream).toBe(stream);
    expect(result.current.displayStream).toBe(stream);
    expect(result.current.recordableStream).toBe(stream);
    expect(result.current.modelOutputStream).toBeNull();
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: "user",
      },
      audio: true,
    });
    expect(decartMocks.getRealtimeModel).not.toHaveBeenCalled();
    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();
    expect(decartMocks.connectRealtimeModel).not.toHaveBeenCalled();
  });

  it("stops all local camera and microphone tracks", async () => {
    const stream = createMockMediaStream({ audio: true });
    const tracks = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useLiveSession());

    await act(async () => {
      await result.current.start({ sessionMode: "local" });
    });

    act(() => {
      result.current.stop();
    });

    for (const track of tracks) {
      expect(track.stop).toHaveBeenCalledTimes(1);
    }
    expect(result.current.status).toBe("disconnected");
    expect(result.current.localStream).toBeNull();
    expect(result.current.displayStream).toBeNull();
    expect(decartMocks.realtimeClient.disconnect).not.toHaveBeenCalled();
  });

  it("starts the model branch through the token and Decart connect path", async () => {
    const stream = createMockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useLiveSession());
    let didStart = false;

    await act(async () => {
      didStart = await result.current.start({
        sessionMode: "lucy-2.1",
        modelMode: "lucy-2.1",
        prompt: "Make the scene cinematic",
        image: null,
        enhance: true,
      });
    });

    expect(didStart).toBe(true);
    expect(result.current.status).toBe("connected");
    expect(result.current.activeSessionMode).toBe("lucy-2.1");
    expect(result.current.localStream).toBe(stream);
    expect(result.current.modelOutputStream).toBe(stream);
    expect(result.current.displayStream).toBe(stream);
    expect(result.current.recordableStream).toBe(stream);
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        frameRate: 24,
        width: 640,
        height: 360,
        facingMode: "user",
      },
      audio: false,
    });
    expect(decartMocks.getRealtimeModel).toHaveBeenCalledWith("lucy-2.1");
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-2.1");
    expect(decartMocks.connectRealtimeModel).toHaveBeenCalled();
  });

  it("fetches tokens only after a model-backed mode is selected", async () => {
    const localStream = createMockMediaStream({ audio: true });
    const modelStream = createMockMediaStream();
    mockGetUserMedia.mockResolvedValueOnce(localStream).mockResolvedValueOnce(modelStream);
    const { result } = renderHook(() => useLiveSession());

    await act(async () => {
      await result.current.start({ sessionMode: "local" });
    });

    expect(decartMocks.fetchRealtimeToken).not.toHaveBeenCalled();

    act(() => {
      result.current.stop();
    });

    await act(async () => {
      await result.current.start({
        sessionMode: "lucy-vton-3",
        modelMode: "lucy-vton-3",
        prompt: "Substitute the current top with denim",
        image: null,
        enhance: true,
      });
    });

    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledTimes(1);
    expect(decartMocks.fetchRealtimeToken).toHaveBeenCalledWith("lucy-vton-3");
  });

  it("disconnects Decart and stops the input stream on model stop", async () => {
    const stream = createMockMediaStream();
    const [track] = stream.getTracks() as MockMediaStreamTrack[];
    mockGetUserMedia.mockResolvedValueOnce(stream);
    const { result } = renderHook(() => useLiveSession());

    await act(async () => {
      await result.current.start({
        sessionMode: "lucy-2.1",
        modelMode: "lucy-2.1",
        prompt: "Make the scene cinematic",
        image: null,
        enhance: true,
      });
    });

    act(() => {
      result.current.stop();
    });

    expect(decartMocks.realtimeClient.disconnect).toHaveBeenCalledTimes(1);
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("disconnected");
    expect(result.current.displayStream).toBeNull();
  });
});
