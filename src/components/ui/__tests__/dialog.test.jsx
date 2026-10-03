import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../dialog";

describe("Dialog primitive", () => {
  it("renders trigger and displays dialog content when clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal Heading</DialogTitle>
            <DialogDescription>Modal Description Text</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByRole("button", { name: /open modal/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText("Modal Heading")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(await screen.findByText("Modal Heading")).toBeInTheDocument();
    expect(screen.getByText("Modal Description Text")).toBeInTheDocument();
  });
});
