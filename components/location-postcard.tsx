"use client";

import { FormEvent, useState } from "react";
import { LocateFixed, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeatherScene } from "@/components/weather-scene";
import {
  countryCodeToFlag,
  type WeatherKind,
} from "@/lib/cities";

type LocalWeather = {
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  temperature: number;
  weatherLabel: string;
  localTime: string;
  kind: WeatherKind;
};

const noteSuggestions: Record<WeatherKind, string> = {
  clear: "햇빛이 좋아서 잠깐 먼 길로 돌아왔어요.",
  cloudy: "흐린 하늘 아래 오늘은 동네가 조금 조용해 보여요.",
  rain: "빗소리를 들으며 천천히 집으로 돌아왔어요.",
  snow: "눈이 내리자 익숙한 길이 잠시 낯설어졌어요.",
  night: "하루가 끝난 뒤에도 몇몇 창문은 아직 밝아요.",
};

export function LocationPostcard() {
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
      setNote(noteSuggestions[data.kind]);
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
      setError("두 글자 이상의 한 줄을 남겨 주세요.");
      return;
    }

    const lastPublishedAt = Number(
      window.localStorage.getItem("today-somewhere:last-published") ?? 0,
    );
    if (Date.now() - lastPublishedAt < 30000) {
      setError("잠시 숨을 고른 뒤 다음 엽서를 보내 주세요.");
      return;
    }

    setIsPublishing(true);
    setError("");

    try {
      const response = await fetch("/api/postcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...weather, note: note.trim() }),
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
          : "엽서를 보내지 못했습니다.",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  function searchCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = query.trim();
    if (!city) {
      setError("도시 이름을 입력해 주세요.");
      return;
    }

    void loadWeather(`/api/local-weather?q=${encodeURIComponent(city)}`);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
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
        setError("위치 권한이 허용되지 않았습니다. 도시명으로 검색해 주세요.");
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
            From where you are
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-[-0.04em] text-ink sm:text-5xl">
            오늘, 당신이 있는 곳은?
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            도시를 찾고, 지금의 날씨에 짧은 한 줄을 남겨보세요.
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
                  Your city
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    id="city-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Seoul, Busan, Paris..."
                    className="h-12 min-w-0 flex-1 rounded-full border border-ink/15 bg-paper/55 px-5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-moss/50 focus:ring-2 focus:ring-moss/10"
                    autoComplete="address-level2"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Search city weather"
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
                {isLoading ? "Finding the sky..." : "현재 위치 사용"}
              </Button>

              {error && (
                <p className="mt-5 text-center text-sm text-[#9a5f50]" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-6 text-center text-xs leading-5 text-muted/70">
                현재 위치를 선택해도 정확한 좌표는 게시되지 않습니다.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1.08fr_0.92fr]">
              <WeatherScene kind={weather.kind} city={weather.city} />
              <div className="flex min-h-[360px] flex-col justify-between px-6 pb-7 pt-8 sm:px-10 md:py-10">
                <div>
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
                        My postcard
                      </p>
                      <h3 className="mt-3 font-serif text-4xl tracking-[-0.04em]">
                        {weather.city}
                      </h3>
                      <p className="mt-2 text-sm text-muted">
                        {weather.countryCode && (
                          <span className="mr-2" aria-hidden="true">
                            {countryCodeToFlag(weather.countryCode)}
                          </span>
                        )}
                        {weather.region
                          ? `${weather.region}, ${weather.country}`
                          : weather.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-5xl tracking-[-0.07em]">
                        {weather.temperature}°
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {weather.weatherLabel}
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={100}
                    aria-label="Your one-line note"
                    className="mt-8 min-h-24 w-full resize-none border-y border-line bg-transparent py-6 font-serif text-2xl leading-[1.45] text-ink outline-none placeholder:text-muted/50"
                    placeholder="오늘의 한 줄을 남겨보세요."
                  />
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-muted">
                    Local time · {weather.localTime}
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
                      다른 도시
                    </button>
                    <Button
                      type="button"
                      onClick={publishPostcard}
                      disabled={isPublishing || isPublished}
                    >
                      <Send className="size-4" strokeWidth={1.5} />
                      {isPublished
                        ? "엽서를 보냈어요"
                        : isPublishing
                          ? "보내는 중..."
                          : "모두에게 보내기"}
                    </Button>
                  </div>
                </div>
                {error && (
                  <p className="mt-4 text-sm text-[#9a5f50]" role="alert">
                    {error}
                  </p>
                )}
                <p className="mt-3 text-[11px] leading-5 text-muted/65">
                  보내면 도시, 날씨와 이 문장이 다른 방문자에게 공개됩니다.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
