# UI And UX
> Last updated: 2026-06-30

Use this before modifying the video stage, floating control panel, or component states.

For the detailed maintainer contract covering control-panel boundaries, recording dock behavior, recording lifecycle, API release, stream strategy, cleanup, and QA guardrails, use [12-ux-recording-architecture.md](12-ux-recording-architecture.md).

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

After stopping a recording in a model-backed session:

- finalize the recording and keep review playback/download/discard available
- end model usage and return the live display to local camera preview
- show concise dock copy that the model session ended to save usage and local camera remains on

After stop:

- disconnect realtime client
- stop camera tracks
- clear video stream
- reset timer
- return to disconnected

## Control Panel

The panel is organized as compact progressive sections so setup, model controls, actions, and status do not read as one long list.

The setup section includes:

- session mode selector with Local camera, Lucy 2.1, and Lucy VTON 3 before a session starts
- compact mode/session/changes summary while a session is active, without disabled mode buttons
- status summary
- next-step or error message

The model controls section appears only for model-backed sessions and includes:

- prompt input with an empty initial value and placeholder-only guidance for model-backed sessions
- image upload and clear action for model-backed sessions
- options disclosure with Enhance prompt toggle off by default for model-backed sessions

The actions and feedback areas include:

- Start, Stop, Apply, and Reset actions
- session timer
- sticky action access inside the scrollable panel on constrained heights

Components should stay presentational and receive state/callbacks through props.

## Recording Dock

Recording controls live outside the control panel in a bottom-center floating dock.

The dock:

- appears only when the camera/session is active, a recording is in progress, an error needs attention, or a captured clip is still available for review
- uses `src/components/RecordingDock/FloatingRecordingDock.tsx`
- receives recording state and callbacks from `App.tsx`
- remains model-agnostic and does not know about Decart
- uses `useAutoHideOverlay` for mouse, touch, keyboard, focus, inactivity, and forced visibility behavior
- auto-hides after inactivity while the camera/session is active, including during recording
- stays visible while a critical recording error is present
- keeps Record and Stop recording visually separate from the main session Start/Stop action
- shows timer, ready/waiting/error copy, REC state, model-ended review copy, and the latest captured clip review/download/discard controls
- opens recorded clips in an expandable review surface with embedded playback and a compact collapsed state
- uses a two-step discard confirmation so removing the local clip is deliberate
- stays bottom-center on desktop and safe-area aware near the bottom edge on mobile
- reserves a bottom lane on phone, tablet, and laptop widths so the control panel and dock do not collide

## Overlay Behavior

Auto-hide behavior lives in `src/hooks/useAutoHideOverlay.ts` so the control panel and recording dock share the same interaction contract.

Overlay controls should:

- appear on mouse movement, touch interaction, keyboard interaction, or focus
- hide after inactivity only while an active session is safe to auto-hide
- remain visible while the user is focused inside or pointing inside the overlay
- force visibility for critical states such as errors
- stay visible for setup, connecting, stopped, and error recovery states
- respect reduced-motion preferences by avoiding transform-heavy overlay transitions
