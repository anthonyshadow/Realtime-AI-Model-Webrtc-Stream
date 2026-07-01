# Screen Redesign Reference
> Last updated: 2026-06-30

Use this as the remembered product reference for upcoming UI implementation prompts. It captures the requested screen breakdown and the attached visual direction.

Reference image: [ai-video-studio-redesigned-experience-2026-06-30.png](assets/ai-video-studio-redesigned-experience-2026-06-30.png)

## Visual Direction

- Full dark app background with the video experience as the primary surface.
- Clean, intuitive, modern studio feel for everyday users.
- One primary action at a time.
- Clear hierarchy and visual flow.
- Spacious layouts with consistent padding.
- Status is always visible when it matters.
- Mobile-first and fully responsive.
- No overlaps, clutter, or confusing repeated text.
- Primary accent: cyan/blue action color.
- Success: green.
- Danger: red.
- Surfaces and borders stay dark, restrained, and transparent enough to keep the stream dominant.

## Screen 1: Session Selector / Camera Off

Purpose: user chooses how they want to start.

Layout:

- Full dark app background.
- Main preview area centered.
- Setup card left or centered depending on screen width.
- No live camera stream yet.
- Status pill at top-left: Idle, Connected, or Error.

Content:

- Title: Choose a session.
- One short helper text only.
- Three large selectable cards: Local Camera, Lucy 2.1, and Lucy VTON 3.
- Primary CTA: Continue or Start Camera.
- Secondary action: Reset.

Important fix: remove excessive repeated text such as "Pick local preview or a Decart model before starting" when it appears multiple times. One short instruction is enough.

## Screen 2: Pre-Camera Check

Purpose: user confirms camera and microphone readiness before entering the stream.

Layout:

- Compact setup panel.
- Clear checklist style.
- No large permanent control panel yet.

Content:

- Selected mode.
- Camera source.
- Microphone source.
- Permission status.
- Primary CTA based on selected mode: Start Camera, Start Lucy Session, or Start VTON Session.

Important fix: this should feel like a setup step, not a technical dashboard.

## Screen 3: Live Stream / Camera On

Purpose: the stream becomes the product. Controls should not dominate.

Critical behavior:

- When the camera is on, the screen is almost entirely the active stream.
- The current stream fills the available viewport.
- The left control panel does not remain permanently visible.
- Controls appear only on mouse movement, mobile tap, keyboard focus, error, or confirmation state.
- Controls auto-hide after inactivity.
- Controls do not hide while the user is hovering, focusing, typing, uploading, confirming, or reviewing a recording.

Visible on interaction:

- Small top status pill.
- Left slide-out model/session control panel.
- Bottom centered recorder panel.
- Optional small stream status overlay.

Hidden state:

- Only the active stream remains visible.
- No large card blocks the stream.

## Screen 4: Live Local Camera

Purpose: user sees local camera feed and can optionally record.

Visible controls on mouse movement or tap:

- Left panel: Mode, Session status, Stop session, Reset.
- Bottom recorder bar: Status Ready, Time 00:00, Record CTA.

Important fix: replace the oversized active-stream control panel with an auto-hiding overlay system.

## Screen 5: Live Lucy 2.1

Purpose: user sees transformed stream and can adjust prompt/reference only when controls are visible.

Visible controls on interaction:

- Left drawer: Lucy 2.1 status, prompt field, reference image upload, Apply, Reset, Stop session.
- Bottom recorder bar: Record or Stop recording.

Important fix: uploaded image inputs must stack cleanly on smaller screens and never overlap, clip, or become partially hidden.

## Screen 6: Live VTON 3

Purpose: user sees virtual try-on stream and can update garment prompt/image.

Visible controls on interaction:

- Left drawer: VTON status, garment prompt, garment image upload, Apply, Reset, Stop session.
- Bottom recorder bar.

Important fix: follow the same responsive rules as Lucy. No overlap, clipped file input, or controls hidden behind the recorder.

## Screen 7: Recording Active

Purpose: user knows recording is happening without blocking the stream.

Behavior:

- Stream remains dominant.
- Bottom recorder panel appears on interaction.
- Recorder panel may show Recording, recording time, and Stop Recording.
- A tiny recording status indicator may remain visible.

Important fix: recording controls should be obvious when shown, but should not permanently cover the stream.

## Screen 8: Recording Review

Purpose: user reviews the captured clip.

Behavior:

- If the live camera/model session is still running, show review as a collapsible bottom sheet or centered modal only when opened.
- If the session has stopped, show the review panel centered.
- Actions: Download, Keep, Discard, Record Again.

Important fix: on mobile, the review panel should become a clean full-width bottom sheet with proper spacing and no clipping.

## Screen 9: Discard Confirmation

Purpose: prevent accidental deletion.

Layout:

- Small confirmation state inside the review panel.
- Copy: "Discard this clip? This cannot be undone."
- Actions: Keep and Discard Clip.

Important fix: do not create a full-screen interruption unless necessary.

## Screen 10: Error State

Purpose: errors are visible and actionable.

Error types:

- Camera permission denied.
- Decart API token error.
- Network/model connection failure.
- Recording failure.
- Upload validation error.

Layout:

- Error banner or card inside the active panel.
- Short message.
- Clear recovery CTA: Try Again, Check Permissions, Back to Local Camera, or Reset Session.

Important fix: errors should not leave the user stranded on a blank screen.

## Responsive Behavior

- Mobile 320px and up: stacked layout, large touch targets, sticky/safe-area-aware bottom bar.
- Tablet 768px and up: side panel plus preview, with more space for controls.
- Desktop 1024px and up: comfortable side panel width and centered preview.
- Large 1440px and up: max content width, centered composition, and no stretching.
