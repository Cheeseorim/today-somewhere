"use client";

import { FormEvent, useState } from "react";
import { LocateFixed, PencilLine, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeatherScene } from "@/components/weather-scene";
import {
  countryCodeToFlag,
  type WeatherKind,
} from "@/lib/cities";
import {
  localizedCity,
  localizedCountry,
  localizedWeather,
  useLanguage,
} from "@/lib/i18n";

type LocalWeather = {
  city: string;
  cityKey: string;
  region?: string;
  country: string;
  countryCode: string;
  temperature: number;
  weatherLabel: string;
  localTime: string;
  kind: WeatherKind;
};

const noteSuggestions: Record<"ko" | "en", Record<WeatherKind, string>> = {
  ko: {
    clear: "햇빛이 좋아서 잠깐 먼 길로 돌아왔어요.",
    cloudy: "흐린 하늘 아래 오늘은 동네가 조금 조용해 보여요.",
    rain: "빗소리를 들으며 천천히 집으로 돌아왔어요.",
    snow: "눈이 내리자 익숙한 길이 잠시 낯설어졌어요.",
    night: "하루가 끝난 뒤에도 몇몇 창문은 아직 밝아요.",
  },
  en: {
    clear: "The sunlight was lovely, so I took the longer way home.",
    cloudy: "The neighborhood feels a little quieter beneath the gray sky.",
    rain: "I walked home slowly, listening to the rain.",
    snow: "The familiar street looked new for a moment under the snow.",
    night: "A few windows are still glowing after the day has ended.",
  },
};

