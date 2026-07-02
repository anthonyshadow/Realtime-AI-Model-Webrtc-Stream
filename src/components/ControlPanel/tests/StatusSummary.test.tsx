import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusSummary } from "../StatusSummary";

function renderStatusSummary(
  overrides: Partial<Parameters<typeof StatusSummary>[0]> = {},
) {
  render(
    <StatusSummary
      activeSessionMode={null}
      hasPendingChanges={false}
      isApplying={false}
      selectedSessionMode="local"
      status="idle"
      {...overrides}
    />,
  );
}

describe("StatusSummary", () => {
  it("uses control-panel-specific session labels", () => {
    const { rerender } = render(
      <StatusSummary
        activeSessionMode="lucy-2.1"
        hasPendingChanges={false}
        isApplying={false}
        selectedSessionMode="lucy-2.1"
        status="connected"
      />,
    );

    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Synced")).toBeInTheDocument();

    rerender(
      <StatusSummary
        activeSessionMode={null}
        hasPendingChanges={false}
        isApplying={false}
        selectedSessionMode="local"
        status="disconnected"
      />,
    );

    expect(screen.getByText("Stopped")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("reports pending and sending change states", () => {
    const { rerender } = render(
      <StatusSummary
        activeSessionMode="lucy-vton-3"
        hasPendingChanges
        isApplying={false}
        selectedSessionMode="lucy-vton-3"
        status="generating"
      />,
    );

    expect(screen.getByText("Pending")).toBeInTheDocument();

    rerender(
      <StatusSummary
        activeSessionMode="lucy-vton-3"
        hasPendingChanges
        isApplying
        selectedSessionMode="lucy-vton-3"
        status="connected"
      />,
    );

    expect(screen.getByText("Sending")).toBeInTheDocument();
  });

  it("renders idle readiness", () => {
    renderStatusSummary();

    expect(screen.getByText("Idle")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
