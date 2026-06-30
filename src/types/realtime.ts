import type { SupportedModelMode } from "../constants/models";
import type { LocalSessionModeId, SessionModeId } from "../constants/sessionModes";
import type {
  RecordableAudioSource,
  RecordableStreamSource,
} from "../lib/streamComposition";

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

export type StartRealtimeSessionInput =
  | {
      sessionMode: LocalSessionModeId;
    }
  | (ApplyRealtimeStateInput & {
      sessionMode: SupportedModelMode;
    });

export type UseLiveSessionReturn = {
  status: RealtimeStatus;
  error: string | null;
  localStream: MediaStream | null;
  displayStream: MediaStream | null;
  modelOutputStream: MediaStream | null;
  recordableAudioSource: RecordableAudioSource;
  recordableStream: MediaStream | null;
  recordableStreamSource: RecordableStreamSource;
  activeSessionMode: SessionModeId | null;
  isRunning: boolean;
  isConnecting: boolean;
  isApplying: boolean;
  start: (initialState: StartRealtimeSessionInput) => Promise<boolean>;
  stop: () => void;
  apply: (input: ApplyRealtimeStateInput) => Promise<boolean>;
  resetRealtimeState: () => Promise<boolean>;
};

export type UseDecartRealtimeSessionReturn = UseLiveSessionReturn;
