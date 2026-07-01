# UI UX Stream First Redesign Plan
> Last updated: 2026-06-30

This is the audit and implementation plan for redesigning the camera/session control UI into a stream-first realtime video experience. It is planning-only and does not change runtime behavior.

Reference inputs:

- [context/screens.md](context/screens.md)
- [context/assets/ai-video-studio-redesigned-experience-2026-06-30.png](context/assets/ai-video-studio-redesigned-experience-2026-06-30.png)
- [08-ui-and-ux.md](08-ui-and-ux.md)
- [12-ux-recording-architecture.md](12-ux-recording-architecture.md)

## Design Intent

Subject and audience: people using a local realtime webcam studio to choose a camera/model mode, start a live session, make model adjustments, and optionally record. The audience should not need to understand Decart, WebRTC, token state, or `MediaRecorder`.

Page job: get the user from "camera off" to a clear live stream, then keep controls available without letting them become the product.

Visual thesis: a dark, precise studio surface where the stream is the largest object, status is small and legible, and controls behave like temporary production overlays rather than a permanent dashboard.

Color roles:

- App background: current `#050505` / Tailwind `neutral-950`.
- Surface: mockup role `#0F1115`, already approximated by `bg-neutral-950/72` and `bg-black/25`.
- Border: mockup role `#252A32`, already approximated by `border-white/10` and `border-white/15`.
- Primary action: mockup role `#22D3EE`, current Tailwind `cyan-300`.
- Success: mockup role `#10B981`, current Tailwind `emerald`.
- Danger: mockup role `#EF4444`, current Tailwind `red`.
- Text: mockup role `#F5F7FA`, current white/neutral text.

Typography roles:

- Display: idle/setup headline only, not inside drawers or compact controls.
- Section heading: short labels such as "Choose a session", "Ready to go", "Lucy 2.1".
- Control label: form labels and button labels, sentence case.
- Caption: concise helper text and metadata; avoid long instructional paragraphs.
- Data: timers, recording duration, file size, and status values use tabular numerals where relevant.

Spacing and layout system:

- Use a stream viewport as the root surface.
- Use one setup panel before start, then transient overlays during live sessions.
- Use constrained widths with `min()`, `max()`, and `clamp()` instead of brittle fixed layout math.
- Use safe-area-aware bottom lanes on mobile.
- Use scroll inside sheets/drawers only when content exceeds the safe viewport.

Signature design element: a bottom recorder transport that feels connected to the live stream, with a small status/time/action cluster in normal use and an expandable review sheet only after capture.

Motion and interaction approach:

- Reveal controls on user intent: pointer movement, tap, keyboard activity, or focus.
- Hide after a short inactivity delay only when no interaction, input, upload, confirmation, recording review, or error needs attention.
- Use opacity and small translate transitions; avoid motion dependency and respect `prefers-reduced-motion`.

Design critique before implementation: the current app is already close architecturally, but the visual model still treats setup, active controls, model options, status, and session actions as one persistent card. The redesign should not add decorative complexity. It should simplify: fewer always-visible panels, shorter copy, clearer state boundaries, and more breathing room for video.

## 1. Current UI Audit

### Component Inventory

Session selection and setup:

- `src/App.tsx` composes draft session mode, prompt, image, enhance state, pending changes, live session state, recording state, and passes everything into the panel/dock.
- `src/components/ControlPanel/AutoHidingControlPanel.tsx` wraps `ControlPanel` with `useAutoHideOverlay`.
- `src/components/ControlPanel/ControlPanel.tsx` renders the entire setup/model/actions panel.
- `src/components/ControlPanel/SessionSetupSection.tsx` groups mode selector, status summary, and status message.
- `src/components/ControlPanel/SessionModeSelector.tsx` renders the Local Camera, Lucy 2.1, and Lucy VTON 3 choices.
- `src/components/ControlPanel/StatusSummary.tsx` renders Mode, Session, and Changes metric cells.
- `src/components/ControlPanel/StatusMessage.tsx` renders next-step, pending, applying, connecting, live, and error copy.

Model controls:

- `src/components/ControlPanel/ModelControlsSection.tsx` renders prompt, image upload, and advanced options for model-backed modes.
- `src/components/ControlPanel/PromptControlsSection.tsx` and `PromptInput.tsx` own prompt label, textarea, placeholder, and helper copy.
- `src/components/ControlPanel/ReferenceImageSection.tsx` and `ImageUpload.tsx` own reference/garment image upload, preview, filename, helper copy, and clear action.
- `src/components/ControlPanel/AdvancedOptionsSection.tsx` and `EnhanceToggle.tsx` own the Enhance prompt disclosure.

Session actions, status, and errors:

- `src/components/ControlPanel/SessionActionsSection.tsx` adds "Run" copy and wraps session actions.
- `src/components/ControlPanel/SessionControls.tsx` owns Start/Stop, Apply, and Reset button state.
- `src/components/ControlPanel/TimerDisplay.tsx` shows session elapsed time inside the control panel.
- `src/components/ControlPanel/ErrorBanner.tsx` exists and has stories, but active panel errors currently render through `StatusMessage`.
- `src/components/VideoStage/StatusBadge.tsx` renders the top-left stage status pill.

Stream viewport:

- `src/components/VideoStage/VideoStage.tsx` attaches `displayStream`, renders the fullscreen video element, placeholder, and status pill.
- `src/components/VideoStage/VideoPlaceholder.tsx` renders the idle "Start camera to begin" state.

Recorder, review, discard, and recording errors:

