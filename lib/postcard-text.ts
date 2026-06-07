import type { Locale } from "@/lib/i18n";
import type { SharedPostcard } from "@/lib/postcard-store";

export function postcardText(postcard: SharedPostcard, locale: Locale) {
  const translation =
    locale === "ko" ? postcard.translationKo : postcard.translationEn;
  const targetLanguage = locale === "ko" ? "ko" : "en";
  const originalMatchesTarget =
    postcard.originalLanguage?.toLowerCase().startsWith(targetLanguage);

  if (translation && !originalMatchesTarget && translation !== postcard.note) {
    return {
      text: translation,
      original: postcard.note,
      isTranslated: true,
    };
  }

  return {
    text: postcard.note,
    original: null,
    isTranslated: false,
  };
}
