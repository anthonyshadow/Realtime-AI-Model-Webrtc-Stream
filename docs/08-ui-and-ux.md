# UI And UX
> Last updated: 2026-06-29

Use this before modifying the video stage, floating control panel, or component states.

## Product Shape

The app opens directly into the working video experience, not a marketing page.

Before start:

- dark full-screen video placeholder
- Local camera selected by default
- current selected session mode visible
- floating control panel visible

While connecting:

- show connection state
- keep Stop available
- disable Apply until connected or generating
- prevent session mode switching until stopped

While running:

- show the live display stream; model-backed sessions prefer transformed output when available
- timer counts active session time
- prompt and image can be updated with Apply for model-backed sessions
- panel may auto-hide so video remains primary

After stop:

- disconnect realtime client
- stop camera tracks
- clear video stream
- reset timer
- return to disconnected

## Control Panel

The panel includes:

- session mode selector with Local camera, Lucy 2.1, and Lucy VTON 3
- status summary
- prompt input with an empty initial value and placeholder-only guidance for model-backed sessions
- image upload and clear action for model-backed sessions
- options disclosure with Enhance prompt toggle on by default for model-backed sessions
- Start, Stop, Apply, and Reset actions
- error banner
- session timer

Components should stay presentational and receive state/callbacks through props.