- `src/components/RecordingDock/FloatingRecordingDock.tsx` renders recording status, timer, Record/Stop recording/Record again, and review panel.
- `src/components/RecordingDock/RecordingDockButton.tsx` owns the recorder CTA label and disabled state.
- `src/components/RecordingDock/RecordingStatusBadge.tsx` owns ready/recording/recorded/error badge styling.
- `src/components/RecordingDock/RecordingPlaybackPanel.tsx` owns playback, Download, Collapse/Review, Discard, and discard confirmation.

Lifecycle and state dependencies:

- `src/hooks/useAutoHideOverlay.ts` owns global activity, focus, pointer, touch, and inactivity behavior.
- `src/hooks/useLiveSession.ts` owns live camera/model lifecycle, `RealtimeStatus`, `displayStream`, `recordableStream`, and model release back to local preview.
- `src/hooks/useMediaSession.ts` owns camera and microphone acquisition.
- `src/hooks/useDecartModelSession.ts` owns Decart token/client/connect/apply/reset state.
- `src/hooks/useSessionRecording.ts` owns `MediaRecorder`, recording states, object URLs, filenames, duration, and cleanup.
- `src/hooks/useRecordingCompletionFlow.ts` releases model/API usage after model recording finalizes.
- `src/lib/decartClient.ts`, `realtimeState.ts`, `media.ts`, and `streamComposition.ts` protect integration boundaries.
- `src/constants/sessionModes.ts`, `models.ts`, and `prompts.ts` centralize user-facing model/session copy and supported ids.

### Current Layout And Visual Issues

Panel weight:

- `ControlPanel` is always the same structural panel for idle setup, connecting, live local, and live model. It is fixed at the bottom-left on desktop and spans left/right on mobile (`ControlPanel.tsx:80-84`). This makes active sessions feel like a control dashboard instead of a stream.
- The panel hides by opacity/translation while live, but when visible it remains a tall multi-section card with setup, status, model controls, and actions all in one scroll container (`ControlPanel.tsx:98-134`).
- The live panel is not a left slide-out drawer. It is anchored near the bottom and reserves space above the recorder dock, which can shrink it into a cramped scroll region on short viewports (`ControlPanel.tsx:74-76`).

Stream dominance:

- `VideoStage` is fullscreen, but the live video uses `object-contain` (`VideoStage.tsx:34`). This preserves the whole frame but can leave letterboxing and reduce the feeling that the stream fills the viewport.
- `StatusBadge` is always visible at top-left (`VideoStage.tsx:45-47`). The north-star mockup makes status small and important, but the hidden live state should be mostly stream-only unless the status is recording/error/connection-critical.
- Idle placeholder and setup panel are separate surfaces. The placeholder says "Start camera to begin" while the panel says "Choose the session"; the visual hierarchy does not yet create a single clear setup flow.

Copy redundancy and hierarchy:

- `SessionSetupSection` always says "Pick local preview or a Decart model before starting. Mode switches unlock after stopping." (`SessionSetupSection.tsx:30-33`). This repeats the same idea as the session selector, placeholder, and `StatusMessage`, and it can appear while a session is already live.
- `SessionActionsSection` adds another explanatory sentence: "Start or stop the session, then apply model changes when needed" or "Start or stop the local camera preview" (`SessionActionsSection.tsx:29-37`). This turns the active drawer into instructional text.
- `StatusMessage` adds long live-state copy such as "Model controls are synced. Adjust prompt or image when you want a new look" and "Local camera is on. Recording is available when the stream is ready" (`StatusMessage.tsx:117-130`). Useful as state feedback, but too prominent for an already-running stream.
- Status is repeated in several places: top-left `StatusBadge`, `StatusSummary`, `StatusMessage`, recorder badge, and timers.
- Timer meaning is split: `TimerDisplay` shows session time while `FloatingRecordingDock` shows recording time. The visual hierarchy does not clearly separate "session elapsed" from "recording duration".

Session selection:

- `SessionModeSelector` is a compact segmented grid (`SessionModeSelector.tsx:15-47`) rather than three large choice cards. The mockup asks for prominent cards with one primary CTA.
- The selector switches to three columns at `min-[420px]` (`SessionModeSelector.tsx:17`), which can make labels and subtitles dense on smaller phones and narrow panels.
- There is no explicit pre-camera check step. The app moves directly from selection to camera permission request.

Prompt and upload controls:

- `ImageUpload` uses a native file input styled inline (`ImageUpload.tsx:70-76`). Native file controls vary by browser and are hard to make elegant or predictable.
- The preview row is a horizontal flex layout with thumbnail/empty box, filename/helper copy, and Clear button (`ImageUpload.tsx:79-107`). On small widths this can crowd, truncate, or make the Clear button compete with the text.
- Long file names are truncated (`ImageUpload.tsx:93-95`), but helper text remains in the same row and can increase row height or crowd the action.
- The file input, preview, helper text, and Clear action are not separated into stacked mobile states, which matches the current screenshot concern about uploads overlapping or cutting off.

Recording dock and review:

