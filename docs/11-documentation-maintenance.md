# Documentation Maintenance
> Last updated: 2026-07-01

Use this when adding, moving, or updating docs, skills, stories, or tests.

## Date Standard

Every Markdown file must include this line directly below the H1:

```text
> Last updated: YYYY-MM-DD
```

Use the current local date. If a Markdown file is edited, update its date. Do not invent older dates.

Archived docs should use:

```text
# Title
> Last updated: YYYY-MM-DD
> Archived: YYYY-MM-DD
> Status: Historical. Canonical docs override this file.
```

## Where Docs Go

- Root: keep `README.md` and compact required agent shims only.
- `docs/00-start-here.md`: doc index and fastest orientation.
- `docs/01-*` through `docs/12-*`: canonical project docs.
- `docs/context/`: product requirements, decisions, and limitations.
- `docs/testing/`: testing details.
- `docs/storybook/`: Storybook details.
- `docs/agents/`: agent rules and read paths.
- `docs/skills/`: reusable task procedures.
- `docs/archive/`: historical material only.

## Reading Scope

- Prefer the smallest task-specific read path in [agents/agent-read-order.md](agents/agent-read-order.md).
- Keep broad context, archived docs, completed plans, visual references, and live-smoke docs out of default reads unless the task specifically needs them.
- Update routing docs when adding a document that should be read only for a narrow class of work.

## Source Scaffolding

- Component implementation files stay directly in their component folders.
- Component stories live in local `stories/` folders.
- Component tests live in local `tests/` folders.
- Shared mocks and setup stay in `src/test/`.
- Global Playwright specs stay in `tests/e2e/` or `tests/a11y/`.

## Validation

Before finishing documentation changes:

```bash
rg --files -g '*.md' -g '!node_modules' -g '!coverage' -g '!dist' -g '!storybook-static'
node --input-type=module <<'NODE'
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const files = execFileSync("rg", [
  "--files",
  "-g",
  "*.md",
  "-g",
  "!node_modules",
  "-g",
  "!coverage",
  "-g",
  "!dist",
  "-g",
  "!storybook-static",
], { encoding: "utf8" }).trim().split(/\n/).filter(Boolean);

const bad = files.filter((file) => {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  return !lines[0]?.startsWith("# ") ||
    !/^> Last updated: \d{4}-\d{2}-\d{2}$/.test(lines[1] ?? "");
});

if (bad.length) {
  console.error(bad.join("\n"));
  process.exit(1);
}

console.log(`checked ${files.length} markdown files`);
NODE
```

Also check internal links when paths move.
