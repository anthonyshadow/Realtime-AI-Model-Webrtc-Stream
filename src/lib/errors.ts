export function toUserMessage(error: unknown) {
  const name = getErrorField(error, "name");

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was denied. Allow camera access and try again.";
  }

  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }

  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera could not be started. Close other apps using the camera and try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  const message = getErrorField(error, "message");

  if (message) {
    return message;
  }

  return "Something went wrong. Please try again.";
}

function getErrorField(error: unknown, key: "name" | "message") {
  if (!error || typeof error !== "object" || !(key in error)) {
    return "";
  }

  const value = error[key as keyof typeof error];
  return typeof value === "string" ? value : "";
}
