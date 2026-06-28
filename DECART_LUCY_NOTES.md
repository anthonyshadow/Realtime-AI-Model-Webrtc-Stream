# Decart Realtime Notes

This file covers the Decart realtime integration used by the local webcam app.

## SDK

Use:

```ts
import { createDecartClient, models } from "@decartai/sdk";
```

Installed SDK:

```text
@decartai/sdk 0.1.9
```

Supported realtime models:

```ts
models.realtime("lucy-2.1");
models.realtime("lucy-vton-3");
```

## Backend Token Endpoint

The browser calls:

```text
POST /api/realtime-token
Content-Type: application/json

{ "model": "lucy-vton-3" }
```

The local Express server creates a short-lived Decart client token using server-side `DECART_API_KEY`.

Token options:

```ts
{
  expiresIn: 300,
  allowedModels: [requestedModel],
  allowedOrigins: [
    `http://localhost:${PORT}`,
    `https://localhost:${PORT}`,
  ],
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
- Token is scoped to exactly one requested model.
- Token is scoped to the local app origin.

## Browser Realtime Flow

The frontend should:

1. Select a model mode.
2. Resolve `models.realtime(modelMode)`.
3. Request webcam permission with that model's `fps`, `width`, and `height`.
4. Request a token from `POST /api/realtime-token`.
5. Create a browser Decart client with the temporary `ek_` token.
6. Connect to Decart realtime.
7. Attach the remote transformed stream to the main video element.
8. Listen for connection state, errors, and generation ticks.
9. Stop and disconnect cleanly.

Connection shape:

```ts
const model = models.realtime(modelMode);

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
  mirror: false,
  onRemoteStream: (remoteStream) => {
    outputVideo.srcObject = remoteStream;
  },
  initialState: {
    prompt: {
      text: initialPrompt,
      enhance,
    },
    image: referenceOrGarmentFile,
  },
});
```

The app uses `mirror: false` because Decart's auto-mirror path previously caused generated track dimension issues during LiveKit reconnect republishes.

## Important `set()` Behavior

`realtimeClient.set()` replaces the full realtime state.

When applying prompt and image together, send both in the same call:

```ts
await realtimeClient.set({
  prompt: promptText,
  image: imageFile,
  enhance,
});
```

Do not split intended combined state across multiple calls:

```ts
await realtimeClient.set({ prompt: promptText });
await realtimeClient.set({ image: imageFile });
```

The second call can clear the first field.

## Lucy 2.1 State Rules

Lucy 2.1 supports:

- Prompt only.
- Reference portrait only.
- Prompt + reference portrait.

For image-only Lucy 2.1 updates, include the default character substitution prompt:

```text
Substitute the character in the video with the person in the reference image.
```

## Lucy VTON 3 State Rules

Lucy VTON 3 supports:

- Garment prompt only.
- Garment image only.
- Garment prompt + garment image.

Best results come from pairing a clean garment image with a descriptive prompt. Image-only VTON updates should not invent a prompt; Decart can use the garment image by itself.

Prompt pattern:

```text
Substitute the current top with a navy blue hoodie with a white logo on the chest
```

## Reference and Garment Image Rules

Supported upload formats:

- `image/jpeg`
- `image/png`
- `image/webp`

Recommended:

- At least 512x512 pixels.
- Under 5MB for faster updates.
- Lucy 2.1 portraits: clear, front-facing, well-lit, one face.
- VTON garments: clean clothing item, plain background, no person if possible.

Do not store uploaded images permanently for this local app.

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

Unsupported model:

```text
Unsupported realtime model.
```

Decart connection failed:

```text
Could not connect to {model label}. Check API access, model availability, and network.
```

Unsupported image type:

```text
Please upload a JPEG, PNG, or WebP image.
```

Apply before connected:

- Disable Apply unless status is `connected` or `generating`.

Stop during connecting:

- Increment the active request id.
- Disconnect any partial realtime client.
- Stop local media tracks.
- Reset UI safely.

## Cost Notes

Realtime models are billed per active generation second. The app should make Stop obvious, show a visible timer, disconnect on page unload, and use `maxSessionDuration`.

## Official Documentation

- JavaScript SDK overview: https://docs.platform.decart.ai/sdks/javascript
- JavaScript realtime API: https://docs.platform.decart.ai/sdks/javascript-realtime
- Realtime virtual try-on: https://docs.platform.decart.ai/models/realtime/virtual-try-on
- Realtime reference images: https://docs.platform.decart.ai/models/realtime/reference-images
- Client tokens: https://docs.platform.decart.ai/getting-started/client-tokens
