import type { StudioErrorDescriptor } from "../../lib/errors";
import type { ErrorBannerAction } from "../StudioUI";

type ErrorActionInput = {
  descriptor: StudioErrorDescriptor;
  imageFile: File | null;
  includeTryAgain?: boolean;
  isModelMode: boolean;
  onBackToLocalCamera: () => void;
  onImageChange: (file: File | null) => void;
  onReset: () => void;
  onStart: () => void;
};

export function getErrorActions({
  descriptor,
  imageFile,
  includeTryAgain = true,
  isModelMode,
  onBackToLocalCamera,
  onImageChange,
  onReset,
  onStart,
}: ErrorActionInput): ErrorBannerAction[] {
  if (descriptor.kind === "upload") {
    return [
      ...(imageFile
        ? [
            {
              label: "Remove file",
              onClick: () => onImageChange(null),
              variant: "primary" as const,
            },
          ]
        : []),
      {
        label: "Reset session",
        onClick: onReset,
      },
    ];
  }

  const actions: ErrorBannerAction[] = includeTryAgain
    ? [
        {
          label: "Try again",
          onClick: onStart,
          variant: "primary",
        },
      ]
    : [];

  if (isModelMode && ["api-token", "model-connection", "network"].includes(descriptor.kind)) {
    actions.push({
      label: "Back to local camera",
      onClick: onBackToLocalCamera,
    });
  }

  actions.push({
    label: "Reset session",
    onClick: onReset,
  });

  return actions;
}

export function getErrorTip(descriptor: StudioErrorDescriptor) {
  if (descriptor.kind === "camera-permission") {
    return "Use the browser site settings or camera icon to allow camera and microphone access.";
  }

  if (descriptor.kind === "media-unavailable") {
    return "Close other apps using the camera or microphone before retrying.";
  }

  return null;
}
