# UI And UX
> Last updated: 2026-07-01

Use this before modifying the video stage, floating control panel, or component states.

For the detailed maintainer contract covering control-panel boundaries, recording dock behavior, recording lifecycle, API release, stream strategy, cleanup, and QA guardrails, use [12-ux-recording-architecture.md](12-ux-recording-architecture.md).

## Product Shape

The app opens directly into the working video experience, not a marketing page.

## Stream-First Design Foundation

Shared stream-first UI primitives live in `src/components/StudioUI/`.
Use `StatusPill`, `MetricCard`, `SectionHeader`, `Surface`/`Card`, the
studio buttons, and `FileUploadControl` for new setup panels, drawers, recorder
sheets, and error surfaces before adding one-off Tailwind treatments.

Design tokens for spacing, radii, panel widths, overlay z-indexes, transition
durations, and responsive breakpoints live in `src/constants/design.ts`.

Before start:

- dark full-screen video placeholder
- Local camera selected by default
- current selected session mode visible
- camera-off setup card visible instead of the dense live control panel
- large Local camera, Lucy 2.1, and Lucy VTON 3 session cards
- compact setup confirmation rows for selected mode, camera, microphone, and permission
- one primary Start/Try again action plus secondary Reset
- model prompt and image controls shown only for model-backed setup

While connecting:

- show connection state
- keep Stop available
- disable Apply until connected or generating
- prevent session mode switching until stopped

While running:

- show the live display stream; model-backed sessions prefer transformed output when available
- the live video fills the viewport without stretching
- timer counts active session time
- prompt and image can be updated with Apply for model-backed sessions
- controls share one stream-first visibility controller so the drawer and recorder reveal together
- desktop controls use a left slide-in drawer over the stream
- mobile controls use a safe-area-aware bottom sheet lane above the recorder transport
- controls reveal on mouse movement, touch, keyboard interaction, and focus, then auto-hide after inactivity
- Escape may dismiss live overlays when no focus, hover, upload, or error state needs to keep them open
- the live drawer reserves a larger safe-area-aware lane for the recorder transport on phones and desktop, uses a taller lane for collapsed saved-clip controls, and hides while an expanded captured-clip review sheet is active
- recorder transport uses a compact phone layout with status/time on the first row and the action on the second row, so the drawer and recorder do not overlap at 320px+

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

- a mode-specific title and compact helper: Lucy 2.1 for character/style transformation, Lucy VTON 3 for garment try-on
- prompt input with an empty initial value and placeholder-only guidance for model-backed sessions
- image upload, truncated filename, preview/empty state, and clear action for model-backed sessions
- options disclosure with Enhance prompt toggle off by default for model-backed sessions
- Apply enabled only when the model session is connected/generating and there are unapplied changes

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
- uses a compact status/time/action transport while ready, recording, or stopping
- keeps recording active visually clear with REC state, elapsed time, and an easy-to-find Stop recording action when controls are visible
- shows timer, ready/waiting/error copy, REC state, model-ended review copy, and the latest captured clip review/download/keep/discard controls
- opens recorded clips in an expandable review sheet with embedded playback, compact metadata, Download, Keep, Discard, and Record again actions
- treats Keep as non-destructive collapse/keep behavior; Record again starts a new take through the existing recorder start path
- uses a two-step discard confirmation so removing the local clip is deliberate
- keeps discard confirmation inline inside the review sheet with "Discard this clip? This cannot be undone."
- keeps the overlay visible while discard confirmation is active
- stays bottom-center on desktop and safe-area aware near the bottom edge on mobile
- turns saved-clip review into a mobile bottom sheet that can scroll within the viewport
- keeps review metadata in a compact three-cell row and constrains mobile playback height so Download, Keep, Discard, and Record again remain reachable
- reserves a bottom lane on phone, tablet, and laptop widths so the control panel and dock do not collide

## Overlay Behavior

Auto-hide behavior lives in `src/hooks/useAutoHideOverlay.ts` so the control panel and recording dock share the same interaction contract.

Overlay controls should:

- appear on mouse movement, touch interaction, keyboard interaction, or focus
- hide after inactivity only while an active session is safe to auto-hide
- remain visible while the user is focused inside or pointing inside any live overlay root
- remain visible while the window is inactive for browser file selection
- force visibility for critical states such as errors and discard confirmation
- stay visible for setup, connecting, stopped, and error recovery states
- support multiple roots so the control drawer and recording dock behave as one live overlay cluster
- respect reduced-motion preferences by avoiding transform-heavy overlay transitions

## Responsive QA

Storybook defines named QA viewports for 320, 360, 390, 430, 768, 1024,
1280, 1440, and 1600px+ widths. App shell stories should use these viewport
names for setup, live, recording, review, discard confirmation, and error
states, and include a horizontal-overflow assertion for high-risk states.
