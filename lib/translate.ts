export type PostcardTranslations = {
  originalLanguage?: string;
  translationKo?: string;
  translationEn?: string;
};

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function outputText(response: OpenAIResponse) {
  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === "output_text")?.text ?? ""
  );
}

export async function translatePostcard(
  note: string,
): Promise<PostcardTranslations> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return {};

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4o-mini",
        instructions:
          "Detect the language and translate the weather report naturally. Preserve meaning, clothing advice, umbrella advice, and activity guidance. Return only compact JSON with keys originalLanguage, translationKo, translationEn. originalLanguage must be a short ISO 639-1 code. If the original is already Korean or English, copy it unchanged into that translation field.",
        input: note,
        temperature: 0,
        max_output_tokens: 200,
      }),
    });
    if (!response.ok) return {};

    const text = outputText((await response.json()) as OpenAIResponse);
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return {};

    const parsed = JSON.parse(json) as PostcardTranslations;
    return {
      originalLanguage: parsed.originalLanguage?.slice(0, 10),
      translationKo: parsed.translationKo?.trim().slice(0, 300),
      translationEn: parsed.translationEn?.trim().slice(0, 300),
    };
  } catch {
    return {};
  }
}