- `FloatingRecordingDock` auto-hides with the same hook and already lives outside the control panel, which is good. It still uses a dense two or three column grid while ready/recording (`FloatingRecordingDock.tsx:111-147`).
- On recorded state, the dock becomes a wide floating card with `w-[min(calc(100vw-1rem),42rem)]` and `max-h-[calc(100vh-env(safe-area-inset-bottom)-1rem)]` (`FloatingRecordingDock.tsx:91-96`). This prevents viewport overflow, but on mobile it still behaves like a floating card rather than a clean bottom sheet.
- `RecordingPlaybackPanel` uses a three-column metric grid even on mobile (`RecordingPlaybackPanel.tsx:104-117`), which can become crowded.
- The mobile review story verifies visibility but does not assert no clipping, no overlap, or reachable controls.
- Review actions are Download and Discard, plus Collapse/Review. The requested north-star actions are Download, Keep, Discard, and Record Again. Current "Collapse" is functional but reads as UI mechanics rather than user intent.
- Discard copy says "Discard this take? This removes the local clip only" (`RecordingPlaybackPanel.tsx:147-149`). The requested copy is clearer and stronger: "Discard this clip? This cannot be undone."

Errors and recovery:

- Active errors render as `StatusMessage` with `role="alert"` and "Needs attention" (`StatusMessage.tsx:38-47`, `StatusMessage.tsx:59-64`).
- Recovery CTAs are implicit through existing Start/Stop/Reset buttons. The user does not get tailored actions such as Try Again, Check Permissions, Back to Local Camera, or Reset Session.
- `ErrorBanner` exists but is not used by `ControlPanel`; this creates two potential error display patterns.
- Error states still live inside the full control panel. If the stream is missing or the panel is hidden incorrectly, users could feel stranded.

Responsive and spacing risks:

- Current panel bottom reservation is encoded as fixed calc values for a dock lane (`ControlPanel.tsx:74-76`). It avoids direct collision with the dock but can produce very small panel heights and internal scrolling.
- Current panel width is a fixed `sm:w-[23rem]` (`ControlPanel.tsx:83`), which is reasonable on desktop but not a full drawer system.
- Mobile live mode has two overlay systems: full-width bottom-ish control panel and bottom recorder dock. They can both be visible, requiring lane reservation and creating stacked overlays that compete for the stream.
- `FloatingRecordingDock` has safe-area bottom positioning (`FloatingRecordingDock.tsx:102-106`), but the control panel and dock do not share a layout manager or CSS variables for overlay lanes.
- Current tests check for class presence, not actual bounding-box separation or clipping.

### State Management Risks

- `draft.sessionMode` and `realtime.activeSessionMode` intentionally diverge after model recording release, where the draft is reset to Local while the recording artifact remains (`App.tsx:153-186`). A redesign must not assume one mode value drives every surface.
- `lastAppliedDraftKey` gates pending changes (`App.tsx:50-55`). Moving prompt/image controls into drawers must preserve pending state and avoid losing draft state while hidden.
- `hasRecordingArtifact` keeps the recording dock rendered after a session stops (`App.tsx:57-62`). A new review sheet must distinguish "live review over stream" from "stopped session centered review".
- `handleStop` stops a recorder if recording is active, then stops the live session (`App.tsx:125-133`). Any new Stop Session UI must preserve recorder finalization and object URL availability.
- `useRecordingCompletionFlow` releases model sessions when model recording reaches `recorded` or `error` (`useRecordingCompletionFlow.ts:34-60`). Moving review UI must not duplicate release side effects.
- `useAutoHideOverlay` is attached independently to panel and dock. If live controls become a multi-part overlay, focus/pointer tracking must include the drawer, recorder bar, review sheet, and confirmation state, or controls may hide mid-interaction.
- Hidden overlays use visual opacity and pointer-events classes, but focusable descendants remain in the DOM. Keyboard activity currently reveals overlays before/while focus moves, but future use of `aria-hidden` or `inert` could break keyboard access unless an explicit "show controls" route exists.
- Local mode must remain frontend-only. UI phases must not introduce `/api/realtime-token` calls before Start or for Local camera.
- Uploaded images and recorded clips must stay in memory only. New upload/review components must preserve object URL revocation and not persist files.

## 2. Proposed Screen Architecture

### Session Selector / Camera Off

Job: choose how the camera should behave before any camera/model resources start.

Structure:

- `StudioShell` with dark full viewport background.
- `StreamViewport` idle placeholder centered.
- `SessionSetupPanel` as the only major panel.
- Top-left `StatusPill` shows Idle, Stopped, or Error only when useful.
- Three large `SessionModeSelector` cards: Local Camera, Lucy 2.1, Lucy VTON 3.
- One primary CTA: Continue. If the pre-camera step is intentionally skipped in a later phase, use Start Camera/Start Lucy Session/Start VTON Session directly.
- Secondary Reset only when there is state to reset.

Copy:

- Title: "Choose a session".
- Helper: one sentence, for example "Pick how you want to use the camera."
- Avoid repeated Decart/model explanation in the same view.

### Pre-Camera Check

Job: confirm selected mode, inputs, and permission readiness before entering live stream.

Structure:

- Compact setup/checklist panel.
- Selected mode row.
- Camera source row.
- Microphone source row.
- Permission status row.
- Primary CTA changes by mode: Start Camera, Start Lucy Session, Start VTON Session.
- Back action returns to session selection.

Important behavior:

- This step should not make live camera, Decart, or external network calls by itself.
- Permission can display "Not requested" before Start. If browser permission query is added later, keep it best-effort and non-blocking.

### Live Local Camera

Job: show local camera stream and keep session controls out of the way.

Structure:

- `StreamViewport` fills the viewport.
- Video uses a live-first fit mode that fills the available stage without stretching. If cropping is used, keep `object-position: center` and allow future face-safe positioning.
- Small `StatusPill` appears with controls, and may remain tiny if recording/error requires attention.
- `LiveControlsOverlay` appears on intent.
- `ControlDrawer` contains only Mode summary, Session status, Stop session, Reset.
- `RecorderBar` bottom-center shows Ready, 00:00, Record.

