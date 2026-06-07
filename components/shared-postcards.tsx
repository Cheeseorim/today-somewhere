"use client";

import { useCallback, useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { countryCodeToFlag } from "@/lib/cities";
import type { SharedPostcard } from "@/lib/postcard-store";

function relativeTime(date: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60000),
  );
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SharedPostcards() {
  const [postcards, setPostcards] = useState<SharedPostcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/postcards", { cache: "no-store" });
      const data = (await response.json()) as {
        postcards?: SharedPostcard[];
      };
      if (response.ok) setPostcards(data.postcards ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener("postcard-published", refresh);
    return () => window.removeEventListener("postcard-published", refresh);
  }, [refresh]);

  if (!isLoading && postcards.length === 0) return null;

  return (
    <section
      id="community-postcards"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-8"
      aria-labelledby="community-heading"
    >
      <div className="mb-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
          Sent moments
        </p>
        <h2
          id="community-heading"
          className="mt-4 font-serif text-4xl tracking-[-0.04em] text-ink sm:text-5xl"
        >
          방금 도착한 엽서
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 2 }, (_, index) => (
              <div
                className="h-52 animate-pulse rounded-[2rem] bg-white/35"
                key={index}
              />
            ))
          : postcards.map((postcard) => (
              <Card
                className="flex min-h-52 flex-col justify-between p-7 sm:p-8"
                key={postcard.id}
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                      {postcard.countryCode && (
                        <span className="mr-2" aria-hidden="true">
                          {countryCodeToFlag(postcard.countryCode)}
                        </span>
                      )}
                      {postcard.city}
                    </p>
                    <blockquote className="mt-5 font-serif text-2xl leading-[1.45] tracking-[-0.02em] text-ink">
                      “{postcard.note}”
                    </blockquote>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-3xl">{postcard.temperature}°</p>
                    <p className="mt-1 text-[10px] text-muted">
                      {postcard.weatherLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-7 flex justify-between text-[10px] uppercase tracking-[0.14em] text-muted/75">
                  <span>{postcard.localTime} local</span>
                  <span>{relativeTime(postcard.createdAt)}</span>
                </div>
              </Card>
            ))}
      </div>
    </section>
  );
}
