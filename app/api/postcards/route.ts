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

export async function GET() {
  try {
    return NextResponse.json({ postcards: await listPostcards() });
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
