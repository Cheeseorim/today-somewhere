import { ArrowDown } from "lucide-react";

import { CityCard } from "@/components/city-card";
import { SiteHeader } from "@/components/site-header";
import { getCitiesWeather } from "@/lib/weather";

export default async function Home() {
  const cities = await getCitiesWeather();

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="mx-auto flex min-h-[92svh] max-w-4xl flex-col items-center justify-center px-6 pb-20 pt-32 text-center">
          <p className="mb-6 text-[11px] uppercase tracking-[0.32em] text-muted">
            Sunday · June 7 · Somewhere
          </p>
          <h1 className="max-w-3xl font-serif text-[clamp(3.8rem,11vw,7.5rem)] leading-[0.82] tracking-[-0.065em] text-ink">
            Ordinary days,
            <br />
            far away.
          </h1>
          <p className="mt-9 max-w-md text-sm leading-7 text-muted sm:text-base">
            A quiet collection of weather and small moments
            <br className="hidden sm:block" /> from people around the world.
          </p>
          <a
            href="#postcards"
            className="mt-16 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-ink"
          >
            Wander slowly
            <ArrowDown className="size-4 animate-gentle-bounce" strokeWidth={1.25} />
          </a>
        </section>

        <section
          id="postcards"
          className="mx-auto max-w-6xl px-4 sm:px-8"
          aria-label="Postcards from around the world"
        >
          {cities.map((city, index) => (
            <CityCard city={city} index={index} key={city.city} />
          ))}
        </section>

        <footer className="mx-auto flex min-h-[55svh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
          <span className="mb-7 block size-2 rounded-full bg-apricot" />
          <p className="font-serif text-4xl tracking-[-0.03em] text-ink">
            The world continues.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Come back later. The sky may have changed.
          </p>
          <p className="mt-16 text-[10px] uppercase tracking-[0.24em] text-muted/70">
            Weather by Open-Meteo · Notes are imagined
          </p>
        </footer>
      </main>
    </>
  );
}
