import dotenv from "dotenv";

dotenv.config({ quiet: true });

type NodeEnv = "development" | "production" | "test";

function readPort() {
  const port = Number(process.env.PORT ?? 3000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return port;
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required. Add it to .env before starting the server.`);
  }

  return value;
}

export const env = {
  PORT: readPort(),
  NODE_ENV: (process.env.NODE_ENV ?? "development") as NodeEnv,
  DECART_API_KEY: readRequiredEnv("DECART_API_KEY"),
};
