import dotenv from "dotenv";

dotenv.config({ quiet: true });

type NodeEnv = "development" | "production" | "test";

export type ServerEnv = {
  PORT: number;
  NODE_ENV: NodeEnv;
  DECART_API_KEY: string;
};

export function readEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return {
    PORT: readPort(source.PORT),
    NODE_ENV: (source.NODE_ENV ?? "development") as NodeEnv,
    DECART_API_KEY: readRequiredEnv(source, "DECART_API_KEY"),
  };
}

function readPort(value: string | undefined) {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return port;
}

function readRequiredEnv(source: NodeJS.ProcessEnv, name: string) {
  const value = source[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required. Add it to .env before starting the server.`);
  }

  return value;
}

export const env = readEnv();