### Live Lucy 2.1

Job: show transformed output while allowing prompt/reference changes only when controls are visible.

Structure:

- `StreamViewport` prefers model output when available.
- `ControlDrawer` contains Lucy 2.1 status, prompt, reference image upload, Apply, Reset, Stop session.
- Prompt and upload stack cleanly inside the drawer.
- Bottom `RecorderBar` shows waiting state until model output is recordable, then Record/Stop recording.

### Live VTON 3

Job: show virtual try-on output while allowing garment prompt/image changes only when controls are visible.

Structure:

- Same stream-first shell as Lucy.
- `ControlDrawer` contains VTON status, garment prompt, garment image upload, Apply, Reset, Stop session.
- Upload component uses the same responsive stacking rules as Lucy.

### Recording Active

Job: signal recording clearly without blocking the stream.

Structure:

- Stream remains dominant.
- Bottom recorder surface shows Recording, duration, Stop Recording when overlays are visible.
- A tiny persistent REC indicator may remain visible even when controls hide.
- Control drawer remains hidden unless user reveals it or an error/confirmation requires it.

### Recording Review

Job: let the user play back, download, keep, discard, or record again.

Structure:

- If session is live: collapsible bottom sheet connected to `RecorderBar`.
- If session has stopped: centered review panel with max width and safe mobile padding.
- Actions: Download, Keep, Discard, Record Again.
- Mobile: full-width bottom sheet with top handle, internal scroll, and no clipped controls.

### Discard Confirmation

Job: prevent accidental deletion without interrupting the whole app.

Structure:

- Inline confirmation state inside the review sheet/panel.
- Copy: "Discard this clip? This cannot be undone."
- Actions: Keep and Discard Clip.
- Do not use a fullscreen dialog unless focus containment becomes necessary for accessibility.

### Error State

Job: make errors visible and recoverable.

Structure:

- Error banner/card inside the active panel or drawer.
- If no stream exists, show the error inside the setup panel over the idle viewport.
- If stream exists, force overlays visible but keep stream visible behind them.
- Recovery CTAs based on error type: Try Again, Check Permissions, Back to Local Camera, Reset Session.

## 3. Stream-First Interaction Model

Live stream rules:

- The active stream fills the viewport and remains the primary layer.
- UI overlays sit above the stream in controlled lanes: top status, left/side drawer, bottom recorder/review.
- Hidden state should show only the active stream plus any tiny critical indicator, such as REC or Error.
- Do not render a large persistent card over live video.

Overlay reveal triggers:

- Mouse movement anywhere in the studio shell.
- Pointer down/tap anywhere in the studio shell.
- Keyboard activity while focus is in the app.
- Focus entering any overlay control.
- Programmatic force visibility for errors, confirmations, upload progress, active typing, and expanded recording review.

Overlay hide rules:

- Auto-hide after 3000 ms of inactivity during active connected/generating/reconnecting sessions.
- Do not hide while pointer is inside any overlay.
- Do not hide while focus is inside any overlay.
- Do not hide while a text input, textarea, file input, disclosure, discard confirmation, or review sheet is active.
- Do not hide while an error or recovery action is displayed.
- Do not hide while the user is uploading/selecting a file.
- During recording, the main controls can hide, but a tiny REC indicator should remain visible.

Mobile behavior:

- Tap reveals overlays.
- Live control drawer should become a bottom sheet or full-height side sheet depending on available width; at 320px to 767px, prefer bottom sheet for thumb reach.
- Recorder bar stays bottom safe-area-aware.
- Expanded recording review replaces or grows from the recorder bar into a full-width bottom sheet.
- Avoid showing both a tall controls sheet and a tall review sheet at the same time. If review expands, collapse or defer the control drawer unless an error requires both.

Keyboard behavior:

- Tab or any keydown reveals overlays before focus is lost into invisible UI.
- Focus must never disappear because an overlay auto-hid.
- Escape closes optional drawers/sheets only when it does not discard data or stop a session.
- Enter/Space activate buttons and selector cards.
- File input remains reachable with a visible label and a visible custom button.

## 4. Proposed Component Architecture

Keep media, Decart, and recording lifecycle in existing hooks. New components should be presentational or shell-level composition only.

`StudioShell` or `AppShell`:

- Owns app-level layout regions and overlay coordination.
- Receives derived UI state and hook outputs from `App.tsx`.
- Provides a shared overlay activity root for drawer, recorder bar, review sheet, and status pill.
- Does not request media, fetch tokens, connect Decart, or own recorder side effects.

`StreamViewport`:

- Replaces or wraps `VideoStage`.
- Owns stream video element, idle placeholder, status pill slot, and stream fit behavior.
- Keeps `attachStreamToVideo` usage inside a video-specific component.

`SessionSetupPanel`:

- Renders Session Selector and Pre-Camera Check states.
- Owns no camera permission request; it calls `onContinue`, `onBack`, `onStart`, `onReset`.
- Uses `SessionModeSelector` cards and `MetricCard` checklist rows.

`SessionModeSelector`:

- Evolves from compact segmented grid into large selectable cards.
- Uses `SESSION_MODE_IDS` and `getSessionModeConfig`.
- Supports button semantics, `aria-pressed`, visible selection state, and 44px+ targets.

`LiveControlsOverlay`:

