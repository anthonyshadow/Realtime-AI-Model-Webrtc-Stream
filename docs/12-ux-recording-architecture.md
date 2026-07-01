# UX And Recording Architecture
> Last updated: 2026-07-01

Use this as the maintainer contract for the redesigned control panel, bottom recording dock, recording completion flow, and API usage guardrails.

## Source Map

- `src/App.tsx` composes control-panel draft state, live-session state, recording state, and completion messages.
- `src/components/ControlPanel/` owns setup, model controls, session actions, status, and errors.
- `src/components/RecordingDock/` owns the bottom recording transport and review playback UI.
- `src/hooks/useAutoHideOverlay.ts` owns shared overlay visibility behavior, including multi-root live overlays.
- `src/hooks/useLiveSession.ts` owns local camera, model/API lifecycle, display stream, recordable stream, and model release back to local preview.
- `src/hooks/useRecordingCompletionFlow.ts` coordinates post-recording model release after the recorder finalizes.
- `src/hooks/useSessionRecording.ts` owns `MediaRecorder`, recording state, Blob/object URL, filename, duration, size, and object URL cleanup.
- `src/lib/streamComposition.ts` owns recordable stream selection for local and model-backed sessions.

UI components must stay presentational. They receive state and callbacks through props and must not request media, fetch tokens, import Decart, stop source tracks, or decide API lifecycle.

## Control Panel Contract

The control panel is for session setup, model configuration, session-level actions, and concise status. It is not a recording surface.

Belongs in the control panel:

- session mode selection before a session starts
- the active mode summary once a session is running
- Local camera start setup
- model-backed prompt, reference image, and Enhance prompt controls
- model-only advanced options inside a disclosure or visually secondary section
- Start session, Stop session, Apply, and Reset
- session timer, status summary, pending-change state, validation errors, and recovery copy

Does not belong in the control panel:

- Record or Stop recording actions
- recording playback, Download, Discard, or discard confirmation
- Decart token, SDK, WebRTC, or camera cleanup logic
- business rules that decide when model/API usage is released
- long how-to text, manual-style explanations, or future controls shown before they are relevant

Section organization should stay progressive:

- `SessionSetupSection` answers "what mode am I in?" and "what is the next setup step?"
- `ModelControlsSection` appears only for model-backed modes.
- `ModelControlsSection` uses a mode-specific title and short helper: Lucy 2.1 is for character/style transformation, and Lucy VTON 3 is for garment try-on.
- `PromptControlsSection` and `ReferenceImageSection` remain model-specific controls and should not appear in Local camera mode.
- Upload controls must stack within the drawer/sheet, truncate long filenames, keep preview/empty states visible, and expose a clear action without overlapping the recorder lane.
- `AdvancedOptionsSection` holds optional model controls such as Enhance prompt. Keep it collapsed or visually secondary by default unless a feature is core to starting the session.
- `SessionActionsSection` keeps session-level actions sticky inside the scrollable panel on short viewports. Apply is enabled only for connected/generating model sessions with unapplied changes, and full Apply continues sending prompt, image, and Enhance together.
- `StatusMessage`, `StatusSummary`, and errors should be clear enough to recover, but not visually louder than the primary session action unless action is blocked.
- `ControlPanel` distinguishes no recorder, compact recorder transport, collapsed recorded controls, and expanded review sheet layouts. Live drawers must reserve enough safe-area-aware bottom space for compact recorder surfaces, and the app hides the drawer while an expanded review sheet is active instead of relying on z-index overlap.

Future features should follow the same hierarchy. Add new model options to the model section or advanced disclosure. Add new session-wide actions to the session actions area only when they affect the live session itself. Add new recording or clip-management features to the recording dock or a dock-connected review surface, not to the control panel.

## Recording Dock Contract

Recording lives outside the control panel because it is a live transport control. Users should understand that Stop session ends the camera/session, while Stop recording finalizes a clip.

The dock renders only when at least one of these is true:

- the camera/session is active
- recording is in progress or stopping
- a recording error needs attention
- a captured clip remains available for review

The dock should be hidden when the camera/session is off and there is no critical recording state or captured clip.

The dock uses `useAutoHideOverlay()` with the same interaction contract as the control panel. In the app shell, the drawer and dock can share one live overlay controller so they reveal, hover-hold, focus-hold, and hide together:

- show on mouse movement
- show on touch start
- show on keyboard interaction
- show and remain visible while focus is inside
- show and remain visible while the pointer is inside
- stay visible while the window is inactive for browser file selection
- dismiss with Escape only when no hover, focus, file-picker, or forced error state is active
- hide after inactivity while the camera/session is active, including while recording or stopping
- force visible while showing a recording error
- force visible while discard confirmation is active, especially for touch users without hover

Desktop behavior:

- bottom-center floating dock
- paired with a left slide-in control drawer while live
- compact status/time/action transport while ready, recording, or stopping
- expanded review sheet connected to the dock after capture
- saved clips expose Download, Keep, Discard, and Record again without moving clip ownership out of the recorder state hook
- visually separate from the left control panel
- does not obscure the primary setup actions

Mobile behavior:

- bottom safe-area aware
- leaves a separate safe-area-aware sheet lane for live controls above the recorder
- keeps the compact recorder transport short on phones by pairing status with time and placing the primary recording action on its own row
- thumb-friendly Record, Stop recording, Download, Discard, Keep, Review clip, and Record again controls
- constrained width with scrollable review content when needed
- saved review uses a bottom-sheet shape with compact metadata and a video preview constrained to the viewport
- Keep collapses the review sheet without deleting the clip; Review clip reopens it
- leaves enough bottom lane for browser UI and the control panel
- can evolve into a fuller bottom sheet without moving recording back into the control panel

Accessibility behavior:

- the dock is a labelled region
- status text uses live-region behavior where appropriate
- recording errors use alert semantics
- buttons and links use visible labels that match their action
- focused controls must never disappear because the auto-hide hook suppresses hiding while focus is within the overlay root
- reduced-motion users should not depend on transform-heavy transitions

## Recording Lifecycle

Recording state comes from `useSessionRecording()`:

- `idle`: no recordable stream is available.
- `ready`: a stream exists and `MediaRecorder` is available.
- `recording`: chunks are being collected.
- `stopping`: `MediaRecorder.stop()` has been requested and the browser `stop` event has not finished.
- `recorded`: Blob, object URL, filename, duration, and size are ready for review.
- `error`: recording is unsupported, unavailable, or failed.

Recording actions:

- Record starts `MediaRecorder` against `useLiveSession().recordableStream`.
- Stop recording stops only the recorder first.
- Review playback uses the generated object URL in a local `<video controls>` element.
- Download is a local anchor download with the generated filename and extension.
- Discard requires confirmation and clears only the local clip artifact.
- Keep is a UI-only action that collapses the review surface and leaves the clip artifact intact.
- Record again uses the same `startRecording()` path as Record; the recording hook revokes/replaces the prior object URL when the new take starts.
- `RecordingPlaybackPanel` reports discard confirmation state to `FloatingRecordingDock`, and the app shell uses that signal to pin the shared live overlay open until Keep, Discard clip, or clip cleanup resolves the state.
- Keep hides the review details without deleting the clip.

Local-only stop recording behavior:

- stop `MediaRecorder`
- finalize Blob and object URL
- keep local camera and microphone tracks live
- keep the active session in Local camera mode
- do not call `/api/realtime-token`
- do not import or connect Decart

Model/API-backed stop recording behavior:

- stop `MediaRecorder`
- wait for the recording to enter `recorded` or `error`
- call `releaseModelSessionToLocalPreview()`
- disconnect the Decart realtime client and clear model output stream ownership
- reuse the existing live local camera stream when it is healthy
- request a new local camera stream only if the prior input stream is missing or no longer live
- switch the active session mode to Local camera
- keep the recorded object URL, filename, playback, Download, and Discard available
- show concise copy such as "Recording ready. Model session ended to save usage. Local camera remains on."

Discarding a model recording must not reconnect Decart or restart model/API usage. Stop session remains the only action that stops all live local tracks and returns the app to disconnected.

## API Release Behavior

Local camera mode is frontend-only. It must never call `/api/realtime-token`, resolve a Decart model, create a Decart client, connect realtime, or send realtime state.

Model-backed modes use API resources only after Start is clicked. Selecting Lucy or VTON, editing prompt text, uploading an image, toggling Enhance prompt, clearing an image, or resetting the draft before Start must not create token usage.

Stopping recording in model-backed mode releases API usage through this orchestration:

1. `FloatingRecordingDock` calls the high-level `onStopRecording` prop.
2. `useSessionRecording()` stops `MediaRecorder` and finalizes the artifact.
3. `useRecordingCompletionFlow()` observes the finalized model recording state.
4. `useLiveSession().releaseModelSessionToLocalPreview()` disconnects Decart and returns display to local preview.
5. `App.tsx` resets the control panel draft to Local camera and shows the model-ended completion message.

Do not implement API release as a side effect inside a UI component. Keep this split so recording owns recorder state, live session owns API/media lifecycle, and App composes the user-facing flow.

## Stream Strategy

`useLiveSession()` exposes three important streams:

- `localStream`: camera and microphone owned by `useMediaSession()`.
- `modelOutputStream`: transformed Decart output owned by `useDecartModelSession()`.
- `displayStream`: the stream shown by `VideoStage`; it prefers model output when present and otherwise uses local preview.

`recordableStream` is selected by `src/lib/streamComposition.ts`:

- Local camera mode uses local video plus local microphone audio.
- Model-backed mode waits for model output video before recording is enabled.
- Model-backed recording uses model output audio when available.
- If model output has no audio, model-backed recording uses local microphone audio as fallback.
- If model output video is missing, the dock shows a waiting state instead of allowing recording.

The composition helper creates a new `MediaStream` wrapper around existing source tracks. It does not clone tracks today and does not stop source tracks in cleanup. Source track ownership stays with the media or model session that created them.

Known stream and browser limitations:

- Decart output audio is not guaranteed.
- Safari and iOS may expose different or partial `MediaRecorder` support.
- UI overlays are not recorded; only the selected source stream is captured.
- Recordings live in browser memory only and do not survive refresh.
- There is no backend upload, recording gallery, cloud persistence, or session history.

## Cleanup Ownership

Local media cleanup:

- `useMediaSession()` owns camera and microphone tracks.
- Stop session stops local tracks.
- Starting a new camera request stops or supersedes prior local streams safely.
- Model recording release reuses live local tracks when possible and avoids duplicate camera requests.

Model/API cleanup:

- `useDecartModelSession()` owns the Decart realtime client and model output stream.
- Stop session disconnects Decart for active model-backed sessions.
- Stop recording disconnects Decart after model-backed recording finalization.
- Local camera mode must never create Decart resources, so there is nothing to disconnect.

Recorder cleanup:

- `useSessionRecording()` owns the active `MediaRecorder`.
- Stop recording calls `MediaRecorder.stop()`.
- Stop session while recording asks the recorder to stop before the live session is stopped.
- Recorder event listeners are removed when the recorder stops, errors, resets, or unmounts.

Object URL cleanup:

- `useSessionRecording()` owns recorded object URLs.
- The current object URL is revoked on discard/reset, replacement by a new recording, and unmount.
- Model/API disconnect must not revoke the recording URL.
- Download and playback remain available until discard, replacement, or unmount.

Composed stream cleanup:

- `useLiveSession()` calls the composition cleanup when the composed recordable stream changes.
- Current cleanup is a no-op because the composed stream wraps existing source tracks.
- If future work clones tracks, captures canvas output, or creates generated tracks, that helper must own and stop only those generated tracks.

## Testing Contract

Unit and component coverage should protect:

- default mode is Local camera
- Local camera start requests mocked webcam/microphone only
- Local camera start does not call `/api/realtime-token`
- Local camera start does not create or connect Decart
- Local recording starts, stops, and keeps the camera live
- Local discard keeps the camera live
- model selection alone does not call token or Decart connect
- Lucy and VTON call Decart only after Start
- prompt, image, Enhance prompt, Apply, clear image, Reset, status, and errors still work
- control panel hides local-irrelevant model controls
- recording controls are not rendered inside the control panel
- dock hidden/off, ready, recording, stopping, recorded, error, expanded review, and collapsed review states
- focus and keyboard interaction keep overlays visible
- auto-hide while recording after inactivity, with visibility restored by mouse, touch, keyboard, focus, or pointer interaction
- forced visibility in critical errors
- object URL creation and revocation on discard, replacement, and unmount
- no duplicate local camera request during model release when the existing local stream is live

E2E coverage should protect:

- local mode never hits token, Decart connect, or external Decart network paths
- Lucy and VTON token/connect happen only after Start
- model recording uses model output as the recordable video source
- Stop recording in model mode disconnects Decart/API usage
- local preview remains visible after model release
- playback, Download, and Discard remain available after model release
- discard does not reconnect model/API usage
- Stop session still stops local tracks and disconnects model sessions

Storybook coverage should include desktop and mobile local idle/live, model setup/live, recording active, recorded review expanded/collapsed, error states, and recording unsupported. Stories must mock camera, recorder, object URLs, and Decart behavior.
Use the shared Storybook viewport names for 320, 360, 390, 430, 768, 1024,
1280, 1440, and 1600px+ responsive QA, and assert no horizontal overflow in
high-risk app shell stories.

Manual browser QA checklist:

- Start Local camera, record, stop recording, play back, download, discard, and confirm local preview remains live.
- Confirm Local camera never calls `/api/realtime-token` or Decart in the browser network panel.
- Select Lucy and VTON, edit controls, and confirm no token request happens until Start.
- Start Lucy and VTON, record after transformed output is ready, stop recording, and confirm the model session disconnects while local preview remains visible.
- Confirm playback, Download, and Discard still work after model release.
- Confirm discard does not reconnect Decart.
- Stop session after local and model flows and confirm local tracks stop.
- Test narrow browser, tablet, and mobile widths for dock/panel overlap, safe-area spacing, focus visibility, and reachable actions.
- Repeat recording support checks in Chrome, Safari desktop, and iOS Safari when available.
