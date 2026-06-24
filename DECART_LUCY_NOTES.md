# Decart Lucy 2.1 Notes

## SDK

Use:

```ts
import { createDecartClient, models } from "@decartai/sdk";
```

Realtime model:

```ts
const model = models.realtime("lucy-2.1");
```

## Backend Token Endpoint

The browser calls:

```text
POST /api/realtime-token
```

The local Express server creates a short-lived Decart client token using server-side `DECART_API_KEY`.

Recommended MVP token options:

```ts
{
  expiresIn: 300,
  allowedModels: ["lucy-2.1"],
  allowedOrigins: ["http://localhost:3000", "https://localhost:3000"],
  constraints: {
    realtime: {
      maxSessionDuration: 300,
    },
  },
}
```

This means:

- Token can be used for 5 minutes to start a connection.
- Realtime session is capped at 5 minutes.
- Only `lucy-2.1` is allowed.
- Only `http://localhost:3000` and `https://localhost:3000` are allowed as origins.

## Browser Realtime Flow

The frontend should:

1. Request a token from `POST /api/realtime-token`.
2. Request webcam permission with `navigator.mediaDevices.getUserMedia`.
3. Use Lucy model specs for camera constraints.
4. Connect to Decart realtime.
5. Attach the remote transformed stream to the main video element.
6. Listen for connection state, errors, and generation ticks where supported.
7. Stop and disconnect cleanly.

Connection shape:

```ts
const model = models.realtime("lucy-2.1");

const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    frameRate: model.fps,
    width: model.width,
    height: model.height,
    facingMode: "user",
  },
  audio: false,
});

const client = createDecartClient({ apiKey: token.apiKey });

const realtimeClient = await client.realtime.connect(stream, {
  model,
  mirror: "auto",
  onRemoteStream: (remoteStream) => {
    outputVideo.srcObject = remoteStream;
  },
  initialState: {
    prompt: {
      text: initialPrompt,
      enhance: true,
    },
  },
});
```

Adjust exact SDK calls during implementation if the installed SDK version differs. Keep the same security model and architecture.

## Important `set()` Behavior

`realtimeClient.set()` replaces the full Lucy state.

When applying prompt and image together, send both in the same call:

```ts
await realtimeClient.set({
  prompt: promptText,
  image: referenceImageFile,
  enhance: true,
});
```

Do not split intended combined state across multiple calls:

```ts
await realtimeClient.set({ prompt: promptText });
await realtimeClient.set({ image: referenceImageFile });
```

The second call can clear the first field.

## Atomic State Helper

Create one helper during implementation:

```ts
applyRealtimeState({
  prompt,
  image,
  enhance: true,
});
```

The helper should decide:

- If prompt and image exist, send both.
- If only prompt exists, send prompt only.
- If only image exists, send image with the default character prompt.
- If neither exists, do nothing and surface a friendly message.

Use `enhance: true` by default.

## Reference Image Rules

Supported upload formats:

- `image/jpeg`
- `image/png`
- `image/webp`

The UI should guide the user toward high-quality inputs:

```text
Best: clear front-facing portrait, well-lit, head-and-shoulders, JPEG/PNG/WebP.
```

Do not store uploaded reference images permanently for this MVP.

## Prompt Guidance

Default reference-image prompt:

```text
Substitute the character in the video with the person in the reference image.
```

Default text-only prompt:

```text
Change the person into a cinematic cyberpunk character with realistic lighting.
```

Encourage one clear edit intent per prompt. The app should not block complex prompts, but helper text should guide users toward focused transformations.

## Error Cases

Camera permission denied:

```text
Camera permission was denied. Allow camera access and try again.
```

No camera device:

```text
No camera was found on this device.
```

Token creation failed:

```text
Could not create realtime session token. Check DECART_API_KEY on the local server.
```

Decart connection failed:

```text
Could not connect to Lucy 2.1 realtime. Check API access, model availability, and network.
```

Unsupported image type:

```text
Please upload a JPEG, PNG, or WebP image.
```

Apply before connected:

- Disable `Apply` unless status is `connected` or `generating`.

Stop during connecting:

- Abort if possible.
- Disconnect any partial realtime client.
- Stop local media tracks.
- Reset UI safely.

## Cost Notes

Realtime Lucy 2.1 is billed per active generation second. The MVP should make `Stop` obvious, show a visible timer, disconnect on page unload, and use `maxSessionDuration`.
