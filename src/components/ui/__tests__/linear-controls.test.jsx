import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AgentCard } from "../agent-card";
import { FilterRow } from "../filter-row";
import { DataTable } from "../data-table";

describe("Linear-Level Controls & Behaviors", () => {
  describe("AgentCard toggle-to-pause", () => {
    it("renders agent information and toggles active state with callback", () => {
      const handleToggle = vi.fn();
      const mockAgent = {
        id: "test-agent-1",
        name: "Telemetry Pipeline Bot",
        description: "Autonomous worker syncing event queues.",
        tools: ["n8n", "slack"],
        status: "active",
        lastRun: "Today at 9am",
      };

      render(<AgentCard agent={mockAgent} onToggleStatus={handleToggle} />);

      expect(screen.getByText("Telemetry Pipeline Bot")).toBeInTheDocument();
      expect(
        screen.getByText("Autonomous worker syncing event queues.")
      ).toBeInTheDocument();

      const toggleButton = screen.getByRole("switch");
      expect(toggleButton).toHaveAttribute("aria-checked", "true");

      // Click to pause
      fireEvent.click(toggleButton);

      expect(handleToggle).toHaveBeenCalledWith("test-agent-1", false);
      expect(toggleButton).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("FilterRow saved views and keyboard focus", () => {
    it("renders saved view tabs and triggers view change callback", () => {
      const handleViewChange = vi.fn();
      const views = [
        { id: "all", label: "All items", count: 12 },
        { id: "needs-action", label: "Needs action", count: 3 },
      ];

      render(
        <FilterRow
          savedViews={views}
          activeView="all"
          onViewChange={handleViewChange}
        />
      );

      const needsActionTab = screen.getByText("Needs action");
      fireEvent.click(needsActionTab);

      expect(handleViewChange).toHaveBeenCalledWith("needs-action");
    });

    it("focuses search input when '/' key is pressed outside inputs", () => {
      render(<FilterRow placeholder="Search workflows..." />);
      const input = screen.getByPlaceholderText("Search workflows...");

      // Press "/" on window
      fireEvent.keyDown(window, { key: "/" });

      expect(document.activeElement).toBe(input);
    });
  });

  describe("DataTable keyboard row navigation", () => {
    const mockData = [
      {
        id: "d-1",
        name: "Invoice Parser",
        description: "Extract line items",
        date: "Today at 8am",
        tools: ["n8n"],
        status: "complete",
      },
      {
        id: "d-2",
        name: "Lead Qualifier",
        description: "Enrich demo leads",
        date: "Yesterday",
        tools: ["make"],
        status: "needs-action",
      },
    ];

    it("renders rows and handles selection with 'x' shortcut", () => {
      render(<DataTable data={mockData} />);

      expect(screen.getByText("Invoice Parser")).toBeInTheDocument();
      expect(screen.getByText("Lead Qualifier")).toBeInTheDocument();

      // Press 'j' to focus first row, then 'x' to select it
      fireEvent.keyDown(window, { key: "j" });
      fireEvent.keyDown(window, { key: "x" });

      const checkboxes = screen.getAllByRole("checkbox");
      // Checkbox 1 is select all, Checkbox 2 is row 1
      expect(checkboxes[1]).toBeChecked();
    });
  });
});
