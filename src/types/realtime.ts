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

export type ApplyLucyStateInput = {
  prompt: string;
  image: File | null;
  enhance?: boolean;
};

export type UseLucyRealtimeReturn = {
  status: RealtimeStatus;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isRunning: boolean;
  isConnecting: boolean;
  start: (initialState?: ApplyLucyStateInput) => Promise<void>;
  stop: () => void;
  apply: (input: ApplyLucyStateInput) => Promise<void>;
};
