import { NextRequest, NextResponse } from "next/server";

import { getWeatherKind, getWeatherLabel } from "@/lib/cities";

type GeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    country_code?: string;
    latitude: number;
    longitude: number;
    timezone: string;
    admin1?: string;
  }>;
};

type ForecastResponse = {
  timezone: string;
  current?: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
};

function localTime(timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();
  const latitudeParam = searchParams.get("latitude");
  const longitudeParam = searchParams.get("longitude");
  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  const hasCoordinates =
    latitudeParam !== null &&
    longitudeParam !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  try {
    let location: {
      city: string;
      region?: string;
      country: string;
      countryCode: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };

    if (query) {
      if (query.length < 2) {
        return NextResponse.json(
          { error: "Please enter at least two characters." },
          { status: 400 },
        );
      }

      const geocodingUrl = new URL(
        "https://geocoding-api.open-meteo.com/v1/search",
      );
      geocodingUrl.searchParams.set("name", query);
      geocodingUrl.searchParams.set("count", "1");
      geocodingUrl.searchParams.set("language", "en");
      geocodingUrl.searchParams.set("format", "json");

      const geocodingResponse = await fetch(geocodingUrl, {
        next: { revalidate: 86400 },
      });
      if (!geocodingResponse.ok) throw new Error("Geocoding failed");

      const geocoding = (await geocodingResponse.json()) as GeocodingResponse;
      const result = geocoding.results?.[0];
      if (!result) {
        return NextResponse.json(
          { error: "We could not find that city." },
          { status: 404 },
        );
      }

      location = {
        city: result.name,
        region: result.admin1,
        country: result.country ?? "Somewhere",
        countryCode: result.country_code ?? "",
        latitude: result.latitude,
        longitude: result.longitude,
        timezone: result.timezone,
      };
    } else if (hasCoordinates) {
      location = {
        city: "Near you",
        country: "Your current area",
        countryCode: "",
        latitude,
        longitude,
        timezone: "auto",
      };
    } else {
      return NextResponse.json(
        { error: "Enter a city or allow current location." },
        { status: 400 },
      );
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(location.latitude));
    forecastUrl.searchParams.set("longitude", String(location.longitude));
    forecastUrl.searchParams.set(
      "current",
      "temperature_2m,weather_code,is_day",
    );
    forecastUrl.searchParams.set("timezone", location.timezone);

    const forecastResponse = await fetch(forecastUrl, { cache: "no-store" });
    if (!forecastResponse.ok) throw new Error("Forecast failed");

    const forecast = (await forecastResponse.json()) as ForecastResponse;
    if (!forecast.current) throw new Error("Current weather unavailable");

    const weatherCode = forecast.current.weather_code;
    const isDay = Boolean(forecast.current.is_day);
    const timezone =
      location.timezone === "auto" ? forecast.timezone : location.timezone;

    return NextResponse.json({
      ...location,
      timezone,
      temperature: Math.round(forecast.current.temperature_2m),
      weatherCode,
      isDay,
      kind: getWeatherKind(weatherCode, isDay),
      weatherLabel: getWeatherLabel(weatherCode),
      localTime: localTime(timezone),
    });
  } catch {
    return NextResponse.json(
      { error: "The weather could not be reached. Please try again." },
      { status: 502 },
    );
  }
}