- Coordinates overlay visibility for live state.
- Uses `useAutoHideOverlay`, or a small extension of it, with one root activity scope.
- Passes visibility state to `StatusPill`, `ControlDrawer`, and `RecorderBar`.

`ControlDrawer`:

- Live session controls only.
- Desktop/tablet: left slide-out drawer with constrained width.
- Mobile: bottom sheet with max height and safe-area padding.
- Contains mode summary, model controls when applicable, errors, and session actions.

`RecorderBar`:

- Normal recording transport.
- Owns visible presentation for Ready, Waiting, Recording, Saving, Error, and Saved collapsed states.
- Reuses `useSessionRecording` state through props only.

`RecordingReviewSheet`:

- Extracted from `RecordingPlaybackPanel`.
- Handles expanded/collapsed review, video playback, metadata, Download, Keep, Discard, Record Again, and discard confirmation.
- Live mode: bottom sheet.
- Stopped mode: centered panel.

`ErrorBanner`:

- Becomes the single error presentation primitive.
- Receives message, tone, and optional recovery actions.
- Used in setup panel, control drawer, and recorder/review surfaces.

`StatusPill`:

- Shared status primitive for Idle, Starting, Connected, Generating, Reconnecting, Error, and Recording.
- Replaces duplicate status badge variants where practical.

`MetricCard`:

- Small reusable label/value tile for Mode, Session, Changes, Time, Size, Source, Camera, Microphone, Permission.
- Must support one-column mobile stacking.

`FileUploadControl`:

- Replaces native-file-input-heavy `ImageUpload` presentation while preserving the actual accessible file input.
- Stacks preview, filename, supported formats, and Clear action on mobile.
- Uses model config for label/action/empty/helper copy.

`PromptControl`:

- Wraps textarea, label, helper, pending state, and validation.
- Keeps textarea resize and max height predictable inside drawers.

## 5. State Model

Use a derived UI state machine layered on top of existing hook states. Do not move camera, Decart, or recording side effects into UI components.

Primary session UI state:

| UI state | Derived from | Shows | Exits by |
| --- | --- | --- | --- |
| `idle` | `realtime.status` is `idle` or `disconnected`, no pre-check open, no blocking recording review | Session Selector / Camera Off | Continue, Start, mode change |
| `setting-up` | user selected a mode and opened pre-camera check | Pre-Camera Check | Back, Start selected mode |
| `permission-requested` | `realtime.status` is `requesting-camera` | compact starting/check panel or forced drawer | camera success, camera error, Stop/Reset |
| `live-local` | `realtime.isRunning` and `activeSessionMode === "local"` | local stream plus live controls overlay | Stop session, recording, error |
| `live-model` | `realtime.isRunning` and active mode is model-backed | model/local stream plus model drawer and recorder | Stop session, model release after recording, error |
| `error` | `realtime.status === "error"` or `realtime.error` exists | forced error panel with recovery | Try Again, Check Permissions, Back to Local Camera, Reset |

Recording substate:

| Recording UI state | Derived from | Shows | Exits by |
| --- | --- | --- | --- |
| `recording-ready` | live session active, `recording.state === "ready"` | RecorderBar Ready, 00:00, Record | Record, Stop session |
| `recording-active` | `recording.state === "recording"` or `stopping` | REC indicator, elapsed time, Stop Recording/Saving | Stop recording, recorder error, Stop session |
| `recording-saved` | `recording.state === "recorded"` | review sheet/panel, Download, Keep, Discard, Record Again | Keep/collapse, Record Again, Discard |
| `discard-confirming` | review panel local confirmation state | inline confirmation | Keep, Discard Clip |
| `recording-error` | `recording.state === "error"` | recorder error banner and recovery | Record again when possible, Reset recording |

Composition rules:

- `recording-ready`, `recording-active`, and `recording-saved` are orthogonal to `live-local` and `live-model`.
- `recording-saved` can outlive the live session.
- If a model recording becomes `recording-saved`, `useRecordingCompletionFlow` must be allowed to release the model session exactly once.
- If `error` occurs while a recording review exists, show the error in the relevant surface without deleting the clip.
- `setting-up` must not call camera, token, SDK, or WebRTC APIs.

## 6. Responsive Rules

Use CSS logical constraints and shared overlay lane variables rather than scattered fixed offsets. Suggested variables for implementation:

- `--studio-safe-top: max(0.75rem, env(safe-area-inset-top))`
- `--studio-safe-bottom: max(0.75rem, env(safe-area-inset-bottom))`
- `--recorder-lane-height: clamp(5.5rem, 14dvh, 8rem)` for collapsed recorder lane
- `--control-drawer-width: clamp(20rem, 28vw, 24rem)` on desktop/tablet

Mobile 320px+:

- Root uses `min-height: 100dvh`, `min-width: 320px`, and `overflow: hidden`.
- Session Selector and Pre-Camera Check are single-column panels with width `min(100% - 1rem, 24rem)`.
- Live stream fills the viewport; no permanent control panel.
- Status pill sits at top-left with safe-area inset and small max width.
- Recorder bar is bottom safe-area-aware, width `calc(100vw - 1rem)`, max width none below 480px.
- Control drawer becomes a bottom sheet with max height around `min(78dvh, calc(100dvh - var(--recorder-lane-height) - 1rem))`.
- If recorder review is expanded, it becomes the active bottom sheet and the control drawer closes/collapses unless forced by error.
- File upload stacks vertically: custom upload button, preview/filename block, Clear action full-width or aligned below.
- Metric cards stack one column or two compact columns only when text fits.
- Every interactive target is at least 44px high.

