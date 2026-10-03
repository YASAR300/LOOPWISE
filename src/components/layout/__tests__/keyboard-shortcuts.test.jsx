import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { KeyboardShortcutProvider } from "../keyboard-shortcuts";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("KeyboardShortcutProvider", () => {
  it("opens shortcut help modal when '?' is pressed", async () => {
    render(
      <KeyboardShortcutProvider>
        <div>Content Area</div>
      </KeyboardShortcutProvider>
    );

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "?" });

    expect(await screen.findByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Navigation Chords")).toBeInTheDocument();
  });
});
