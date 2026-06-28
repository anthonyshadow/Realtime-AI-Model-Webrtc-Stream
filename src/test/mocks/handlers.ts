import { http, HttpResponse } from "msw";
import { MODEL_MODE_IDS, isSupportedModelMode } from "../../constants/models";

export const realtimeTokenResponse = {
  apiKey: "ek_test_client_token",
  expiresAt: "2030-01-01T00:00:00.000Z",
  permissions: {
    models: MODEL_MODE_IDS.slice(),
    origins: ["http://localhost:3000"],
  },
  constraints: {
    realtime: {
      maxSessionDuration: 300,
    },
  },
};

export const handlers = [
  http.post("*/api/realtime-token", async ({ request }) => {
    const body = await readBody(request);
    const model = body?.model ?? "lucy-2.1";

    if (!isSupportedModelMode(model)) {
      return HttpResponse.json({ error: "Unsupported realtime model." }, { status: 400 });
    }

    return HttpResponse.json({
      ...realtimeTokenResponse,
      permissions: {
        ...realtimeTokenResponse.permissions,
        models: [model],
      },
    });
  }),
];

async function readBody(request: Request) {
  try {
    return (await request.json()) as { model?: unknown } | null;
  } catch {
    return null;
  }
}
