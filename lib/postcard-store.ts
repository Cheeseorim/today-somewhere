import { promises as fs } from "node:fs";
import path from "node:path";

import type { WeatherKind } from "@/lib/cities";

export type SharedPostcard = {
  id: string;
  city: string;
  region?: string;
  country: string;
  countryCode: string;
  note: string;
  temperature: number;
  weatherLabel: string;
  kind: WeatherKind;
  localTime: string;
  createdAt: string;
};

export type NewPostcard = Omit<SharedPostcard, "id" | "createdAt">;

type SupabaseRow = {
  id: string;
  city: string;
  region: string | null;
  country: string;
  country_code: string;
  note: string;
  temperature: number;
  weather_label: string;
  weather_kind: WeatherKind;
  local_time: string;
  created_at: string;
};

const localStorePath = path.join(process.cwd(), "data", "postcards.json");

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function fromRow(row: SupabaseRow): SharedPostcard {
  return {
    id: row.id,
    city: row.city,
    region: row.region ?? undefined,
    country: row.country,
    countryCode: row.country_code,
    note: row.note,
    temperature: row.temperature,
    weatherLabel: row.weather_label,
    kind: row.weather_kind,
    localTime: row.local_time,
    createdAt: row.created_at,
  };
}

async function readLocalPostcards() {
  try {
    return JSON.parse(
      await fs.readFile(localStorePath, "utf8"),
    ) as SharedPostcard[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalPostcards(postcards: SharedPostcard[]) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true });
  await fs.writeFile(
    localStorePath,
    JSON.stringify(postcards.slice(0, 50), null, 2),
    "utf8",
  );
}

export async function listPostcards(limit = 12): Promise<SharedPostcard[]> {
  const supabase = supabaseConfig();
  if (!supabase) {
    return (await readLocalPostcards()).slice(0, limit);
  }

  const endpoint = new URL(`${supabase.url}/rest/v1/postcards`);
  endpoint.searchParams.set(
    "select",
    "id,city,region,country,country_code,note,temperature,weather_label,weather_kind,local_time,created_at",
  );
  endpoint.searchParams.set("status", "eq.published");
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", String(limit));

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load postcards");

  return ((await response.json()) as SupabaseRow[]).map(fromRow);
}

export async function createPostcard(
  postcard: NewPostcard,
): Promise<SharedPostcard> {
  const supabase = supabaseConfig();
  if (!supabase) {
    const created: SharedPostcard = {
      ...postcard,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await writeLocalPostcards([created, ...(await readLocalPostcards())]);
    return created;
  }

  const response = await fetch(`${supabase.url}/rest/v1/postcards`, {
    method: "POST",
    headers: {
      apikey: supabase.key,
      Authorization: `Bearer ${supabase.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      city: postcard.city,
      region: postcard.region ?? null,
      country: postcard.country,
      country_code: postcard.countryCode,
      note: postcard.note,
      temperature: postcard.temperature,
      weather_label: postcard.weatherLabel,
      weather_kind: postcard.kind,
      local_time: postcard.localTime,
    }),
  });
  if (!response.ok) throw new Error("Could not publish postcard");

  const rows = (await response.json()) as SupabaseRow[];
  return fromRow(rows[0]);
}
