import { describe, expect, it } from "vitest";
import { readEnv } from "./env.js";

describe("readEnv", () => {
  it("reads valid server environment configuration", () => {
    expect(
      readEnv({
        DECART_API_KEY: " dct_test_key ",
        NODE_ENV: "test",
        PORT: "4100",
      }),
    ).toEqual({
      DECART_API_KEY: "dct_test_key",
      NODE_ENV: "test",
      PORT: 4100,
    });
  });

  it("defaults the port and node environment", () => {
    expect(readEnv({ DECART_API_KEY: "dct_test_key" })).toMatchObject({
      NODE_ENV: "development",
      PORT: 3000,
    });
  });

  it("rejects missing Decart API keys", () => {
    expect(() => readEnv({ DECART_API_KEY: " " })).toThrow(
      "DECART_API_KEY is required. Add it to .env before starting the server.",
    );
  });

  it("rejects invalid ports", () => {
    expect(() => readEnv({ DECART_API_KEY: "dct_test_key", PORT: "0" })).toThrow(
      "PORT must be a positive integer.",
    );
  });
});