export function LocationPostcard() {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [weather, setWeather] = useState<LocalWeather | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  async function loadWeather(url: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(url);
      const data = (await response.json()) as LocalWeather & { error?: string };
      if (!response.ok) throw new Error(data.error);

      setWeather(data);
      setNote(noteSuggestions[locale][data.kind]);
      setIsPublished(false);
    } catch (requestError) {
      setWeather(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function publishPostcard() {
    if (!weather || note.trim().length < 2) {
      setError(
        locale === "ko"
          ? "두 글자 이상의 한 줄을 남겨 주세요."
          : "Please write at least two characters.",
      );
      return;
    }

    const lastPublishedAt = Number(
      window.localStorage.getItem("today-somewhere:last-published") ?? 0,
    );
    if (Date.now() - lastPublishedAt < 30000) {
      setError(
        locale === "ko"
          ? "잠시 숨을 고른 뒤 다음 엽서를 보내 주세요."
          : "Please wait a moment before sending another postcard.",
      );
      return;
    }

    setIsPublishing(true);
    setError("");

    try {
      const response = await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...weather,
          city: weather.cityKey,
          note: note.trim(),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error);

      window.localStorage.setItem(
        "today-somewhere:last-published",
        String(Date.now()),
      );
      setIsPublished(true);
      window.dispatchEvent(new Event("postcard-published"));
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : locale === "ko"
            ? "엽서를 보내지 못했습니다."
            : "The postcard could not be sent.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  function searchCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = query.trim();
    if (!city) {
      setError(
        locale === "ko" ? "도시 이름을 입력해 주세요." : "Enter a city name.",
      );
      return;
    }

    void loadWeather(`/api/local-weather?q=${encodeURIComponent(city)}`);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError(
        locale === "ko"
          ? "이 브라우저에서는 현재 위치를 사용할 수 없습니다."
          : "Current location is unavailable in this browser.",
      );
      return;
    }

    setIsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void loadWeather(
          `/api/local-weather?latitude=${coords.latitude}&longitude=${coords.longitude}`,
        );
      },
      () => {
        setIsLoading(false);
        setError(
          locale === "ko"
            ? "위치 권한이 허용되지 않았습니다. 도시명으로 검색해 주세요."
            : "Location permission was not allowed. Search by city instead.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }

  return (
    <section
      id="your-postcard"
      className="mx-auto flex min-h-[82svh] max-w-6xl items-center px-4 py-20 sm:px-8"
    >
      <div className="w-full">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
            {t("fromWhere")}
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-ink sm:text-5xl">
            {t("locationTitle")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            {t("locationBody")}
          </p>
        </div>

        <Card className="overflow-hidden p-2 backdrop-blur-sm">
          {!weather ? (
            <div className="mx-auto flex min-h-[340px] max-w-xl flex-col justify-center px-5 py-10 sm:px-10">
              <form onSubmit={searchCity}>
                <label
                  htmlFor="city-search"
                  className="text-xs uppercase tracking-[0.18em] text-muted"
                >
                  {t("yourCity")}
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    id="city-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={
                      locale === "ko"
                        ? "서울, 부산, 제주..."
                        : "Seoul, Busan, Paris..."
                    }
                    className="h-12 min-w-0 flex-1 rounded-full border border-ink/15 bg-paper/55 px-5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
                    autoComplete="address-level2"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label={
                      locale === "ko" ? "도시 날씨 검색" : "Search city weather"
                    }
                    disabled={isLoading}
                  >
                    <Search className="size-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </form>

              <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted/70">
                <span className="h-px flex-1 bg-line" />
                or
                <span className="h-px flex-1 bg-line" />
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={useCurrentLocation}
                disabled={isLoading}
                className="self-center"
              >
                <LocateFixed className="size-4" strokeWidth={1.5} />
                {isLoading ? t("findingSky") : t("useLocation")}
              </Button>

              {error && (
                <p className="mt-5 text-center text-sm text-[#9a5f50]" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-6 text-center text-xs leading-5 text-muted/70">
                {t("locationPrivacy")}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1.08fr_0.92fr]">
              <WeatherScene
                kind={weather.kind}
                city={localizedCity(weather.city, locale)}
              />
              <div className="flex min-h-[360px] flex-col justify-between px-6 pb-7 pt-8 sm:px-10 md:py-10">
                <div>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
                        {t("myPostcard")}
                      </p>
                      <h3 className="mt-3 font-serif text-4xl tracking-[-0.04em]">
                        {localizedCity(weather.city, locale)}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        {weather.countryCode && (
                          <span className="mr-2" aria-hidden="true">
                            {countryCodeToFlag(weather.countryCode)}
                          </span>
                        )}
                        {weather.region
                          ? `${weather.region}, ${localizedCountry(weather.country, locale)}`
                          : localizedCountry(weather.country, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-5xl tracking-[-0.07em]">
                        {weather.temperature}°
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {localizedWeather(weather.weatherLabel, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <label
                        htmlFor="postcard-note"
                        className="flex items-center gap-2 text-xs font-medium text-ink/75"
                      >
                        <PencilLine className="size-4" strokeWidth={1.5} />
                        {t("noteLabel")}
                      </label>
                      <span className="rounded-full bg-apricot/15 px-3 py-1 text-[10px] text-[#8a6245]">
                        {t("editHint")}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-ink/15 bg-paper/65 px-5 pb-3 pt-4 transition-colors focus-within:border-moss/55 focus-within:bg-white/55 focus-within:ring-2 focus-within:ring-moss/10">
                      <textarea
                        id="postcard-note"
                        value={note}
                        onChange={(event) => {
                          setNote(event.target.value);
                          setIsPublished(false);
                        }}
                        maxLength={100}
                        aria-describedby="postcard-note-help"
                        className="min-h-28 w-full resize-none bg-transparent font-serif text-2xl leading-[1.45] text-ink outline-none placeholder:text-muted/50"
                        placeholder={t("notePlaceholder")}
                      />
                      <div
                        id="postcard-note-help"
                        className="flex items-center justify-between border-t border-line/70 pt-3 text-[10px] text-muted/70"
                      >
                        <span>{t("notePublic")}</span>
                        <span className="tabular-nums">{note.length} / 100</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-muted">
                    {t("localTime")} · {weather.localTime}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setWeather(null);
                        setNote("");
                        setError("");
                        setIsPublished(false);
                      }}
                      className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
                    >
                      {t("otherCity")}
                    </button>
                    <Button
                      type="button"
                      onClick={publishPostcard}
                      disabled={isPublishing || isPublished}
                    >
                      <Send className="size-4" strokeWidth={1.5} />
                      {isPublished
                        ? t("sent")
                        : isPublishing
                          ? t("sending")
                          : t("send")}
                    </Button>
                  </div>
                </div>
                {error && (
                  <p className="mt-4 text-sm text-[#9a5f50]" role="alert">
                    {error}
                  </p>
                )}
                <p className="mt-3 text-[11px] leading-5 text-muted/65">
                  {t("sendNotice")}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
