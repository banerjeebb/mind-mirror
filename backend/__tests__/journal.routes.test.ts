import request from "supertest";
import app from "../src/app";

// Mock prisma
jest.mock("../src/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    journal: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    insight: { create: jest.fn(), update: jest.fn() },
  },
}));

// Mock gemini service
jest.mock("../src/services/gemini.service", () => ({
  analyzeJournalEntry: jest.fn().mockResolvedValue({
    emotionTags: ["Calm"],
    triggerWords: ["study"],
    sentimentScore: 0.5,
    emotionVector: { x: 0.3, y: 0.4 },
    hiddenPattern: "Pattern detected",
    copingRitual: "Take a walk",
    ritualType: "MOVEMENT",
  }),
  GeminiApiError: class extends Error {
    constructor(public statusCode: number, public userMessage: string) {
      super(userMessage);
    }
  },
  AVAILABLE_MODELS: [{ id: "gemini-flash-latest", label: "Test" }],
}));

// Mock auth middleware
jest.mock("../src/middleware/auth.middleware", () => ({
  authenticate: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.userId = "mock-user-id";
    next();
  },
}));

describe("Journal Routes", () => {
  describe("GET /api/journal/models", () => {
    it("should return available models without auth", async () => {
      const res = await request(app).get("/api/journal/models");
      expect(res.status).toBe(200);
      expect(res.body.models).toBeDefined();
      expect(Array.isArray(res.body.models)).toBe(true);
    });
  });

  describe("POST /api/journal", () => {
    it("should reject invalid body (missing entryText)", async () => {
      const res = await request(app)
        .post("/api/journal")
        .send({ mood: 3, energyLevel: 3 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should reject entry text that is too short", async () => {
      const res = await request(app)
        .post("/api/journal")
        .send({ entryText: "short", mood: 3, energyLevel: 3 });
      expect(res.status).toBe(400);
    });

    it("should reject invalid mood values", async () => {
      const res = await request(app)
        .post("/api/journal")
        .send({ entryText: "A valid long enough journal entry for testing", mood: 0, energyLevel: 3 });
      expect(res.status).toBe(400);
    });

    it("should reject invalid energyLevel values", async () => {
      const res = await request(app)
        .post("/api/journal")
        .send({ entryText: "A valid long enough journal entry for testing", mood: 3, energyLevel: 6 });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/journal", () => {
    it("should return journals for authenticated user", async () => {
      const prisma = require("../src/lib/prisma").default;
      prisma.journal.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get("/api/journal");
      expect(res.status).toBe(200);
      expect(res.body.journals).toBeDefined();
    });
  });

  describe("GET /api/journal/:id", () => {
    it("should return 404 for non-existent journal", async () => {
      const prisma = require("../src/lib/prisma").default;
      prisma.journal.findFirst.mockResolvedValueOnce(null);

      const res = await request(app).get("/api/journal/nonexistent-id");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/journal/:id/ritual-complete", () => {
    it("should return 404 if journal not found", async () => {
      const prisma = require("../src/lib/prisma").default;
      prisma.journal.findFirst.mockResolvedValueOnce(null);

      const res = await request(app).patch("/api/journal/nonexistent-id/ritual-complete");
      expect(res.status).toBe(404);
    });
  });
});
