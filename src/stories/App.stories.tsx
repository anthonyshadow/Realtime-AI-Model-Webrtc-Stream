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

export const DesktopLocalIdle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("heading", { name: "Start camera to begin" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Start local camera" })).toBeVisible();
  },
};

export const DesktopModelSetup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));

    await expect(canvas.getByRole("heading", { name: "Lucy 2.1" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Start Lucy session" })).toBeDisabled();
    await expect(canvas.getByText("Add a prompt or image to start.")).toBeVisible();
  },
};

export const DesktopLocalLive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));

    await expect(await canvas.findByRole("button", { name: "Record" })).toBeVisible();
    await expect(canvas.getByText("Live")).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Live studio controls" })).toHaveClass(
      "sm:top-4",
      "sm:bottom-4",
    );
  },
};

export const DesktopLucyLive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));

    await expect(await canvas.findByRole("button", { name: "Record" })).toBeVisible();
    await expect(canvas.getByText("Live")).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Live studio controls" })).toHaveClass(
      "sm:top-4",
      "sm:bottom-4",
    );
  },
};

export const DesktopVtonLive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /VTON/i }));
    await userEvent.type(canvas.getByLabelText(/Garment prompt/i), "Substitute the top with a cobalt rain jacket.");
    await userEvent.click(canvas.getByRole("button", { name: "Start VTON session" }));

    await expect(await canvas.findByRole("button", { name: "Record" })).toBeVisible();
    await expect(canvas.getByText("Live")).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Live studio controls" })).toHaveClass(
      "sm:top-4",
      "sm:bottom-4",
    );
  },
};

export const DesktopRecordingActive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));
    await canvas.findByRole("button", { name: "Record" });
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));

    await expect(canvas.getByRole("button", { name: "Stop recording" })).toBeVisible();
    await expect(canvas.getByText("REC")).toBeVisible();
  },
};

export const DesktopReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));
    await canvas.findByRole("button", { name: "Record" });
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));
    await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));

    await expect(await canvas.findByRole("region", { name: "Recording review" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Keep" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Record again" })).toBeVisible();
  },
};

export const MobileLocalLive: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));

    await expect(await canvas.findByRole("button", { name: "Record" })).toBeVisible();
    await expect(canvas.getByRole("complementary", { name: "Live studio controls" })).toBeVisible();
  },
};

export const MobileModelLive: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));

    await expect(await canvas.findByRole("button", { name: "Record" })).toBeVisible();
    await expect(canvas.getByText("Synced. Edit prompt or image to queue an update.")).toBeVisible();
  },
};

export const MobileRecordingActive: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));
    await canvas.findByRole("button", { name: "Record" });
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));

    await expect(canvas.getByRole("button", { name: "Stop recording" })).toBeVisible();
    await expect(canvas.getByText("REC")).toBeVisible();
  },
};

export const MobileReview: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Start local camera" }));
    await canvas.findByRole("button", { name: "Record" });
    await userEvent.click(canvas.getByRole("button", { name: "Record" }));
    await userEvent.click(canvas.getByRole("button", { name: "Stop recording" }));

    await expect(await canvas.findByRole("region", { name: "Recording review" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Download" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Keep" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Discard" })).toBeVisible();
  },
};

export const StartsMockedLucySession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));
    await canvas.findByRole("button", { name: "Stop session" });
    await canvas.findByText("Live");

    await userEvent.click(canvas.getByRole("button", { name: "Stop session" }));

    await expect(canvas.getByRole("button", { name: "Start Lucy session" })).toBeEnabled();
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
    await userEvent.click(canvas.getByRole("button", { name: "Start VTON session" }));

    await canvas.findByRole("button", { name: "Stop session" });
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
        enhance: false,
        imageName: "replacement-jacket.png",
        prompt: null,
      });
    });
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));

    await expect(canvas.getByRole("button", { name: "Start Lucy session" })).toBeDisabled();
    await expect(canvas.getByText("Add a prompt or image to start.")).toBeVisible();
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

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));
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

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));
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

    await userEvent.click(canvas.getByRole("button", { name: /Lucy 2.1/i }));
    await userEvent.type(canvas.getByLabelText(/Transformation prompt/i), "Make the scene cinematic");
    await userEvent.click(canvas.getByRole("button", { name: "Start Lucy session" }));
    await canvas.findByText("Camera permission was denied. Allow camera access and try again.");
  },
};
