export type RealtimeTokenResponse = {
  apiKey: string;
  expiresAt: string;
  permissions?: {
    models?: string[];
    origins?: string[];
  } | null;
  constraints?: {
    realtime?: {
      maxSessionDuration?: number;
    };
  } | null;
};

export type LucyModelSpec = {
  fps: NonNullable<MediaTrackConstraints["frameRate"]>;
  width: number;
  height: number;
};
