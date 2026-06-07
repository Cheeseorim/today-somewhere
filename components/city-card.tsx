import { Languages } from "lucide-react";

import { CityNotes } from "@/components/city-notes";
import { Card } from "@/components/ui/card";
import { WeatherScene } from "@/components/weather-scene";
import { countryCodeToFlag, type CityWeather } from "@/lib/cities";

export function CityCard({ city, index }: { city: CityWeather; index: number }) {
  return (
    <article className="city-section flex min-h-[88svh] items-center py-12 md:min-h-screen md:py-20">
      <Card className="grid w-full overflow-hidden p-2 backdrop-blur-sm md:grid-cols-[1.12fr_0.88fr] md:p-3">
        <WeatherScene kind={city.kind} city={city.city} />

        <div className="flex min-h-[330px] flex-col justify-between px-6 pb-7 pt-8 sm:px-9 md:min-h-0 md:px-12 md:py-10">
          <div>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted">
                  Postcard {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif text-4xl tracking-[-0.03em] text-ink sm:text-5xl">
                  {city.city}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <span aria-hidden="true" className="text-base">
                    {countryCodeToFlag(city.country)}
                  </span>
                  {city.countryName}
                </p>
              </div>

              <div className="text-right">
                <p className="font-serif text-5xl tracking-[-0.07em] text-ink">
                  {city.temperature}°
                </p>
                <p className="mt-1 text-xs text-muted">{city.weatherLabel}</p>
              </div>
            </div>

            <div className="my-8 h-px bg-line/80" />

            <blockquote
              className="font-serif text-[1.65rem] leading-[1.4] tracking-[-0.02em] text-ink sm:text-3xl"
              lang={city.language}
            >
              “{city.note}”
            </blockquote>

            <div className="mt-6 flex items-start gap-3 text-sm leading-6 text-muted">
              <Languages className="mt-1 size-4 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs uppercase tracking-[0.16em]">
                  {city.languageLabel} · translated
                </p>
                <p className="mt-1 text-ink/65">{city.translation}</p>
              </div>
            </div>

            <CityNotes city={city.city} />
          </div>

          <div className="mt-10 flex items-center justify-between text-xs text-muted">
            <span>Local time</span>
            <span className="font-medium tabular-nums text-ink/75">
              {city.localTime}
            </span>
          </div>
        </div>
      </Card>
    </article>
  );
}
