# UI And UX
> Last updated: 2026-06-28

Use this before modifying the video stage, floating control panel, or component states.

## Product Shape

The app opens directly into the working video experience, not a marketing page.

Before start:

- dark full-screen video placeholder
- current selected model visible
- floating control panel visible

While connecting:

- show connection state
- keep Stop available
- disable Apply until connected or generating
- prevent model switching until stopped

While running:

- show transformed remote stream when available
- timer counts active session time
- prompt and image can be updated with Apply
- panel may auto-hide so video remains primary

After stop:

- disconnect realtime client
- stop camera tracks
- clear video stream
- reset timer
- return to disconnected

## Control Panel

The panel includes:

- model mode selector
- status summary
- prompt input
- image upload and clear action
- options disclosure with Enhance prompt toggle
- Start, Stop, Apply, and Reset actions
- error banner
- session timer

Components should stay presentational and receive state/callbacks through props.
