import type { ConnectionState } from "@decartai/sdk";
import type { SupportedModelMode } from "../constants/models";
import type { RealtimeTokenResponse } from "../types/decart";
import type { ApplyRealtimeStateInput } from "../types/realtime";
import { buildRealtimeStatePayload } from "./realtimeState";

type DecartSdk = typeof import("@decartai/sdk");
type BrowserDecartClient = ReturnType<DecartSdk["createDecartClient"]>;
type RealtimeModel = ReturnType<DecartSdk["models"]["realtime"]>;

declare global {
  // Test-only escape hatch for browser E2E. It is only read when the Vite
  // test flag is enabled, so normal app runs always use the real SDK import.
  var __DECART_TEST_SDK__: DecartSdk | undefined;
}

let decartSdkPromise: Promise<DecartSdk> | null = null;

export async function fetchRealtimeToken(modelMode: SupportedModelMode): Promise<RealtimeTokenResponse> {
  let response: Response;

  try {
    response = await fetch("/api/realtime-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: modelMode }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the local realtime token endpoint.");
  }

  const body = await readJson(response);

  if (!response.ok) {
    const message =
      getErrorMessage(body) ??
      `Could not create realtime session token. Server returned ${response.status}.`;

    throw new Error(message);
  }

  if (!isRealtimeTokenResponse(body)) {
    throw new Error("Realtime token response was invalid.");
  }

  return body;
}

export async function getRealtimeModel(modelMode: SupportedModelMode) {
  const { models } = await getDecartSdk();
  return models.realtime(modelMode);
}

export async function createBrowserDecartClient(token: RealtimeTokenResponse) {
  const { createDecartClient, noopLogger } = await getDecartSdk();

  return createDecartClient({
    apiKey: token.apiKey,
    logger: noopLogger,
    telemetry: false,
  });
}

type ConnectRealtimeInput = {
  client: BrowserDecartClient;
  stream: MediaStream;
  model: RealtimeModel;
  initialState: ApplyRealtimeStateInput;
  modelLabel: string;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionChange: (state: ConnectionState) => void;
};

export async function connectRealtimeModel({
  client,
  stream,
  model,
  initialState,
  modelLabel,
  onRemoteStream,
  onConnectionChange,
}: ConnectRealtimeInput) {
  try {
    return await client.realtime.connect(stream, {
      model,
      // Decart's auto-mirror path creates a generated video track. In Chrome,
      // that track can lose width/height settings during LiveKit reconnect
      // republishes, which can stall the realtime stream.
      mirror: false,
      onRemoteStream,
      onConnectionChange,
      initialState: buildInitialState(initialState),
    });
  } catch {
    throw new Error(`Could not connect to ${modelLabel}. Check API access, model availability, and network.`);
  }
}

function buildInitialState(input: ApplyRealtimeStateInput) {
  const payload = buildRealtimeStatePayload(input);

  if (!payload) {
    return undefined;
  }

  const initialState: {
    prompt?: {
      text: string;
      enhance: boolean;
    };
    image?: File;
  } = {};

  if (payload.prompt) {
    initialState.prompt = {
      text: payload.prompt,
      enhance: payload.enhance,
    };
  }

  if (payload.image) {
    initialState.image = payload.image;
  }

  return initialState;
}

function getDecartSdk() {
  if (import.meta.env.VITE_USE_MOCK_DECART === "true" && globalThis.__DECART_TEST_SDK__) {
    return Promise.resolve(globalThis.__DECART_TEST_SDK__);
  }

  decartSdkPromise ??= import("@decartai/sdk");
  return decartSdkPromise;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown) {
  if (!body || typeof body !== "object" || !("error" in body)) {
    return null;
  }

  const error = body.error;
  return typeof error === "string" ? error : null;
}

function isRealtimeTokenResponse(body: unknown): body is RealtimeTokenResponse {
  if (!body || typeof body !== "object") {
    return false;
  }

  return (
    "apiKey" in body &&
    "expiresAt" in body &&
    typeof body.apiKey === "string" &&
    body.apiKey.length > 0 &&
    typeof body.expiresAt === "string" &&
    body.expiresAt.length > 0
  );
}
