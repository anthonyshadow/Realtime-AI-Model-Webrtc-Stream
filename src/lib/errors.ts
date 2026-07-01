export type StudioErrorKind =
  | "api-token"
  | "camera-permission"
  | "camera-unavailable"
  | "media-unavailable"
  | "microphone-unavailable"
  | "model-connection"
  | "network"
  | "recording"
  | "upload"
  | "unknown";

export type StudioErrorContext = "recording" | "session" | "upload";

export type StudioErrorDescriptor = {
  kind: StudioErrorKind;
  message: string;
  title: string;
};

const ERROR_COPY: Record<StudioErrorKind, StudioErrorDescriptor> = {
  "api-token": {
    kind: "api-token",
    title: "Model session blocked",
    message: "Could not create a model session. Check your Decart API key on the local server.",
  },
  "camera-permission": {
    kind: "camera-permission",
    title: "Camera blocked",
    message: "Camera access was blocked. Allow camera access in your browser settings, then try again.",
  },
  "camera-unavailable": {
    kind: "camera-unavailable",
    title: "Camera unavailable",
    message: "No camera was found. Connect a camera or choose an available camera, then try again.",
  },
  "media-unavailable": {
    kind: "media-unavailable",
    title: "Camera or microphone unavailable",
    message: "Camera or microphone could not be started. Check browser permissions and close other apps using them.",
  },
  "microphone-unavailable": {
    kind: "microphone-unavailable",
    title: "Microphone unavailable",
    message: "No microphone was found. Connect a microphone or allow microphone access, then try again.",
  },
  "model-connection": {
    kind: "model-connection",
    title: "Model connection failed",
    message: "Could not connect to the selected model. Check API access, model availability, and network connection.",
  },
  network: {
    kind: "network",
    title: "Connection interrupted",
    message: "Network connection was interrupted. Check your connection, then try again.",
  },
  recording: {
    kind: "recording",
    title: "Recording failed",
    message: "Recording failed. Try again or restart the session.",
  },
  upload: {
    kind: "upload",
    title: "File not supported",
    message: "This file could not be used. Choose a supported image file.",
  },
  unknown: {
    kind: "unknown",
    title: "Something went wrong",
    message: "Something went wrong. Try again.",
  },
};

export function getStudioErrorDescriptor(
  error: string | null | undefined,
  context: StudioErrorContext = "session",
): StudioErrorDescriptor | null {
  if (!error) {
    return null;
  }

  return ERROR_COPY[getStudioErrorKind(error, context)];
}

export function getStudioErrorKind(
  error: string,
  context: StudioErrorContext = "session",
): StudioErrorKind {
  const normalized = error.toLowerCase();

  if (context === "upload" || hasAny(normalized, ["upload", "file type", "supported image"])) {
    return "upload";
  }

  if (context === "recording" || hasAny(normalized, ["mediarecorder", "recording", "record"])) {
    return "recording";
  }

  if (hasAny(normalized, ["notallowederror", "permissiondeniederror", "permission", "denied", "blocked"])) {
    return "camera-permission";
  }

  if (hasAny(normalized, ["microphone", "audio device", "audioinput"])) {
    return "microphone-unavailable";
  }

  if (hasAny(normalized, ["no camera", "camera did not", "video track", "video dimensions"])) {
    return "camera-unavailable";
  }

  if (hasAny(normalized, ["notfounderror", "devicesnotfounderror", "notreadableerror", "trackstarterror", "getusermedia"])) {
    return "media-unavailable";
  }

  if (hasAny(normalized, ["realtime session token", "decart_api_key", "api key", "token response", "unsupported realtime model"])) {
    return "api-token";
  }

  if (
    hasAny(normalized, [
      "could not connect",
      "decart connection",
      "model availability",
      "selected model",
      "lucy 2.1",
      "vton",
    ])
  ) {
    return "model-connection";
  }

  if (hasAny(normalized, ["network", "interrupted", "failed to fetch", "could not reach"])) {
    return "network";
  }

  return "unknown";
}

export function toUserMessage(error: unknown) {
  const name = getErrorField(error, "name");
  const message = getErrorField(error, "message");

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return ERROR_COPY["camera-permission"].message;
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return message.toLowerCase().includes("microphone")
      ? ERROR_COPY["microphone-unavailable"].message
      : ERROR_COPY["camera-unavailable"].message;
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return ERROR_COPY["media-unavailable"].message;
  }

  if (error instanceof Error) {
    return getStudioErrorDescriptor(error.message)?.message ?? ERROR_COPY.unknown.message;
  }

  if (message) {
    return getStudioErrorDescriptor(message)?.message ?? ERROR_COPY.unknown.message;
  }

  return ERROR_COPY.unknown.message;
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function getErrorField(error: unknown, key: "name" | "message") {
  if (!error || typeof error !== "object" || !(key in error)) {
    return "";
  }

  const value = error[key as keyof typeof error];
  return typeof value === "string" ? value : "";
}
