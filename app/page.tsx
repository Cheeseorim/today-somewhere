import { HomeContent } from "@/components/home-content";
import { getCitiesWeather } from "@/lib/weather";

export default async function Home() {
  const cities = await getCitiesWeather();

  return <HomeContent cities={cities} />;
}