Tablet 768px+:

- Setup panel can sit beside or overlay the preview, but the preview remains dominant.
- Live control drawer may use left side placement with width `clamp(20rem, 40vw, 23rem)`.
- Drawer height fits between top safe area and recorder lane with internal scroll only for model controls.
- Recorder bar remains bottom center with max width around 34rem when collapsed.
- Review sheet can max at 42rem and stay bottom-centered.
- Upload controls can use two-column preview/actions only if the filename and helper text have enough width.

Desktop 1024px+:

- Stream viewport fills the window.
- Live drawer slides in from the left, width about 22rem to 24rem, with 1rem edge spacing.
- Drawer bottom should clear the recorder lane using a shared CSS variable, not independent magic numbers.
- Recorder bar bottom center, collapsed width about 34rem, review width about 42rem.
- Pointer movement anywhere in the viewport reveals controls.
- Hidden overlay state should leave only stream and critical indicators visible.

Large desktop 1440px+:

- Do not stretch control surfaces wider just because space exists.
- Keep drawer max width near 24rem.
- Keep recorder max width near 42rem.
- Keep setup composition centered with a max content width.
- Stream can use full viewport; if object-cover crops, preserve center framing and avoid stretching.

Overlap prevention:

- Shared layout variables define top, drawer, and recorder lanes.
- Drawer/sheet and recorder/review must know about each other's open state.
- Expanded review has priority over non-error drawer on mobile.
- Drawer internal actions are sticky only within the drawer and must not sit behind the recorder.
- Tests should check bounding boxes for panel/dock separation at 320, 390, 768, 1024, and 1440 widths.

## 7. Accessibility Requirements

- All controls remain keyboard reachable.
- Focus entering an overlay reveals it and cancels hide timers.
- Focused overlays never auto-hide.
- Visible focus rings use sufficient contrast, preferably cyan with 2px outline and 2px offset.
- Icon-only controls require `aria-label`; buttons with visible text do not need duplicate labels.
- Touch targets are at least 44px by 44px.
- Status updates use `role="status"` or `aria-live="polite"`; critical errors use `role="alert"`.
- Discard confirmation moves focus to the confirmation text or first action and returns focus to Discard/Keep after cancellation.
- Expanded review sheet has a labelled region and preserves video control accessibility.
- Hidden overlays must not create invisible focus traps. If implementation uses `inert`, provide an explicit keyboard-reveal path. If implementation keeps controls focusable while visually hidden, keydown/focus must reveal before interaction and tests must cover it.
- `prefers-reduced-motion` removes transform-heavy transitions and animated pulse dependencies.
- Color is never the only indicator for selected, error, ready, or recording states.
- File upload uses a real file input associated with a visible label. A custom upload button may trigger it, but the input must remain accessible.

## 8. Implementation Phases

### Phase 1: Derive UI State Without Visual Rewrite

Goal: add a small derived UI state helper or hook so future components can branch on session/setup/live/recording/review/error without duplicating conditionals.

Files likely affected:

- `src/App.tsx`
- optional new `src/lib/studioUiState.ts` or `src/hooks/useStudioUiState.ts`
- new colocated tests if helper is extracted

Risk level: low.

Test plan:

- `npm run typecheck`
- `npm run test:unit -- --run src/tests/App.test.tsx src/hooks/useAutoHideOverlay.test.tsx` if the runner supports file filters; otherwise `npm run test:unit`.
- Verify no snapshot or behavior changes.

Rollback strategy: remove the helper/hook and inline usage; existing hooks remain untouched.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 1 from docs/ui-ux-stream-first-redesign-plan.md only. Add a derived studio UI state helper/hook for session/setup/live/recording/review/error branching without changing visible UI or Decart/camera/recording behavior. Keep components presentational, preserve all existing tests, and run the closest checks.
```

### Phase 2: Build Setup Panels For Camera Off

Goal: replace the heavy idle control panel with `SessionSetupPanel`, large `SessionModeSelector` cards, and a lightweight Pre-Camera Check state before starting.

Files likely affected:

- `src/App.tsx`
- `src/components/ControlPanel/SessionModeSelector.tsx`
- new `src/components/StudioShell/SessionSetupPanel.tsx` or local equivalent
- `src/constants/sessionModes.ts` only if existing copy is insufficient
- local stories/tests

Risk level: medium because it changes idle/setup user flow.

Test plan:

- Component tests for selector cards and pre-camera check.
- App tests for default Local selection and no Decart/token calls before Start.
- Storybook stories for Session Selector and Pre-Camera Check at mobile and desktop.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`

Rollback strategy: keep old `ControlPanel` path behind a simple branch until the new setup panel passes tests; revert setup panel import/branch if needed.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 2 from docs/ui-ux-stream-first-redesign-plan.md only. Create the camera-off Session Selector and Pre-Camera Check UI using existing session mode constants. Do not call camera, Decart, WebRTC, or token APIs from the pre-check step. Preserve existing start/apply/recording behavior and update local tests/stories for the new setup states.
```

### Phase 3: Introduce StreamViewport And Shared StatusPill

Goal: evolve `VideoStage` into a stream-first viewport with a reusable status pill and clearer idle/live layers.

Files likely affected:

- `src/components/VideoStage/VideoStage.tsx`
- `src/components/VideoStage/VideoPlaceholder.tsx`
- `src/components/VideoStage/StatusBadge.tsx` or new `StatusPill.tsx`
- `src/App.tsx`
- VideoStage stories/tests

Risk level: medium because video fit and status visibility affect the main surface.

Test plan:

- Component stories for idle, local live, model generating, reconnecting, and error.
- App tests that still find status and video stream attachment.
- Manual visual checks at 320, 768, 1024, 1440.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`

