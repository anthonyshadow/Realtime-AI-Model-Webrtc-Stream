import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, userEvent, within } from "storybook/test";
import { App } from "./App";

const meta = {
  title: "App/App Shell",
  component: App,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const StartsMockedLucySession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByRole("button", { name: "Stop" });
    await canvas.findByText("Live");

    await userEvent.click(canvas.getByRole("button", { name: "Stop" }));

    await expect(canvas.getByRole("button", { name: "Start" })).toBeEnabled();
    await canvas.findByText("Stopped");
  },
};

export const ApiFailure: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("*/api/realtime-token", () =>
          HttpResponse.json(
            {
              error: "Could not create realtime session token. Check DECART_API_KEY on the local server.",
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByText(
      "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    );
  },
};

export const PermissionDenied: Story = {
  parameters: {
    browserMocks: {
      camera: "denied",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByText("Camera permission was denied. Allow camera access and try again.");
  },
};
