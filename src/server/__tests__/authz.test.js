import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requireUser,
  requireRole,
  requireOrgMember,
  assertOwns,
  getOptionalUser,
} from "../authz";
import * as auth from "@/lib/auth";
import * as navigation from "next/navigation";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue({}),
}));

describe("authz helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireUser", () => {
    it("returns user if authenticated", async () => {
      const mockUser = { id: "user_1", email: "user@test.com", role: "CLIENT" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const result = await requireUser();
      expect(result).toEqual(mockUser);
    });

    it("redirects to /login if user is not authenticated", async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(null);

      await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
      expect(navigation.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("requireRole", () => {
    it("allows user with matching role", async () => {
      const mockUser = { id: "user_2", role: "STRATEGIST" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const result = await requireRole("STRATEGIST");
      expect(result).toEqual(mockUser);
    });

    it("allows user with any of the allowed roles", async () => {
      const mockUser = { id: "user_3", role: "ADMIN" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const result = await requireRole(["CLIENT", "ADMIN"]);
      expect(result).toEqual(mockUser);
    });

    it("redirects to /403 if role does not match", async () => {
      const mockUser = { id: "user_4", role: "CLIENT" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      await expect(requireRole("ADMIN")).rejects.toThrow("REDIRECT:/403");
      expect(navigation.redirect).toHaveBeenCalledWith("/403");
    });
  });

  describe("requireOrgMember", () => {
    it("returns membership when user has required rank", async () => {
      const mockUser = {
        id: "user_5",
        memberships: [{ organizationId: "org_1", role: "ADMIN" }],
      };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const result = await requireOrgMember("org_1", "MEMBER");
      expect(result.membership.role).toBe("ADMIN");
    });

    it("redirects to /403 when user is not a member of the organization", async () => {
      const mockUser = {
        id: "user_6",
        memberships: [{ organizationId: "org_other", role: "OWNER" }],
      };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      await expect(requireOrgMember("org_target", "MEMBER")).rejects.toThrow(
        "REDIRECT:/403"
      );
    });

    it("redirects to /403 when member rank is insufficient", async () => {
      const mockUser = {
        id: "user_7",
        memberships: [{ organizationId: "org_1", role: "MEMBER" }],
      };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      await expect(requireOrgMember("org_1", "ADMIN")).rejects.toThrow(
        "REDIRECT:/403"
      );
    });
  });

  describe("assertOwns", () => {
    it("passes when user owns resource via userId", async () => {
      const mockUser = { id: "user_owner" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const resource = { id: "res_1", userId: "user_owner" };
      const result = await assertOwns(resource);
      expect(result).toEqual(mockUser);
    });

    it("passes when user owns resource via ownerId", async () => {
      const mockUser = { id: "user_owner" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const resource = { id: "res_2", ownerId: "user_owner" };
      const result = await assertOwns(resource);
      expect(result).toEqual(mockUser);
    });

    it("redirects to /403 when user does not own resource", async () => {
      const mockUser = { id: "user_other" };
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce(mockUser);

      const resource = { id: "res_3", userId: "user_owner" };
      await expect(assertOwns(resource)).rejects.toThrow("REDIRECT:/403");
    });
  });

  describe("getOptionalUser", () => {
    it("returns null safely if error is thrown", async () => {
      vi.mocked(auth.getCurrentUser).mockRejectedValueOnce(
        new Error("DB error")
      );
      const result = await getOptionalUser();
      expect(result).toBeNull();
    });
  });
});