Rollback strategy: keep `VideoStage` API compatible so implementation can revert to current markup if stream fit or status layering regresses.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 3 from docs/ui-ux-stream-first-redesign-plan.md only. Refactor the video stage into a stream-first viewport with a shared StatusPill while preserving stream attachment behavior and current app state props. Do not alter camera, Decart, recording, or API behavior. Add/update VideoStage stories and focused tests.
```

### Phase 4: LiveControlsOverlay And ControlDrawer

Goal: replace the active-session heavy panel with an auto-hiding live drawer/sheet while keeping setup off-state separate.

Files likely affected:

- `src/components/ControlPanel/AutoHidingControlPanel.tsx`
- `src/components/ControlPanel/ControlPanel.tsx`
- new `LiveControlsOverlay.tsx`
- new `ControlDrawer.tsx`
- `src/hooks/useAutoHideOverlay.ts` only if shared multi-overlay coordination is needed
- ControlPanel tests/stories

Risk level: high because this touches active-session control availability, auto-hide, focus, and responsive layout.

Test plan:

- Unit/component tests for reveal on mouse/tap/keydown/focus.
- Tests that controls stay visible during hover/focus/input/upload/error/confirmation.
- Tests that local live drawer excludes model controls.
- Tests that model live drawer includes prompt/upload/apply.
- Storybook stories for hidden live controls, visible local drawer, visible Lucy drawer, visible VTON drawer, mobile sheet.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`
- Manual keyboard pass.

Rollback strategy: retain existing `AutoHidingControlPanel` and switch App back to it if drawer behavior regresses.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 4 from docs/ui-ux-stream-first-redesign-plan.md only. Add LiveControlsOverlay and ControlDrawer for active sessions, using the existing auto-hide contract and preserving all callbacks/state. Controls must reveal on mouse/tap/keyboard/focus and stay visible during interaction, input, upload, confirmation, and errors. Do not change Decart/camera/recording behavior.
```

### Phase 5: Responsive Prompt And File Upload Controls

Goal: redesign prompt and image upload controls so Lucy/VTON inputs never overlap, clip, or hide behind the recorder.

Files likely affected:

- `src/components/ControlPanel/PromptInput.tsx`
- `src/components/ControlPanel/PromptControlsSection.tsx`
- `src/components/ControlPanel/ImageUpload.tsx`
- `src/components/ControlPanel/ReferenceImageSection.tsx`
- optional new `FileUploadControl.tsx` and `PromptControl.tsx`
- local tests/stories

Risk level: medium because file input behavior and clear/reset behavior are easy to regress.

Test plan:

- Existing `ImageUpload.test.tsx`.
- Add tests for long filename, unsupported file, clear action, and parent reset.
- Stories for Lucy reference, VTON garment, long filename, mobile stacked upload.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`

Rollback strategy: keep the old `ImageUpload` implementation available until the new component passes upload/reset tests.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 5 from docs/ui-ux-stream-first-redesign-plan.md only. Redesign prompt and image upload controls to stack cleanly on mobile and prevent clipping/overlap, while preserving file validation, clear behavior, object URL preview, and model-specific copy. Update local tests and stories.
```

### Phase 6: RecorderBar And RecordingReviewSheet

Goal: separate the compact recorder transport from expanded review, with mobile bottom-sheet behavior and requested review/discard copy.

Files likely affected:

- `src/components/RecordingDock/FloatingRecordingDock.tsx`
- `src/components/RecordingDock/RecordingDockButton.tsx`
- `src/components/RecordingDock/RecordingPlaybackPanel.tsx`
- new `RecorderBar.tsx`
- new `RecordingReviewSheet.tsx`
- RecordingDock tests/stories

Risk level: high because recording controls must preserve object URL, download, discard, and model-release behavior.

Test plan:

- Existing FloatingRecordingDock tests.
- Add tests for Keep, Record Again, requested discard copy, mobile bottom-sheet classes, and no deletion on Keep.
- App tests for model recording release, local recording replacement, and object URL revocation.
- E2E recording flows.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:storybook`

Rollback strategy: keep `FloatingRecordingDock` public props stable and revert internal extraction if recording behavior regresses.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 6 from docs/ui-ux-stream-first-redesign-plan.md only. Refactor the recording dock into a compact RecorderBar plus RecordingReviewSheet. Preserve MediaRecorder hook behavior, object URL cleanup, download, discard, model-session release, and local preview continuity. Use the requested review actions and discard copy. Update tests/stories/e2e as needed.
```

### Phase 7: Error Banner And Recovery Actions

Goal: create one consistent error surface with actionable recovery CTAs for camera, token, model, recording, and upload failures.

Files likely affected:

- `src/components/ControlPanel/ErrorBanner.tsx`
- `src/components/ControlPanel/StatusMessage.tsx`
- new or updated `ErrorBanner` usage in setup panel, drawer, and recorder/review
- `src/lib/errors.ts` only if message categorization is needed without changing API behavior
- App tests and stories

Risk level: medium.

Test plan:

- Component tests for CTA rendering by error type.
- App tests for camera denied, token failure, connection failure, upload validation, recording failure.
- E2E existing error tests must still pass.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`

