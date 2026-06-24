import {
  createDecartClient,
  noopLogger,
  type CreateTokenOptions,
  type CreateTokenResponse,
} from "@decartai/sdk";
import { env } from "./env.js";

const REALTIME_MODEL = "lucy-2.1";
const TOKEN_EXPIRES_IN_SECONDS = 300;
const MAX_SESSION_DURATION_SECONDS = 300;
const ALLOWED_ORIGINS = ["http://localhost:3000", "https://localhost:3000"];

const tokenOptions = {
  expiresIn: TOKEN_EXPIRES_IN_SECONDS,
  allowedModels: [REALTIME_MODEL],
  allowedOrigins: ALLOWED_ORIGINS,
  constraints: {
    realtime: {
      maxSessionDuration: MAX_SESSION_DURATION_SECONDS,
    },
  },
} satisfies CreateTokenOptions;

const decartClient = createDecartClient({
  apiKey: env.DECART_API_KEY,
  logger: noopLogger,
  telemetry: false,
});

export type RealtimeTokenPayload = Pick<
  CreateTokenResponse,
  "apiKey" | "expiresAt" | "permissions" | "constraints"
>;

export async function createRealtimeToken(): Promise<RealtimeTokenPayload> {
  const token = await decartClient.tokens.create(tokenOptions);

  return {
    apiKey: token.apiKey,
    expiresAt: token.expiresAt,
    permissions: token.permissions ?? null,
    constraints: token.constraints ?? null,
  };
}
