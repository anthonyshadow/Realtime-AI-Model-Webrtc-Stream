import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMockMediaStream } from "../test/mocks/browserMocks";
import { server } from "../test/mocks/server";
import {
  connectRealtimeModel,
  fetchRealtimeToken,
  getRealtimeModel,
} from "./decartClient";

describe("fetchRealtimeToken", () => {
  it("posts the selected model and returns the scoped token response", async () => {
    const token = await fetchRealtimeToken("lucy-vton-3");

    expect(token.apiKey).toBe("ek_test_client_token");
    expect(token.permissions?.models).toEqual(["lucy-vton-3"]);
  });

  it("uses server error messages when token creation fails", async () => {
    server.use(
      http.post("*/api/realtime-token", () =>
        HttpResponse.json({ error: "Unsupported realtime model." }, { status: 400 }),
      ),
    );

    await expect(fetchRealtimeToken("lucy-2.1")).rejects.toThrow("Unsupported realtime model.");
  });

  it("rejects invalid token responses", async () => {
    server.use(
      http.post("*/api/realtime-token", () =>
        HttpResponse.json({ apiKey: "", expiresAt: "" }),
      ),
    );

    await expect(fetchRealtimeToken("lucy-2.1")).rejects.toThrow(
      "Realtime token response was invalid.",
    );
  });
});

describe("Decart SDK helpers", () => {
  afterEach(() => {
    vi.doUnmock("@decartai/sdk");
    vi.resetModules();
  });

  it("resolves the selected realtime model through the SDK", async () => {
    const realtime = vi.fn((modelId: string) => ({ id: modelId, fps: 24, width: 640, height: 360 }));

    vi.doMock("@decartai/sdk", () => ({
      createDecartClient: vi.fn(),
      models: { realtime },
      noopLogger: {},
    }));

    const module = await import("./decartClient");

    await expect(module.getRealtimeModel("lucy-vton-3")).resolves.toEqual({
      id: "lucy-vton-3",
      fps: 24,
      width: 640,
      height: 360,
    });
    expect(realtime).toHaveBeenCalledWith("lucy-vton-3");
  });
});

describe("connectRealtimeModel", () => {
  it("connects with mirror disabled and an SDK-shaped initial state", async () => {
    const image = new File(["portrait"], "portrait.png", { type: "image/png" });
    const realtimeClient = {
      disconnect: vi.fn(),
      getConnectionState: vi.fn(() => "connected"),
      on: vi.fn(),
      set: vi.fn(),
    };
    const connect = vi.fn().mockResolvedValue(realtimeClient);
    const client = { realtime: { connect } };
    const stream = createMockMediaStream();
    const onRemoteStream = vi.fn();
    const onConnectionChange = vi.fn();

    await expect(
      connectRealtimeModel({
        client: client as never,
        stream,
        model: { id: "lucy-2.1" } as never,
        initialState: {
          modelMode: "lucy-2.1",
          prompt: "  Use this portrait ",
          image,
          enhance: true,
        },
        modelLabel: "Lucy 2.1",
        onRemoteStream,
        onConnectionChange,
      }),
    ).resolves.toBe(realtimeClient);

    expect(connect).toHaveBeenCalledWith(stream, {
      model: { id: "lucy-2.1" },
      mirror: false,
      onRemoteStream,
      onConnectionChange,
      initialState: {
        prompt: {
          text: "Use this portrait",
          enhance: true,
        },
        image,
      },
    });
  });

  it("wraps SDK connection failures in a user-facing model message", async () => {
    const client = {
      realtime: {
        connect: vi.fn().mockRejectedValue(new Error("sdk failed")),
      },
    };

    await expect(
      connectRealtimeModel({
        client: client as never,
        stream: createMockMediaStream(),
        model: { id: "lucy-vton-3" } as never,
        initialState: {
          modelMode: "lucy-vton-3",
          prompt: "navy hoodie",
          image: null,
          enhance: false,
        },
        modelLabel: "Lucy VTON 3",
        onRemoteStream: vi.fn(),
        onConnectionChange: vi.fn(),
      }),
    ).rejects.toThrow(
      "Could not connect to Lucy VTON 3. Check API access, model availability, and network.",
    );
  });
});
