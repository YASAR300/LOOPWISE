import OpenAI from "openai";

let openaiClient = null;

export function getAIClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured. Please set GROQ_API_KEY in your environment variables (.env.local)."
    );
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return openaiClient;
}

export function getAIModel() {
  const model = process.env.AI_MODEL;
  if (!model) {
    throw new Error(
      "AI_MODEL is not configured. Please set AI_MODEL in your environment variables (.env.local, e.g. llama-3.3-70b-versatile)."
    );
  }
  return model;
}

/**
 * Generate free-form text completion using Groq.
 * @param {Object} options
 * @param {string} [options.system] - System instructions
 * @param {string} options.user - User message prompt
 * @returns {Promise<string>}
 */
export async function generateText({ system, user }) {
  const client = getAIClient();
  const model = getAIModel();

  const messages = [];
  if (system) {
    messages.push({ role: "system", content: system });
  }
  messages.push({ role: "user", content: user });

  const response = await client.chat.completions.create({
    model,
    messages,
  });

  return response.choices?.[0]?.message?.content || "";
}

/**
 * Generate structured JSON completion with Groq and validate with Zod schema.
 * Automatically retries once if invalid JSON or schema validation fails.
 * @param {Object} options
 * @param {string} [options.system] - System instructions
 * @param {string} options.user - User prompt
 * @param {import("zod").ZodSchema} [options.schema] - Zod schema to validate against
 * @returns {Promise<any>}
 */
export async function generateJSON({ system, user, schema }) {
  const client = getAIClient();
  const model = getAIModel();

  const systemPrompt = system
    ? `${system}\n\nIMPORTANT: You must return valid JSON only. Do not include markdown code block backticks, explanatory text, or preamble.`
    : "IMPORTANT: You must return valid JSON only. Do not include markdown code block backticks, explanatory text, or preamble.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: user },
  ];

  const fetchCompletion = async (msgs) => {
    const response = await client.chat.completions.create({
      model,
      messages: msgs,
      response_format: { type: "json_object" },
    });
    return response.choices?.[0]?.message?.content?.trim() || "{}";
  };

  let raw = await fetchCompletion(messages);

  const parseAndValidate = (text) => {
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (schema) {
      return schema.parse(parsed);
    }
    return parsed;
  };

  try {
    return parseAndValidate(raw);
  } catch (initialError) {
    // Retry once with error feedback
    const retryMessages = [
      ...messages,
      { role: "assistant", content: raw },
      {
        role: "user",
        content: `Your previous response was invalid. Error: ${initialError.message}. Please respond strictly with valid JSON conforming to the requested structure.`,
      },
    ];

    const retryRaw = await fetchCompletion(retryMessages);
    return parseAndValidate(retryRaw);
  }
}
