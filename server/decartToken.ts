import {
  createDecartClient,
  noopLogger,
  type CreateTokenOptions,
  type CreateTokenResponse,
} from "@decartai/sdk";
import { env } from "./env.js";

const DEFAULT_REALTIME_MODEL = "lucy-2.1";
const SUPPORTED_REALTIME_MODELS = ["lucy-2.1", "lucy-vton-3"] as const;
const TOKEN_EXPIRES_IN_SECONDS = 300;
const MAX_SESSION_DURATION_SECONDS = 300;
const ALLOWED_ORIGINS = [`http://localhost:${env.PORT}`, `https://localhost:${env.PORT}`];

export type SupportedRealtimeModel = (typeof SUPPORTED_REALTIME_MODELS)[number];

export class UnsupportedRealtimeModelError extends Error {
  constructor() {
    super("Unsupported realtime model.");
  }
}

const decartClient = createDecartClient({
  apiKey: env.DECART_API_KEY,
  logger: noopLogger,
  telemetry: false,
});

export type RealtimeTokenPayload = Pick<
  CreateTokenResponse,
  "apiKey" | "expiresAt" | "permissions" | "constraints"
>;

export function readSupportedRealtimeModel(value: unknown): SupportedRealtimeModel {
  if (value === undefined || value === null) {
    return DEFAULT_REALTIME_MODEL;
  }

  if (
    typeof value === "string" &&
    SUPPORTED_REALTIME_MODELS.includes(value as SupportedRealtimeModel)
  ) {
    return value as SupportedRealtimeModel;
  }

  throw new UnsupportedRealtimeModelError();
}

export async function createRealtimeToken(
  model: SupportedRealtimeModel = DEFAULT_REALTIME_MODEL,
): Promise<RealtimeTokenPayload> {
  const tokenOptions = {
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    allowedModels: [model],
    allowedOrigins: ALLOWED_ORIGINS,
    constraints: {
      realtime: {
        maxSessionDuration: MAX_SESSION_DURATION_SECONDS,
      },
    },
  } satisfies CreateTokenOptions;

  const token = await decartClient.tokens.create(tokenOptions);

  return {
    apiKey: token.apiKey,
    expiresAt: token.expiresAt,
    permissions: token.permissions ?? null,
    constraints: token.constraints ?? null,
  };
}
