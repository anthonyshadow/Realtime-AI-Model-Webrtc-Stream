import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { installBrowserMocks, resetBrowserMocks } from "./mocks/browserMocks";
import { server } from "./mocks/server";

beforeAll(() => {
  installBrowserMocks();
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetBrowserMocks();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});
