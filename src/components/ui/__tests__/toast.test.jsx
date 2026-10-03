import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "../toast";

function TestToastComponent({ onUndoMock }) {
  const { toast } = useToast();
  return (
    <div>
      <button
        onClick={() =>
          toast({
            title: "Test Toast Title",
            description: "Test Toast Description",
            onUndo: onUndoMock,
          })
        }
      >
        Trigger Toast
      </button>
    </div>
  );
}

describe("Toast system", () => {
  it("renders toast when invoked and executes undo callback", async () => {
    const handleUndo = vi.fn();
    render(
      <ToastProvider>
        <TestToastComponent onUndoMock={handleUndo} />
      </ToastProvider>
    );

    const trigger = screen.getByRole("button", { name: /trigger toast/i });
    fireEvent.click(trigger);

    expect(await screen.findByText("Test Toast Title")).toBeInTheDocument();
    expect(screen.getByText("Test Toast Description")).toBeInTheDocument();

    const undoBtn = screen.getByRole("button", { name: /undo/i });
    fireEvent.click(undoBtn);
    expect(handleUndo).toHaveBeenCalledTimes(1);
  });
});
