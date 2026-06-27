import { analyzeJournalEntry, GeminiApiError, AVAILABLE_MODELS } from "../src/services/gemini.service";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("gemini.service", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    mockFetch.mockReset();
  });

  describe("AVAILABLE_MODELS", () => {
    it("should contain at least one model", () => {
      expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
    });

    it("should have id and label for each model", () => {
      for (const model of AVAILABLE_MODELS) {
        expect(model.id).toBeDefined();
        expect(model.label).toBeDefined();
      }
    });
  });

  describe("analyzeJournalEntry", () => {
    const validResponse = {
      emotionTags: ["Anxious", "Stressed"],
      triggerWords: ["exam", "deadline"],
      sentimentScore: -0.6,
      emotionVector: { x: -0.5, y: -0.3 },
      hiddenPattern: "Stress peaks before mock tests.",
      copingRitual: "Try 4-7-8 breathing for 2 minutes.",
      ritualType: "BREATHING",
    };

    it("should return parsed analysis on successful API call", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(validResponse) }] } }],
        }),
      });

      const result = await analyzeJournalEntry("I feel stressed about JEE", 2, 2, "JEE");
      expect(result.emotionTags).toEqual(["Anxious", "Stressed"]);
      expect(result.sentimentScore).toBe(-0.6);
      expect(result.ritualType).toBe("BREATHING");
    });

    it("should strip markdown fences from response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "```json\n" + JSON.stringify(validResponse) + "\n```" }] } }],
        }),
      });

      const result = await analyzeJournalEntry("Feeling okay", 3, 3, "NEET");
      expect(result.emotionTags).toBeDefined();
    });

    it("should throw GeminiApiError on invalid model", async () => {
      await expect(
        analyzeJournalEntry("test", 3, 3, "JEE", "invalid-model")
      ).rejects.toThrow(GeminiApiError);
    });

    it("should throw GeminiApiError with 429 on rate limit", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => "rate limited",
      });

      await expect(
        analyzeJournalEntry("test", 3, 3, "JEE")
      ).rejects.toMatchObject({ statusCode: 429 });
    });

    it("should throw GeminiApiError with 401 on auth failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "unauthorized",
      });

      await expect(
        analyzeJournalEntry("test", 3, 3, "JEE")
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should retry on 503 before throwing", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "unavailable" })
        .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "unavailable" })
        .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "unavailable" });

      await expect(
        analyzeJournalEntry("test", 3, 3, "JEE")
      ).rejects.toMatchObject({ statusCode: 503 });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should throw on unparseable response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "not valid json at all" }] } }],
        }),
      });

      await expect(
        analyzeJournalEntry("test", 3, 3, "JEE")
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
