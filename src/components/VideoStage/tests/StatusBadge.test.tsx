import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it("uses stage-specific connected and disconnected labels", () => {
    const { rerender } = render(<StatusBadge status="connected" />);

    expect(screen.getByText("Connected")).toBeInTheDocument();

    rerender(<StatusBadge status="disconnected" />);

    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("maps active and error states to distinct status pill tones", () => {
    const { rerender } = render(<StatusBadge status="generating" />);

    expect(screen.getByText("Generating").parentElement).toHaveClass(
      "border-emerald-300/50",
      "text-emerald-100",
    );

    rerender(<StatusBadge status="error" />);

    expect(screen.getByText("Error").parentElement).toHaveClass(
      "border-red-300/45",
      "text-red-50",
    );
  });
});
