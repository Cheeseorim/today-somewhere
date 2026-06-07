"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircleMore } from "lucide-react";

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

export function CityNotes({ city }: { city: string }) {
  const [postcards, setPostcards] = useState<SharedPostcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/postcards?city=${encodeURIComponent(city)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        postcards?: SharedPostcard[];
      };
      if (response.ok) setPostcards(data.postcards ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [city]);

  useEffect(() => {
    void refresh();
    window.addEventListener("postcard-published", refresh);
    return () => window.removeEventListener("postcard-published", refresh);
  }, [refresh]);

  const recentPostcards = useMemo(() => postcards.slice(0, 3), [postcards]);

  return (
    <div className="mt-8 border-t border-line/80 pt-7">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
          <MessageCircleMore className="size-4" strokeWidth={1.4} />
          From people in {city}
        </p>
        {!isLoading && postcards.length > 0 && (
          <span className="text-[10px] tabular-nums text-muted/70">
            {postcards.length} {postcards.length === 1 ? "note" : "notes"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 h-16 animate-pulse rounded-xl bg-paper/55" />
      ) : recentPostcards.length > 0 ? (
        <div className="mt-4 space-y-2">
          {recentPostcards.map((postcard, index) => (
            <div
              className="rounded-xl border border-line/70 bg-paper/60 px-4 py-3"
              key={postcard.id}
              style={{ marginLeft: `${index * 6}px` }}
            >
              <p className="font-serif text-lg leading-6 text-ink/85">
                “{postcard.note}”
              </p>
              <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-muted/65">
                <span>{postcard.localTime} local</span>
                <span>{relativeTime(postcard.createdAt)}</span>
              </div>
            </div>
          ))}
          {postcards.length > 3 && (
            <p className="pt-1 text-right text-[10px] text-muted/65">
              + {postcards.length - 3} more moments
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted/65">
          아직 이 도시에서 도착한 기록이 없어요. 첫 번째 엽서를 남겨보세요.
        </p>
      )}
    </div>
  );
}
