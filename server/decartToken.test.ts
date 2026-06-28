import { afterEach, describe, expect, it, vi } from "vitest";

describe("readSupportedRealtimeModel", () => {
  afterEach(() => {
    vi.doUnmock("@decartai/sdk");
    vi.doUnmock("./env.js");
    vi.resetModules();
  });

  it("defaults missing models to Lucy 2.1", async () => {
    const { module } = await importDecartTokenWithMocks();

    expect(module.readSupportedRealtimeModel(undefined)).toBe("lucy-2.1");
    expect(module.readSupportedRealtimeModel(null)).toBe("lucy-2.1");
  });

  it("accepts supported realtime models", async () => {
    const { module } = await importDecartTokenWithMocks();

    expect(module.readSupportedRealtimeModel("lucy-2.1")).toBe("lucy-2.1");
    expect(module.readSupportedRealtimeModel("lucy-vton-3")).toBe("lucy-vton-3");
  });

  it("rejects unsupported realtime models", async () => {
    const { module } = await importDecartTokenWithMocks();

    expect(() => module.readSupportedRealtimeModel("lucy-vton-latest")).toThrow(
      "Unsupported realtime model.",
    );
  });
});

describe("createRealtimeToken", () => {
  afterEach(() => {
    vi.doUnmock("@decartai/sdk");
    vi.doUnmock("./env.js");
    vi.resetModules();
  });

  it("creates a short-lived token scoped to the selected model and localhost origins", async () => {
    const { createToken, module } = await importDecartTokenWithMocks();

    await expect(module.createRealtimeToken("lucy-vton-3")).resolves.toEqual({
      apiKey: "ek_test_server_token",
      expiresAt: "2030-01-01T00:00:00.000Z",
      permissions: {
        models: ["lucy-vton-3"],
        origins: ["http://localhost:4321", "https://localhost:4321"],
      },
      constraints: {
        realtime: {
          maxSessionDuration: 300,
        },
      },
    });

    expect(createToken).toHaveBeenCalledWith({
      expiresIn: 300,
      allowedModels: ["lucy-vton-3"],
      allowedOrigins: ["http://localhost:4321", "https://localhost:4321"],
      constraints: {
        realtime: {
          maxSessionDuration: 300,
        },
      },
    });
  });
});

async function importDecartTokenWithMocks() {
  vi.resetModules();

  const createToken = vi.fn(async (options) => ({
    apiKey: "ek_test_server_token",
    expiresAt: "2030-01-01T00:00:00.000Z",
    permissions: {
      models: options.allowedModels,
      origins: options.allowedOrigins,
    },
    constraints: options.constraints,
  }));
  const createDecartClient = vi.fn(() => ({
    tokens: {
      create: createToken,
    },
  }));

  vi.doMock("@decartai/sdk", () => ({
    createDecartClient,
    noopLogger: {},
  }));
  vi.doMock("./env.js", () => ({
    env: {
      DECART_API_KEY: "dct_test_key",
      NODE_ENV: "test",
      PORT: 4321,
    },
  }));

  const module = await import("./decartToken.js");

  return { createDecartClient, createToken, module };
}
