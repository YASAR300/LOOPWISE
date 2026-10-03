import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  RoleCardGroup,
  PasswordInput,
  PasswordStrengthMeter,
  evaluatePassword,
  FormAlert,
  EmailPill,
} from "../index";

describe("Auth UI Components", () => {
  describe("RoleCardGroup", () => {
    it("renders both roles and handles arrow key selection", () => {
      const handleChange = vi.fn();
      render(<RoleCardGroup value="CLIENT" onChange={handleChange} />);

      const clientCard = screen.getByRole("radio", { name: /i want to hire/i });
      const strategistCard = screen.getByRole("radio", {
        name: /i'm a strategist/i,
      });

      expect(clientCard).toHaveAttribute("aria-checked", "true");
      expect(strategistCard).toHaveAttribute("aria-checked", "false");

      // Press ArrowRight to move to strategist
      fireEvent.keyDown(clientCard, { key: "ArrowRight" });
      expect(handleChange).toHaveBeenCalledWith("STRATEGIST");
    });
  });

  describe("PasswordInput", () => {
    it("toggles password visibility when eye button is clicked", () => {
      render(
        <PasswordInput id="test-pwd" value="Secret123!" onChange={() => {}} />
      );

      const input = screen.getByPlaceholderText("••••••••");
      expect(input).toHaveAttribute("type", "password");

      const toggleBtn = screen.getByRole("button", { name: /show password/i });
      fireEvent.click(toggleBtn);

      expect(input).toHaveAttribute("type", "text");
    });

    it("displays error message when provided", () => {
      render(
        <PasswordInput
          id="test-pwd"
          value=""
          onChange={() => {}}
          error="Password must be at least 8 characters"
        />
      );

      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  describe("evaluatePassword & PasswordStrengthMeter", () => {
    it("correctly evaluates password complexity score and rules", () => {
      const weak = evaluatePassword("short");
      expect(weak.score).toBe(1); // lowercase only
      expect(weak.label).toBe("Weak");

      const strong = evaluatePassword("Enterprise@2026!");
      expect(strong.score).toBe(4);
      expect(strong.label).toBe("Strong");
      expect(strong.isStrong).toBe(true);
    });

    it("renders rule checklist in DOM", () => {
      render(<PasswordStrengthMeter password="Ab1" showRules={true} />);
      expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
      expect(screen.getByText("Uppercase letter")).toBeInTheDocument();
      expect(screen.getByText("Lowercase letter")).toBeInTheDocument();
      expect(screen.getByText("Number or symbol")).toBeInTheDocument();
    });
  });

  describe("FormAlert", () => {
    it("renders alert message and dismisses on Escape key", () => {
      const handleDismiss = vi.fn();
      render(
        <FormAlert
          type="error"
          message="Invalid credentials"
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();

      // Press Escape key on window
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("EmailPill", () => {
    it("renders email in monospace pill and triggers onEdit", () => {
      const handleEdit = vi.fn();
      render(<EmailPill email="alex@company.com" onEdit={handleEdit} />);

      expect(screen.getByText("alex@company.com")).toBeInTheDocument();

      const editBtn = screen.getByRole("button", {
        name: /edit email address/i,
      });
      fireEvent.click(editBtn);
      expect(handleEdit).toHaveBeenCalledTimes(1);
    });
  });
});
