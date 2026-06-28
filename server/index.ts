import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import {
  createRealtimeToken,
  readSupportedRealtimeModel,
  UnsupportedRealtimeModelError,
} from "./decartToken.js";
import { listenWithHttpAndHttps } from "./dualProtocolServer.js";
import { env } from "./env.js";
import { getLocalhostCertificate } from "./localhostCertificate.js";

const app = express();
const isProduction = env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const httpServer = http.createServer(app);
const httpsServer = https.createServer(getLocalhostCertificate(projectRoot), app);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/realtime-token", async (req, res) => {
  try {
    const model = readSupportedRealtimeModel(req.body?.model);
    const token = await createRealtimeToken(model);
    res.json(token);
  } catch (error) {
    if (error instanceof UnsupportedRealtimeModelError) {
      res.status(400).json({
        error: "Unsupported realtime model.",
      });
      return;
    }

    res.status(500).json({
      error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    });
  }
});

if (isProduction) {
  const distPath = path.resolve(__dirname, "../dist");

  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const vite = await createViteServer({
    appType: "spa",
    server: {
      middlewareMode: true,
      ws: {
        protocol: "wss",
        host: "localhost",
        server: httpsServer,
      },
    },
  });

  app.use(vite.middlewares);
}

const mode = isProduction ? "production" : "development";
const distNote =
  isProduction && !fs.existsSync(path.resolve(projectRoot, "dist"))
    ? " Build output was not found; run npm run build first."
    : "";

listenWithHttpAndHttps({
  httpServer,
  httpsServer,
  port: env.PORT,
  onListen: () => {
    console.log(`Decart Realtime Webcam Studio running in ${mode}:`);
    console.log(`  http://localhost:${env.PORT}`);
    console.log(`  https://localhost:${env.PORT}${distNote}`);
  },
});
