import { cn } from "@/lib/utils";
import type { WeatherKind } from "@/lib/cities";

const sceneThemes: Record<WeatherKind, string> = {
  clear: "from-[#b9cfcb] via-[#d8ddd0] to-[#e8d9bd]",
  cloudy: "from-[#aeb9b3] via-[#cad0c8] to-[#ddd5c7]",
  rain: "from-[#7f9497] via-[#aab6b2] to-[#c9c1b2]",
  snow: "from-[#b9c9cb] via-[#d8dfdc] to-[#e8e2d6]",
  night: "from-[#263340] via-[#485460] to-[#a28e79]",
};

export function WeatherScene({
  kind,
  city,
}: {
  kind: WeatherKind;
  city: string;
}) {
  const isNight = kind === "night";

  return (
    <div
      className={cn(
        "weather-scene relative min-h-[300px] overflow-hidden rounded-[1.75rem] bg-gradient-to-br",
        sceneThemes[kind],
      )}
      aria-label={`${kind} weather in ${city}`}
      role="img"
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12),transparent_45%)]" />

      {kind === "clear" && <div className="sun" />}

      {(kind === "clear" || kind === "cloudy" || kind === "rain") && (
        <>
          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />
        </>
      )}

      {kind === "rain" && (
        <div className="precipitation" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              className="raindrop"
              key={index}
              style={
                {
                  "--i": index,
                  "--x": `${(index * 17) % 96}%`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {kind === "snow" && (
        <div className="precipitation" aria-hidden="true">
          {Array.from({ length: 20 }, (_, index) => (
            <span
              className="snowflake"
              key={index}
              style={
                {
                  "--i": index,
                  "--x": `${(index * 23) % 98}%`,
                  "--s": `${4 + (index % 4) * 2}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {isNight && (
        <div className="stars" aria-hidden="true">
          {Array.from({ length: 22 }, (_, index) => (
            <span
              className="star"
              key={index}
              style={
                {
                  "--i": index,
                  "--x": `${5 + ((index * 31) % 90)}%`,
                  "--y": `${7 + ((index * 19) % 68)}%`,
                } as React.CSSProperties
              }
            />
          ))}
          <div className="moon" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/15 to-transparent" />
      <p className="absolute bottom-5 left-6 text-[10px] uppercase tracking-[0.28em] text-white/70">
        A small view from {city}
      </p>
    </div>
  );
}