Rollback strategy: keep current `StatusMessage` error path until the new banner covers all states.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 7 from docs/ui-ux-stream-first-redesign-plan.md only. Consolidate error display into a reusable ErrorBanner with recovery actions for camera permission, Decart token, connection, recording, and upload validation errors. Do not expose secrets or alter API behavior. Preserve existing error tests and add focused coverage for recovery CTAs.
```

### Phase 8: Responsive QA And Visual Coverage Hardening

Goal: add stories, tests, and manual checks that specifically guard against overlap, clipping, hidden controls, and inaccessible overlays.

Files likely affected:

- `src/stories/App.stories.tsx`
- local component stories under `src/components/**/stories/`
- `src/components/**/tests/`
- `tests/e2e/app.spec.ts`
- `tests/a11y/storybook-a11y.spec.ts` only if story discovery filters need updates

Risk level: low to medium.

Test plan:

- Storybook stories for every major screen/state in this plan.
- Playwright viewport checks at 320, 390, 768, 1024, and 1440.
- Bounding-box checks for drawer vs recorder/review separation.
- Keyboard focus tests for auto-hide overlays.
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:storybook`
- `npm run test:a11y`
- `npm run test:e2e`
- `npm run build`

Rollback strategy: tests/stories can be adjusted without changing runtime. If a visual assertion is too brittle, replace exact class checks with semantic or bounding-box checks.

Prompt to paste:

```text
Use $frontend-design. Implement Phase 8 from docs/ui-ux-stream-first-redesign-plan.md only. Add Storybook, unit/component, a11y, and Playwright coverage for the stream-first states and responsive overlap rules. Do not change runtime behavior except for minor testability attributes if necessary. Prefer semantic and bounding-box assertions over brittle class snapshots.
```

## 9. Testing Strategy

Unit and component tests:

- `SessionModeSelector`: card selection, disabled/running state, `aria-pressed`, keyboard activation.
- `SessionSetupPanel`: Session Selector vs Pre-Camera Check, selected mode copy, primary CTA labels, back/reset behavior.
- `LiveControlsOverlay`: reveal on mouse, touch, keydown, and focus; hide after inactivity; stay visible during pointer/focus/input/upload/error/confirmation.
- `ControlDrawer`: local live excludes model controls; Lucy includes transformation prompt/reference upload; VTON includes garment prompt/image upload; Apply disabled/enabled behavior remains correct.
- `FileUploadControl`: supported types, unsupported type error, long filename, Clear, parent reset, mobile stacked rendering.
- `RecorderBar`: ready, waiting, recording, stopping, error, saved collapsed states.
- `RecordingReviewSheet`: Download, Keep, Discard, Record Again, collapse/expand, inline discard confirmation, object URL is not revoked until confirmed discard or replacement.
- `ErrorBanner`: camera, token, model connection, recording, upload validation recovery actions.

Integration/App tests:

- Default view is Session Selector with Local Camera selected.
- Continue opens Pre-Camera Check without calling camera, token, Decart, or WebRTC.
- Start Local Camera calls mocked webcam/microphone only and transitions to Live Local.
- Selecting Lucy/VTON and editing prompt/uploading image does not call token/Decart before Start.
- Start Lucy/VTON preserves current payload behavior.
- Apply still sends full prompt/image/enhance payload and clears stale image with `image: null`.
- Stop session still stops tracks and disconnects model sessions when present.
- Stop recording in model mode still finalizes clip before releasing model/API usage.
- Review survives model release and stopped-session states.
- Discard does not reconnect Decart or stop live local preview.

E2E tests:

- Keep existing local and model network guard tests.
- Add viewport overlap checks for live local, live Lucy, live VTON, recording active, review expanded, and discard confirmation.
- Add mobile 320/390 tests that verify upload controls, drawer/sheet, and recorder/review controls are visible and not clipped.
- Add keyboard-flow test: Tab reveals controls, focus stays visible, Escape closes optional drawer/sheet without stopping a session.
- Add reduced-motion smoke if practical by emulating media features and checking controls remain usable.

Storybook:

- App-level stories for Session Selector, Pre-Camera Check, Live Local, Live Lucy, Live VTON, Recording Active, Recording Review live, Recording Review stopped, Discard Confirmation, Error State.
- Component stories for drawer visible/hidden, file upload long filename, mobile upload stack, recorder ready/recording/saved/error, review sheet mobile/desktop.
- Stories must continue using mocked media, recorder, object URLs, and Decart. No live camera, WebRTC, token, or external network calls.

Manual QA:

- Chrome desktop at 1024 and 1440 widths.
- Chrome or Safari mobile simulation at 320 and 390 widths.
- Real browser local camera permission flow.
- Local recording start/stop/play/download/discard.
- Lucy and VTON mocked/default flows without token calls before Start.
- Live model recording release back to local preview.
- Upload long filename and unsupported file validation.
- Keyboard-only reveal, use, and hide cycle.
- Reduced motion enabled.
- Check that no overlay hides while typing prompt, selecting/uploading file, confirming discard, reviewing clip, or reading an error.

## Guardrails

- Do not remove working Decart, Lucy, VTON, camera, or recorder functionality.
- Do not change `/api/realtime-token` behavior for UI-only work.
- Do not introduce `VITE_DECART_API_KEY`.
- Do not call live Decart, camera, WebRTC, or external services in tests/stories.
- Do not persist uploaded images or recorded clips.
- Do not hardcode layout values that only work for one viewport.
- Prefer existing constants and hooks over new state ownership.
- Keep each phase small enough to revert independently.
