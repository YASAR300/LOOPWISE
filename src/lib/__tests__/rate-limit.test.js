import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, rateLimitRequest } from "../rate-limit";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    rateLimitHit: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("rate-limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rateLimit", () => {
    it("allows request when hits are under limit", async () => {
      vi.mocked(db.rateLimitHit.count).mockResolvedValueOnce(2);
      vi.mocked(db.rateLimitHit.create).mockResolvedValueOnce({});

      const res = await rateLimit({
        key: "test:ip1",
        endpoint: "POST /api/test",
        limit: 5,
        windowMs: 60000,
      });

      expect(res.success).toBe(true);
      expect(res.remaining).toBe(2); // 5 - 2 - 1 = 2
      expect(db.rateLimitHit.create).toHaveBeenCalled();
    });

    it("rejects request when count reaches limit", async () => {
      vi.mocked(db.rateLimitHit.count).mockResolvedValueOnce(5);

      const res = await rateLimit({
        key: "test:ip2",
        endpoint: "POST /api/test",
        limit: 5,
        windowMs: 60000,
      });

      expect(res.success).toBe(false);
      expect(res.remaining).toBe(0);
      expect(db.rateLimitHit.create).not.toHaveBeenCalled();
    });
  });

  describe("rateLimitRequest", () => {
    it("returns 429 response when rate limit is exceeded", async () => {
      vi.mocked(db.rateLimitHit.count).mockResolvedValueOnce(10);

      const mockRequest = {
        headers: new Headers({ "x-forwarded-for": "192.168.1.1" }),
      };

      const result = await rateLimitRequest(mockRequest, {
        key: "test-req",
        endpoint: "POST /api/req",
        limit: 10,
        windowMs: 60000,
      });

      expect(result.success).toBe(false);
      expect(result.response.status).toBe(429);
      expect(result.response.headers.get("Retry-After")).toBeTruthy();
    });

    it("returns success: true when under limit", async () => {
      vi.mocked(db.rateLimitHit.count).mockResolvedValueOnce(0);
      vi.mocked(db.rateLimitHit.create).mockResolvedValueOnce({});

      const mockRequest = {
        headers: new Headers({ "x-forwarded-for": "192.168.1.2" }),
      };

      const result = await rateLimitRequest(mockRequest, {
        key: "test-req",
        endpoint: "POST /api/req",
        limit: 10,
        windowMs: 60000,
      });

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });
});
