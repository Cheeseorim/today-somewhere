"use client";

import { FormEvent, useState } from "react";
import { Droplets, LocateFixed, PencilLine, Search, Send, Umbrella, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeatherScene } from "@/components/weather-scene";
import {
  countryCodeToFlag,
  type WeatherKind,
} from "@/lib/cities";
import {
  formatTemperature,
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
  humidity: number;
  apparentTemperature: number;
  windSpeed: number;
  precipitation: number;
  weatherLabel: string;
  localTime: string;
  kind: WeatherKind;
};

export function LocationPostcard() {
  const { locale, temperatureUnit, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [nickname, setNickname] = useState("");
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
      setNote(weatherSuggestion(data, locale));
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
          nickname: nickname.trim(),
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
                        {formatTemperature(weather.temperature, temperatureUnit)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {localizedWeather(weather.weatherLabel, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl bg-paper/55 p-4 text-xs">
                    <WeatherMetric label={t("feelsLike")} value={formatTemperature(weather.apparentTemperature, temperatureUnit)} />
                    <WeatherMetric icon={<Droplets className="size-3.5" />} label={t("humidity")} value={`${weather.humidity}%`} />
                    <WeatherMetric icon={<Wind className="size-3.5" />} label={t("wind")} value={`${weather.windSpeed} km/h`} />
                    <WeatherMetric icon={<Umbrella className="size-3.5" />} label={t("precipitation")} value={`${weather.precipitation} mm`} />
                  </div>

                  <div className="mt-8">
                    <div className="mb-5">
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="postcard-nickname"
                          className="text-xs font-medium text-ink/75"
                        >
                          {t("nickname")}
                        </label>
                        <span className="text-[10px] text-muted/65">
                          {t("nicknameOptional")}
                        </span>
                      </div>
                      <input
                        id="postcard-nickname"
                        value={nickname}
                        onChange={(event) => setNickname(event.target.value)}
                        maxLength={20}
                        placeholder={t("nicknamePlaceholder")}
                        className="h-11 w-full rounded-xl border border-ink/15 bg-paper/65 px-4 text-sm text-ink outline-none placeholder:text-muted/45 focus:border-moss/55 focus:bg-white/55 focus:ring-2 focus:ring-moss/10"
                      />
                    </div>
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
                        setNickname("");
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

function weatherSuggestion(weather: LocalWeather, locale: "ko" | "en") {
  if (locale === "en") {
    if (weather.kind === "rain" || weather.precipitation > 0) {
      return weather.precipitation >= 1
        ? "Bring an umbrella. The rain is steady enough to get wet quickly."
        : "A small umbrella would help. It is raining lightly right now.";
    }
    if (weather.kind === "snow") {
      return "The ground may be slippery. Shoes with good grip would help.";
    }
    if (weather.apparentTemperature >= 28) {
      return "It feels too hot for a comfortable run. Light clothes are best.";
    }
    if (weather.apparentTemperature <= 8) {
      return "A warm outer layer is needed, especially when the wind picks up.";
    }
    if (weather.windSpeed >= 20) {
      return "The wind is strong enough to make a light jacket feel necessary.";
    }
    if (weather.humidity >= 75) {
      return "It feels humid and sticky. Outdoor exercise may feel harder.";
    }
    return "A light layer is enough, and it feels comfortable for a walk.";
  }

  if (weather.kind === "rain" || weather.precipitation > 0) {
    return weather.precipitation >= 1
      ? "우산을 꼭 챙기세요. 금방 옷이 젖을 정도로 비가 오고 있어요."
      : "작은 우산이 있으면 좋아요. 지금은 약한 비가 내리고 있어요.";
  }
  if (weather.kind === "snow") {
    return "길이 미끄러울 수 있어요. 바닥이 잘 미끄러지지 않는 신발이 좋아요.";
  }
  if (weather.apparentTemperature >= 28) {
    return "뛰기에는 꽤 더워요. 가벼운 옷과 물을 챙기는 게 좋아요.";
  }
  if (weather.apparentTemperature <= 8) {
    return "바람이 불면 더 춥게 느껴져요. 따뜻한 겉옷이 필요해요.";
  }
  if (weather.windSpeed >= 20) {
    return "바람이 강해서 얇은 바람막이를 챙기는 게 좋아요.";
  }
  if (weather.humidity >= 75) {
    return "습도가 높아 후텁지근해요. 야외 운동은 평소보다 힘들 수 있어요.";
  }
  return "얇은 겉옷이면 충분하고, 걷거나 가볍게 뛰기 좋은 날씨예요.";
}

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] text-muted/70">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-medium tabular-nums text-ink/80">{value}</p>
    </div>
  );
}
