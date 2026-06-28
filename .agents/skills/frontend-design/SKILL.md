---
name: frontend-design
description: Use when designing, redesigning, or polishing frontend UI, UX, layout, typography, spacing, motion, visual hierarchy, empty states, error states, or component aesthetics. Helps avoid generic AI-looking interfaces by producing subject-specific, intentional design direction before implementation.
---

# Frontend Design
> Last updated: 2026-06-28

Act like a senior product designer and frontend design lead, not only a code generator. Make product-specific UI decisions that fit this Decart realtime webcam studio, its users, and the exact screen or component being changed.

## Start With Context

- Read the project guidance first: `AGENTS.md`, `docs/00-start-here.md`, `docs/08-ui-and-ux.md`, and any task-specific docs from `docs/agents/agent-read-order.md`.
- Inspect the relevant source, local stories, tests, and existing Tailwind utility patterns before proposing or editing UI.
- Use the existing architecture, components, tokens, styling approach, accessibility conventions, mocked Storybook/test setup, and npm scripts unless there is a strong local reason to extend them.
- Keep the app's product shape in mind: fullscreen video is primary; controls are compact, presentational, accessible, and state-aware.

## Design Plan Before Code

Before coding UI changes, create a compact design plan that covers:

- Subject and audience: who is using this surface and what they are trying to do.
- Page or component job: the single job this UI must accomplish in this context.
- Visual thesis: the intentional direction, stated plainly.
- Color tokens: named existing or proposed color roles, with hex values only when introducing or clarifying tokens.
- Typography roles: display, body, label, caption, data, or control roles as relevant.
- Spacing and layout system: grid, density, rhythm, responsive behavior, and scrolling constraints.
- Signature design element: one memorable product-specific detail that earns its place.
- Motion and interaction approach: hover, focus, transition, loading, reveal, and reduced-motion behavior.

Critique the plan before implementation. Revise anything that feels templated, decorative, or interchangeable with another product. Avoid generic AI defaults unless the brief clearly justifies them, including unearned gradient hero sections, stats-first dashboards, decorative blobs, warm serif-and-terracotta layouts, neon-on-black drama, or broadsheet styling.

## Design Principles

- Ground every design decision in the actual product, audience, user goal, and screen context.
- Prefer disciplined, product-specific choices over decoration. Spend boldness in one place and keep the rest precise.
- Treat structure as information: labels, dividers, groups, sequence markers, and status treatments must explain the workflow.
- Preserve responsive behavior: controls must fit mobile and desktop viewports, avoid incoherent overlap, and keep critical actions reachable.
- Respect keyboard focus, contrast, disabled states, loading states, empty states, error states, and `prefers-reduced-motion`.
- Make motion useful: emphasize state changes, feedback, and orientation instead of scattering effects.
- Do not let aesthetic changes weaken runtime boundaries, model rules, upload handling, or Decart security rules.

## Interface Copy

- Write from the user's side of the screen in plain, active language.
- Name things by what users recognize and control, not by implementation details.
- Keep action labels consistent across buttons, dialogs, toasts, errors, and resulting states.
- Use sentence case by default.
- Make errors specific: explain what happened and how to recover without vague apologies.
- Make empty states useful: show the next available action, not mood-setting filler.

## Implementation And Validation

- Implement using the existing React, TypeScript, Vite, Tailwind, Storybook, and test conventions.
- Keep component behavior unchanged unless the user asks for behavior changes.
- Update local stories for important visual states and component tests for behavior changes.
- Take screenshots or run visual checks when the environment supports it, especially for layout, responsive, focus, loading, empty, and error states.
- Run the closest relevant npm checks after changes, such as `npm run typecheck`, `npm run test:unit`, `npm run test:storybook`, `npm run test:a11y`, `npm run test:e2e`, or `npm run build`.
- Do not make live Decart, camera, WebRTC, or external network calls in tests or stories unless an explicitly gated live-smoke workflow exists.
