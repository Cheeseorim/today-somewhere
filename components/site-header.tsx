"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const [isQuiet, setIsQuiet] = useState(true);
  const {
    locale,
    setLocale,
    temperatureUnit,
    setTemperatureUnit,
    t,
  } = useLanguage();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a
          href="#top"
          className="font-serif text-base tracking-[-0.02em] text-ink"
        >
          Today, Somewhere
        </a>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-full border border-ink/10 bg-paper/55 p-1 text-[10px] backdrop-blur-md"
            aria-label={t("language")}
          >
            {(["ko", "en"] as const).map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setLocale(option)}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  locale === option
                    ? "bg-ink text-paper"
                    : "text-muted hover:text-ink"
                }`}
                aria-pressed={locale === option}
              >
                {option === "ko" ? "한국어" : "EN"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setTemperatureUnit(
                temperatureUnit === "celsius" ? "fahrenheit" : "celsius",
              )
            }
            className="flex h-9 min-w-11 items-center justify-center rounded-full border border-ink/10 bg-paper/55 px-3 text-[10px] font-medium text-ink/75 backdrop-blur-md transition-colors hover:bg-white/60"
            aria-label={t("temperatureUnit")}
            title={t("temperatureUnit")}
          >
            {temperatureUnit === "celsius" ? "°C" : "°F"}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-paper/50 backdrop-blur-md"
            onClick={() => setIsQuiet((value) => !value)}
            aria-label={isQuiet ? t("soundOn") : t("soundOff")}
          >
            {isQuiet ? (
              <VolumeX className="size-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="size-4" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
