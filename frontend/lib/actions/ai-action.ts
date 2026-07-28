"use server";

export type EventDescriptionContext = {
  title: string;
  category: string;
  keywords: string;
  eventType?: string;
  college?: string;
  date?: string;
  location?: string;
  capacity?: string;
  cashPrize?: string;
};

export type GenerateEventDescriptionResult = {
  success: boolean;
  description: string;
  source: "ai" | "demo" | "fallback";
  message: string;
};

// Alias models ("-latest") stay valid as Google retires numbered versions;
// older gemini-1.5/2.x IDs now 404 for keys created after their deprecation.
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

function formatEventDate(date?: string) {
  if (!date) return "Date to be announced";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
}

// The template has a ~40 word budget, so it can't spend 8 of them on a date.
function formatEventDateShort(date?: string) {
  if (!date) return "a date to be announced";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildPrompt(context: EventDescriptionContext) {
  return `You are a professional event organizer for a college.
Write a short, punchy event description: 2 to 3 sentences, 40 words maximum, one paragraph.

Event Title: ${context.title}
Category: ${context.category}
Event Type: ${context.eventType || "Not specified"}
Host College: ${context.college || "Not specified"}
Date & Time: ${formatEventDate(context.date)}
Location: ${context.location || "Not specified"}
Capacity: ${context.capacity || "Not specified"}
Prize / Rewards: ${context.cashPrize || "Not specified"}
Keywords / Extra Details: ${context.keywords}

Open with the hook, then work in only the one or two most compelling concrete details from above. Leave out anything that does not earn its words. No markdown, no headings, no bullet points, no line breaks. Energetic but professional. Never exceed 40 words.`;
}

function getMissingKeyMessage(apiKey?: string): string {
  if (!apiKey?.trim()) {
    return "Add GEMINI_API_KEY to frontend/.env.local, then restart the frontend dev server.";
  }
  return "GEMINI_API_KEY is still set to the example placeholder. Replace it with a real key from Google AI Studio, then restart npm run dev.";
}

function getDemoFallback(
  context: EventDescriptionContext,
  message?: string
): GenerateEventDescriptionResult {
  const genericTitle = context.title || "Our upcoming event";
  const venue = context.location || "campus";
  const when = formatEventDateShort(context.date);
  const highlight = context.keywords ? ` Expect ${context.keywords}.` : "";
  const prize = context.cashPrize ? ` ${context.cashPrize} on the line.` : "";
  const spots = context.capacity ? ` Only ${context.capacity} spots.` : "";

  return {
    success: true,
    source: "demo",
    message: message || "Using starter template.",
    // Kept to the same ~40 word budget as the AI prompt so descriptions stay
    // consistent whether or not Gemini was reachable.
    description: `${genericTitle} hits ${venue} on ${when}.${highlight}${prize}${spots} Grab your spot and bring your friends.`,
  };
}

function isConfiguredApiKey(key?: string): boolean {
  if (!key?.trim()) return false;
  const normalized = key.trim().toLowerCase();
  return ![
    "your_google_gemini_api_key",
    "your-gemini-api-key",
    "your_api_key",
    "your-api-key",
    "paste_your_key_here",
  ].some((placeholder) => normalized.includes(placeholder));
}

async function generateWithGemini(apiKey: string, prompt: string) {
  let lastError = "All Gemini models failed";

  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
          cache: "no-store",
        }
      );

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string; thought?: boolean }> };
        }>;
        error?: { message?: string };
      };

      if (!response.ok) {
        lastError = data.error?.message || `Model ${modelName} failed (${response.status})`;
        continue;
      }

      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .filter((part) => !part.thought && part.text)
        .map((part) => part.text)
        .join("")
        .trim();
      if (text) {
        return { text, modelName };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  throw new Error(lastError);
}

function getApiFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("api key not valid") || message.includes("invalid api key")) {
    return "Invalid GEMINI_API_KEY — check frontend/.env.local and restart npm run dev.";
  }

  if (message.includes("quota") || message.includes("rate limit") || message.includes("resource exhausted")) {
    return "Gemini quota exceeded — wait 1 minute and try again. Starter template inserted for now.";
  }

  if (message.includes("no longer available") || message.includes("not found")) {
    return "Gemini rejected every model ID this app tries — the list in lib/actions/ai-action.ts needs updating. Starter template inserted.";
  }

  const detail = error instanceof Error && error.message ? ` (${error.message})` : "";
  return `AI unavailable right now — starter template inserted. You can edit and publish.${detail}`;
}

export async function generateEventDescription(
  context: EventDescriptionContext
): Promise<GenerateEventDescriptionResult> {
  if (!context.title.trim() || !context.keywords.trim()) {
    return {
      success: false,
      description: "",
      source: "demo",
      message: "Event title and keywords are required before generating a description.",
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!isConfiguredApiKey(apiKey)) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return getDemoFallback(context, getMissingKeyMessage(apiKey));
    }

    const { text, modelName } = await generateWithGemini(apiKey!, buildPrompt(context));

    return {
      success: true,
      description: text,
      source: "ai",
      message: `Description generated successfully with Gemini (${modelName}).`,
    };
  } catch (error) {
    console.error("AI Generation failed:", error);
    const fallback = getDemoFallback(context);
    return {
      ...fallback,
      source: "fallback",
      message: getApiFailureMessage(error),
    };
  }
}
