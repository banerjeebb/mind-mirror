/** Available Gemini models for journal analysis. */
export const AVAILABLE_MODELS = [
  { id: "gemini-flash-latest", label: "Gemini Flash (Latest)" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

/** Structured response from Gemini journal analysis. */
interface GeminiAnalysis {
  emotionTags: string[];
  triggerWords: string[];
  sentimentScore: number;
  emotionVector: { x: number; y: number };
  hiddenPattern: string;
  copingRitual: string;
  ritualType:
    | "BREATHING"
    | "JOURNALING"
    | "MOVEMENT"
    | "REST"
    | "FOCUS_RESET"
    | "MOTIVATION";
}

/** Custom error for Gemini API failures with user-facing messages. */
export class GeminiApiError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string
  ) {
    super(userMessage);
  }
}

/**
 * Calls the Gemini REST API with automatic retry on 503 (high demand).
 * @param model - Gemini model ID (e.g. "gemini-flash-latest")
 * @param prompt - The full prompt string to send
 * @param retries - Number of retry attempts for 503 errors (default: 2)
 * @returns The generated text response
 * @throws {GeminiApiError} On auth failure, rate limiting, or persistent unavailability
 */
async function callWithRetry(
  model: string,
  prompt: string,
  retries = 2
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (res.ok) {
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    const errBody = await res.text();

    if (res.status === 429) {
      throw new GeminiApiError(429, "Rate limit reached. Please wait a moment and try again.");
    }

    if (res.status === 503 && attempt < retries) {
      const delay = (attempt + 1) * 2000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (res.status === 503) {
      throw new GeminiApiError(503, "Model is experiencing high demand. Please try a different model or try again later.");
    }

    if (res.status === 401) {
      throw new GeminiApiError(401, "Invalid API key. Please check your Gemini API key configuration.");
    }

    throw new GeminiApiError(res.status, `AI service error (${res.status}). Please try again.`);
  }

  throw new GeminiApiError(500, "Failed to get AI response after retries.");
}

/**
 * Analyzes a journal entry using Gemini AI to extract emotional patterns.
 * Sends the entry text, mood, energy level, and exam context to the model
 * and returns structured analysis including emotion tags, trigger words,
 * sentiment score, emotion vector, hidden pattern, and a coping ritual.
 *
 * @param entryText - The raw journal entry text from the student
 * @param mood - Student's self-reported mood (1-5 scale)
 * @param energyLevel - Student's self-reported energy (1-5 scale)
 * @param examType - The exam the student is preparing for (JEE, NEET, etc.)
 * @param model - Gemini model ID to use (defaults to "gemini-flash-latest")
 * @returns Structured analysis with emotions, patterns, and coping ritual
 * @throws {GeminiApiError} On invalid model, API failure, or unparseable response
 */
export async function analyzeJournalEntry(
  entryText: string,
  mood: number,
  energyLevel: number,
  examType: string,
  model = "gemini-flash-latest"
): Promise<GeminiAnalysis> {
  const validModel = AVAILABLE_MODELS.find((m) => m.id === model);
  if (!validModel) {
    throw new GeminiApiError(400, "Invalid model selected.");
  }

  const prompt = `You are a mental wellness AI for ${examType} exam students. Analyze this journal entry and return ONLY valid JSON with no markdown fences or extra text.

Journal entry: "${entryText}"
Mood (1-5): ${mood}
Energy level (1-5): ${energyLevel}

Return this exact JSON structure:
{
  "emotionTags": ["array of 2-4 emotion labels like Anxious, Hopeful, Burned Out, Calm, Overwhelmed, Motivated, Sad, Focused, Stressed, Defeated"],
  "triggerWords": ["array of 2-4 key trigger words/phrases from the entry"],
  "sentimentScore": <float from -1.0 (very negative) to 1.0 (very positive)>,
  "emotionVector": { "x": <float -1.0 to 1.0, negative=stressed positive=calm>, "y": <float -1.0 to 1.0, negative=low-energy positive=high-energy> },
  "hiddenPattern": "<one sentence describing an underlying emotional pattern the student may not notice>",
  "copingRitual": "<a specific, actionable 2-3 sentence coping exercise tailored to this student's current state>",
  "ritualType": "<one of: BREATHING, JOURNALING, MOVEMENT, REST, FOCUS_RESET, MOTIVATION>"
}

JSON only. No explanation.`;

  const text = await callWithRetry(model, prompt);
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed: GeminiAnalysis = JSON.parse(cleaned);
    return parsed;
  } catch {
    throw new GeminiApiError(500, "AI returned an unexpected response. Please try again.");
  }
}
