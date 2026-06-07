import {
  cities,
  getWeatherKind,
  getWeatherLabel,
  type CityWeather,
} from "@/lib/cities";

type OpenMeteoResponse = {
  current?: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
};

function getLocalTime(timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export async function getCitiesWeather(): Promise<CityWeather[]> {
  return Promise.all(
    cities.map(async (city) => {
      const [latitude, longitude] = city.coordinates;
      let current = city.fallback;

      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(latitude));
        url.searchParams.set("longitude", String(longitude));
        url.searchParams.set(
          "current",
          "temperature_2m,weather_code,is_day",
        );
        url.searchParams.set("timezone", city.timezone);

        const response = await fetch(url, { next: { revalidate: 900 } });
        if (response.ok) {
          const data = (await response.json()) as OpenMeteoResponse;
          if (data.current) {
            current = {
              temperature: Math.round(data.current.temperature_2m),
              weatherCode: data.current.weather_code,
              isDay: Boolean(data.current.is_day),
            };
          }
        }
      } catch {
        // The postcard still works with curated fallback weather.
      }

      const kind = getWeatherKind(current.weatherCode, current.isDay);
      const selectedNote = city.notes[kind];
      const { notes: _notes, ...cityDetails } = city;

      return {
        ...cityDetails,
        ...current,
        ...selectedNote,
        localTime: getLocalTime(city.timezone),
        kind,
        weatherLabel: getWeatherLabel(current.weatherCode),
      };
    }),
  );
}
