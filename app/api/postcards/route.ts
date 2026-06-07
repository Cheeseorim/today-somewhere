import { NextRequest, NextResponse } from "next/server";

import {
  createPostcard,
  listPostcards,
  type NewPostcard,
} from "@/lib/postcard-store";
import type { WeatherKind } from "@/lib/cities";

const weatherKinds: WeatherKind[] = [
  "clear",
  "cloudy",
  "rain",
  "snow",
  "night",
];
const recentPosts = new Map<string, number>();

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city")?.trim();
    return NextResponse.json({
      postcards: await listPostcards(city ? 30 : 12, city),
    });
  } catch {
    return NextResponse.json(
      { error: "Postcards could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "local";
    const lastPost = recentPosts.get(client) ?? 0;
    if (Date.now() - lastPost < 30000) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another postcard." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as Partial<NewPostcard>;
    const note = body.note?.trim() ?? "";

    if (
      !body.city ||
      !body.country ||
      !body.weatherLabel ||
      !body.localTime ||
      !body.kind ||
      !weatherKinds.includes(body.kind) ||
      !Number.isFinite(body.temperature) ||
      !Number.isFinite(body.humidity) ||
      note.length < 2 ||
      note.length > 100
    ) {
      return NextResponse.json(
        { error: "Please check the city and your one-line note." },
        { status: 400 },
      );
    }

    const postcard = await createPostcard({
      city: body.city.slice(0, 80),
      region: body.region?.slice(0, 80),
      country: body.country.slice(0, 80),
      countryCode: body.countryCode?.slice(0, 2) ?? "",
      note,
      temperature: Math.round(body.temperature as number),
      humidity: Math.round(body.humidity as number),
      apparentTemperature: Number.isFinite(body.apparentTemperature)
        ? Math.round(body.apparentTemperature as number)
        : undefined,
      windSpeed: Number.isFinite(body.windSpeed)
        ? Math.round(body.windSpeed as number)
        : undefined,
      precipitation: Number.isFinite(body.precipitation)
        ? Number(body.precipitation)
        : undefined,
      weatherLabel: body.weatherLabel.slice(0, 50),
      kind: body.kind,
      localTime: body.localTime.slice(0, 30),
    });
    recentPosts.set(client, Date.now());

    return NextResponse.json({ postcard }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "The postcard could not be published." },
      { status: 500 },
    );
  }
}
