export type WeatherKind = "clear" | "cloudy" | "rain" | "snow" | "night";

export type CitySeed = {
  city: string;
  country: string;
  countryName: string;
  coordinates: [number, number];
  timezone: string;
  note: string;
  language: string;
  languageLabel: string;
  translation: string;
  fallback: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
  };
};

export type CityWeather = CitySeed & {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  localTime: string;
  kind: WeatherKind;
  weatherLabel: string;
};

export const cities: CitySeed[] = [
  {
    city: "Seoul",
    country: "KR",
    countryName: "South Korea",
    coordinates: [37.5665, 126.978],
    timezone: "Asia/Seoul",
    note: "퇴근길에 갑자기 비가 와서 편의점 우산을 샀어요.",
    language: "ko",
    languageLabel: "Korean",
    translation: "It suddenly rained on my way home, so I bought an umbrella at the convenience store.",
    fallback: { temperature: 21, weatherCode: 61, isDay: true },
  },
  {
    city: "Helsinki",
    country: "FI",
    countryName: "Finland",
    coordinates: [60.1699, 24.9384],
    timezone: "Europe/Helsinki",
    note: "Still bright outside at 10 p.m.",
    language: "en",
    languageLabel: "English",
    translation: "밤 10시인데도 밖이 아직 환해요.",
    fallback: { temperature: 14, weatherCode: 2, isDay: true },
  },
  {
    city: "Tokyo",
    country: "JP",
    countryName: "Japan",
    coordinates: [35.6762, 139.6503],
    timezone: "Asia/Tokyo",
    note: "蒸し暑くてアイスばかり食べています。",
    language: "ja",
    languageLabel: "Japanese",
    translation: "It's so humid that I keep eating ice cream.",
    fallback: { temperature: 25, weatherCode: 1, isDay: false },
  },
  {
    city: "Reykjavík",
    country: "IS",
    countryName: "Iceland",
    coordinates: [64.1466, -21.9426],
    timezone: "Atlantic/Reykjavik",
    note: "The wind kept turning the pages of my book.",
    language: "en",
    languageLabel: "English",
    translation: "바람이 자꾸 책장을 넘겼어요.",
    fallback: { temperature: 9, weatherCode: 3, isDay: true },
  },
  {
    city: "Melbourne",
    country: "AU",
    countryName: "Australia",
    coordinates: [-37.8136, 144.9631],
    timezone: "Australia/Melbourne",
    note: "Someone left a tiny bouquet on the tram seat.",
    language: "en",
    languageLabel: "English",
    translation: "누군가 트램 좌석에 작은 꽃다발을 두고 갔어요.",
    fallback: { temperature: 11, weatherCode: 71, isDay: false },
  },
];

const weatherLabels: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
};

export function getWeatherKind(code: number, isDay: boolean): WeatherKind {
  if (!isDay && code < 4) return "night";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(
      code,
    )
  )
    return "rain";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  return "clear";
}

export function getWeatherLabel(code: number) {
  return weatherLabels[code] ?? "Changing skies";
}

export function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}
