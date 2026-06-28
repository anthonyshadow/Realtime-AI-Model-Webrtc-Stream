import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { App } from "../App";

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

type StorybookDecartEvents = {
  initialStates: Array<{
    enhance: boolean | null;
    imageName: string | null;
    prompt: string | null;
  }>;
  sets: Array<{
    enhance: boolean | null;
    imageName: string | null;
    prompt: string | null;
  }>;
};

export const Idle: Story = {};

export const StartsMockedLucySession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByRole("button", { name: "Stop" });
    await canvas.findByText("Live");

    await userEvent.click(canvas.getByRole("button", { name: "Stop" }));

    await expect(canvas.getByRole("button", { name: "Start" })).toBeEnabled();
    await canvas.findByText("Stopped");
  },
};

export const StartsVtonImageOnlySession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const storyWindow = canvasElement.ownerDocument.defaultView as
      | (Window & { __STORYBOOK_DECART_EVENTS__?: StorybookDecartEvents })
      | null;
    const firstGarment = new File(["first garment"], "image-only-jacket.png", {
      type: "image/png",
    });
    const secondGarment = new File(["second garment"], "replacement-jacket.png", {
      type: "image/png",
    });

    await userEvent.click(canvas.getByRole("button", { name: /VTON/i }));
    await userEvent.clear(canvas.getByLabelText(/Garment prompt/i));
    await userEvent.upload(canvas.getByLabelText("Garment image"), firstGarment);
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));

    await canvas.findByRole("button", { name: "Stop" });
    await canvas.findByText("Live");
    await waitFor(() => {
      const initialStates = storyWindow?.__STORYBOOK_DECART_EVENTS__?.initialStates ?? [];

      expect(initialStates[initialStates.length - 1]).toEqual({
        enhance: null,
        imageName: "image-only-jacket.png",
        prompt: null,
      });
    });

    await userEvent.upload(canvas.getByLabelText("Garment image"), secondGarment);
    await canvas.findByText("Pending");
    await userEvent.click(canvas.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      const sets = storyWindow?.__STORYBOOK_DECART_EVENTS__?.sets ?? [];

      expect(sets[sets.length - 1]).toEqual({
        enhance: true,
        imageName: "replacement-jacket.png",
        prompt: null,
      });
    });
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start" }));

    await canvas.findByText(
      "Enter a transformation prompt or choose a reference portrait before starting.",
    );
    await expect(canvas.getByRole("button", { name: "Start" })).toBeEnabled();
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

    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByText(
      "Could not create realtime session token. Check DECART_API_KEY on the local server.",
    );
  },
};

export const ConnectionFailure: Story = {
  parameters: {
    browserMocks: {
      connection: "connect-error",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByText(
      "Could not connect to Lucy 2.1. Check API access, model availability, and network.",
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

    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start" }));
    await canvas.findByText("Camera permission was denied. Allow camera access and try again.");
  },
};
