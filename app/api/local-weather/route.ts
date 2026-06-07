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
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
  };
};

const koreanCityAliases: Record<
  string,
  { search: string; display: string; cityKey?: string }
> = {
  서울: { search: "Seoul", display: "서울" },
  서울시: { search: "Seoul", display: "서울" },
  부산: { search: "Busan", display: "부산" },
  부산시: { search: "Busan", display: "부산" },
  대구: { search: "Daegu", display: "대구" },
  대구시: { search: "Daegu", display: "대구" },
  인천: { search: "Incheon", display: "인천" },
  인천시: { search: "Incheon", display: "인천" },
  광주: { search: "Gwangju", display: "광주" },
  광주시: { search: "Gwangju", display: "광주" },
  대전: { search: "Daejeon", display: "대전" },
  대전시: { search: "Daejeon", display: "대전" },
  울산: { search: "Ulsan", display: "울산" },
  울산시: { search: "Ulsan", display: "울산" },
  세종: { search: "Sejong", display: "세종" },
  세종시: { search: "Sejong", display: "세종" },
  제주: { search: "Jeju City", display: "제주", cityKey: "Jeju" },
  제주시: { search: "Jeju City", display: "제주", cityKey: "Jeju" },
  서귀포: { search: "Seogwipo", display: "서귀포" },
  서귀포시: { search: "Seogwipo", display: "서귀포" },
  강릉: { search: "Gangneung", display: "강릉" },
  강릉시: { search: "Gangneung", display: "강릉" },
  전주: { search: "Jeonju", display: "전주" },
  전주시: { search: "Jeonju", display: "전주" },
  수원: { search: "Suwon", display: "수원" },
  수원시: { search: "Suwon", display: "수원" },
  춘천: { search: "Chuncheon", display: "춘천" },
  춘천시: { search: "Chuncheon", display: "춘천" },
  청주: { search: "Cheongju", display: "청주" },
  청주시: { search: "Cheongju", display: "청주" },
  포항: { search: "Pohang", display: "포항" },
  포항시: { search: "Pohang", display: "포항" },
  여수: { search: "Yeosu", display: "여수" },
  여수시: { search: "Yeosu", display: "여수" },
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
      cityKey: string;
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

      const normalizedQuery = query.replace(/\s+/g, "");
      const koreanAlias = koreanCityAliases[normalizedQuery];
      const searchQuery = koreanAlias?.search ?? query;
      const geocodingUrl = new URL(
        "https://geocoding-api.open-meteo.com/v1/search",
      );
      geocodingUrl.searchParams.set("name", searchQuery);
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
        city: koreanAlias?.display ?? result.name,
        cityKey: koreanAlias?.cityKey ?? result.name,
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
        cityKey: "Near you",
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
      "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code,is_day",
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
      humidity: Math.round(forecast.current.relative_humidity_2m),
      apparentTemperature: Math.round(forecast.current.apparent_temperature),
      windSpeed: Math.round(forecast.current.wind_speed_10m),
      precipitation: forecast.current.precipitation,
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
