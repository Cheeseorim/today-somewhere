"use client";

import { ArrowDown } from "lucide-react";

import { CityCard } from "@/components/city-card";
import { LocationPostcard } from "@/components/location-postcard";
import { SharedPostcards } from "@/components/shared-postcards";
import { SiteHeader } from "@/components/site-header";
import type { CityWeather } from "@/lib/cities";
import { useLanguage } from "@/lib/i18n";

export function HomeContent({ cities }: { cities: CityWeather[] }) {
  const { locale, t } = useLanguage();

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="mx-auto flex min-h-[92svh] max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
          <p className="mb-6 text-[11px] uppercase tracking-[0.32em] text-muted">
            {t("heroDate")}
          </p>
          <h1
            className={
              locale === "ko"
                ? "max-w-3xl font-serif text-[clamp(3.2rem,8vw,6rem)] leading-[0.95] tracking-[-0.055em] text-ink"
                : "max-w-3xl font-serif text-[clamp(3.8rem,11vw,7.5rem)] leading-[0.82] tracking-[-0.065em] text-ink"
            }
          >
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}
          </h1>
          <p className="mt-9 max-w-md text-sm leading-7 text-muted sm:text-base">
            {t("heroBody")}
          </p>
          <a
            href="#your-postcard"
            className="mt-16 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-ink"
          >
            {t("wander")}
            <ArrowDown
              className="size-4 animate-gentle-bounce"
              strokeWidth={1.25}
            />
          </a>
        </section>

        <LocationPostcard />
        <SharedPostcards />

        <section
          id="postcards"
          className="mx-auto max-w-6xl px-4 sm:px-8"
          aria-label={t("postcardsLabel")}
        >
          {cities.map((city, index) => (
            <CityCard city={city} index={index} key={city.city} />
          ))}
        </section>

        <footer className="mx-auto flex min-h-[55svh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
          <span className="mb-7 block size-2 rounded-full bg-apricot" />
          <p className="font-serif text-4xl tracking-[-0.03em] text-ink">
            {t("worldContinues")}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">{t("comeBack")}</p>
          <p className="mt-16 text-[10px] uppercase tracking-[0.24em] text-muted/70">
            {t("footerCredit")}
          </p>
        </footer>
      </main>
    </>
  );
}
