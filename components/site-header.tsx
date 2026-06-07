"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [isQuiet, setIsQuiet] = useState(true);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a
          href="#top"
          className="font-serif text-base tracking-[-0.02em] text-ink"
        >
          Today, Somewhere
        </a>
        <Button
          variant="ghost"
          size="icon"
          className="bg-paper/50 backdrop-blur-md"
          onClick={() => setIsQuiet((value) => !value)}
          aria-label={isQuiet ? "Turn ambient sound on" : "Turn ambient sound off"}
          title="Ambient sound is a visual preference for now"
        >
          {isQuiet ? (
            <VolumeX className="size-4" strokeWidth={1.5} />
          ) : (
            <Volume2 className="size-4" strokeWidth={1.5} />
          )}
        </Button>
      </div>
    </header>
  );
}
