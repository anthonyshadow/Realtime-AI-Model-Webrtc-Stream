import type { ConnectionState } from "@decartai/sdk";
import { REALTIME_MODEL_ID } from "../constants/app";
import type { RealtimeTokenResponse } from "../types/decart";
import type { ApplyLucyStateInput } from "../types/realtime";
import { buildLucyStatePayload } from "./realtimeState";

type DecartSdk = typeof import("@decartai/sdk");
type BrowserDecartClient = ReturnType<DecartSdk["createDecartClient"]>;
type LucyModel = ReturnType<DecartSdk["models"]["realtime"]>;

let decartSdkPromise: Promise<DecartSdk> | null = null;

export async function fetchRealtimeToken(): Promise<RealtimeTokenResponse> {
  let response: Response;

  try {
    response = await fetch("/api/realtime-token", {
      method: "POST",
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

export function getLucyModelId() {
  return REALTIME_MODEL_ID;
}

export async function getLucyModel() {
  const { models } = await getDecartSdk();
  return models.realtime(REALTIME_MODEL_ID);
}

export async function createBrowserDecartClient(token: RealtimeTokenResponse) {
  const { createDecartClient, noopLogger } = await getDecartSdk();

  return createDecartClient({
    apiKey: token.apiKey,
    logger: noopLogger,
    telemetry: false,
  });
}

type ConnectLucyRealtimeInput = {
  client: BrowserDecartClient;
  stream: MediaStream;
  model: LucyModel;
  initialState?: ApplyLucyStateInput;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionChange: (state: ConnectionState) => void;
};

export async function connectLucyRealtime({
  client,
  stream,
  model,
  initialState,
  onRemoteStream,
  onConnectionChange,
}: ConnectLucyRealtimeInput) {
  try {
    return await client.realtime.connect(stream, {
      model,
      mirror: "auto",
      onRemoteStream,
      onConnectionChange,
      initialState: buildInitialState(initialState),
    });
  } catch {
    throw new Error(
      "Could not connect to Lucy 2.1 realtime. Check API access, model availability, and network.",
    );
  }
}

function buildInitialState(input?: ApplyLucyStateInput) {
  if (!input) {
    return undefined;
  }

  const payload = buildLucyStatePayload(input);

  if (!payload) {
    return undefined;
  }

  return {
    prompt: {
      text: payload.prompt,
      enhance: payload.enhance,
    },
    image: payload.image,
  };
}

function getDecartSdk() {
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
