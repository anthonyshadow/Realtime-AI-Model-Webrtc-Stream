import type { SupportedModelMode } from "../constants/models";

export type RealtimeStatus =
  | "idle"
  | "requesting-camera"
  | "requesting-token"
  | "connecting"
  | "connected"
  | "generating"
  | "reconnecting"
  | "disconnected"
  | "error";

export type ApplyRealtimeStateInput = {
  modelMode: SupportedModelMode;
  prompt: string;
  image: File | null;
  enhance: boolean;
};

export type UseDecartRealtimeSessionReturn = {
  status: RealtimeStatus;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  activeModelMode: SupportedModelMode | null;
  isRunning: boolean;
  isConnecting: boolean;
  isApplying: boolean;
  start: (initialState: ApplyRealtimeStateInput) => Promise<boolean>;
  stop: () => void;
  apply: (input: ApplyRealtimeStateInput) => Promise<boolean>;
};
