export type WeatherKind = "clear" | "cloudy" | "rain" | "snow" | "night";

export type CityNote = {
  note: string;
  translation: string;
};

export type CitySeed = {
  city: string;
  country: string;
  countryName: string;
  coordinates: [number, number];
  timezone: string;
  language: string;
  languageLabel: string;
  notes: Record<WeatherKind, CityNote>;
  fallback: {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
  };
};

export type CityWeather = Omit<CitySeed, "notes"> &
  CityNote & {
    temperature: number;
    weatherCode: number;
    isDay: boolean;
    localTime: string;
    kind: WeatherKind;
    weatherLabel: string;
  };

const koreanNotes = {
  seoul: {
    clear: {
      note: "햇빛이 좋아서 한 정거장 먼저 내려 걸었어요.",
      translation: "The sunlight was lovely, so I got off one stop early and walked.",
    },
    cloudy: {
      note: "회색 하늘 아래 빌딩 불빛이 하나둘 켜지고 있어요.",
      translation: "Under the gray sky, the office lights are coming on one by one.",
    },
    rain: {
      note: "퇴근길에 갑자기 비가 와서 편의점 우산을 샀어요.",
      translation: "It suddenly rained on my way home, so I bought a convenience-store umbrella.",
    },
    snow: {
      note: "첫눈이 쌓이기 전에 골목마다 발자국이 먼저 생겼어요.",
      translation: "Footprints appeared in every alley before the first snow could settle.",
    },
    night: {
      note: "막차를 기다리며 한강 건너 불빛을 오래 바라봤어요.",
      translation: "Waiting for the last train, I watched the lights across the Han River.",
    },
  },
  busan: {
    clear: {
      note: "점심을 먹고 바다가 보이는 길로 조금 돌아왔어요.",
      translation: "After lunch, I took the longer way back along a road with a sea view.",
    },
    cloudy: {
      note: "흐린 바다와 하늘의 경계가 오늘은 잘 보이지 않아요.",
      translation: "Today it is hard to see where the cloudy sea ends and the sky begins.",
    },
    rain: {
      note: "비를 피해 어묵 국물 앞에 사람들이 나란히 섰어요.",
      translation: "People lined up by the warm fish-cake broth to shelter from the rain.",
    },
    snow: {
      note: "드문 눈이 내려서 모두 창밖을 한 번씩 더 보고 있어요.",
      translation: "Rare snow is falling, so everyone keeps glancing out the window.",
    },
    night: {
      note: "광안대교 불빛이 잔잔한 물 위에서 길게 흔들려요.",
      translation: "The lights of Gwangan Bridge sway in long reflections on the calm water.",
    },
  },
  jeju: {
    clear: {
      note: "귤밭 돌담 사이로 따뜻한 바람이 천천히 지나가요.",
      translation: "A warm breeze is moving slowly between the stone walls of the tangerine fields.",
    },
    cloudy: {
      note: "한라산은 구름 뒤에 숨고 돌담만 또렷하게 보여요.",
      translation: "Hallasan is hidden behind clouds, while the stone walls look especially clear.",
    },
    rain: {
      note: "빗소리를 들으며 작은 카페에서 책을 한 장 더 읽었어요.",
      translation: "Listening to the rain, I read one more page in a small cafe.",
    },
    snow: {
      note: "오름 위에만 하얗게 눈이 남아 섬이 조금 낯설어 보여요.",
      translation: "Snow remains only on the oreum, making the island look a little unfamiliar.",
    },
    night: {
      note: "바람이 잦아든 뒤 멀리 오징어배 불빛이 보여요.",
      translation: "After the wind settled, the lights of squid boats appeared in the distance.",
    },
  },
  gangneung: {
    clear: {
      note: "커피를 들고 바다 앞 벤치에 오래 앉아 있었어요.",
      translation: "I sat for a long while on a bench by the sea, holding a coffee.",
    },
    cloudy: {
      note: "파도 색이 하늘과 닮아서 오늘 바다는 더 조용해 보여요.",
      translation: "The waves match the sky, making the sea look quieter today.",
    },
    rain: {
      note: "젖은 소나무 냄새가 골목 끝까지 따라왔어요.",
      translation: "The scent of wet pine trees followed me to the end of the alley.",
    },
    snow: {
      note: "바다 옆 소나무 가지마다 눈이 얇게 내려앉았어요.",
      translation: "A thin layer of snow settled on every pine branch beside the sea.",
    },
    night: {
      note: "파도 소리만 들리는 해변을 천천히 걸었어요.",
      translation: "I walked slowly along the beach with only the sound of waves.",
    },
  },
  jeonju: {
    clear: {
      note: "한옥 담장 위 햇살이 예뻐서 잠깐 멈춰 섰어요.",
      translation: "The sunlight on a hanok wall was so lovely that I stopped for a moment.",
    },
    cloudy: {
      note: "골목의 낮은 지붕들이 흐린 하늘 아래 차분해 보여요.",
      translation: "The low rooftops in the alley look peaceful beneath the cloudy sky.",
    },
    rain: {
      note: "처마 밑에서 비를 피하며 따뜻한 차를 마셨어요.",
      translation: "I drank warm tea under the eaves while waiting out the rain.",
    },
    snow: {
      note: "기와지붕 위에 눈이 쌓여 마을 전체가 조용해졌어요.",
      translation: "Snow settled on the tiled roofs, and the whole neighborhood grew quiet.",
    },
    night: {
      note: "사람이 줄어든 한옥마을 골목을 천천히 돌아봤어요.",
      translation: "I wandered slowly through the quieter evening alleys of the hanok village.",
    },
  },
} satisfies Record<string, Record<WeatherKind, CityNote>>;

export const cities: CitySeed[] = [
  {
    city: "Seoul",
    country: "KR",
    countryName: "South Korea",
    coordinates: [37.5665, 126.978],
    timezone: "Asia/Seoul",
    language: "ko",
    languageLabel: "Korean",
    notes: koreanNotes.seoul,
    fallback: { temperature: 21, weatherCode: 61, isDay: true },
  },
  {
    city: "Busan",
    country: "KR",
    countryName: "South Korea",
    coordinates: [35.1796, 129.0756],
    timezone: "Asia/Seoul",
    language: "ko",
    languageLabel: "Korean",
    notes: koreanNotes.busan,
    fallback: { temperature: 22, weatherCode: 1, isDay: true },
  },
  {
    city: "Jeju",
    country: "KR",
    countryName: "South Korea",
    coordinates: [33.4996, 126.5312],
    timezone: "Asia/Seoul",
    language: "ko",
    languageLabel: "Korean",
    notes: koreanNotes.jeju,
    fallback: { temperature: 20, weatherCode: 3, isDay: true },
  },
  {
    city: "Gangneung",
    country: "KR",
    countryName: "South Korea",
    coordinates: [37.7519, 128.8761],
    timezone: "Asia/Seoul",
    language: "ko",
    languageLabel: "Korean",
    notes: koreanNotes.gangneung,
    fallback: { temperature: 19, weatherCode: 2, isDay: true },
  },
  {
    city: "Jeonju",
    country: "KR",
    countryName: "South Korea",
    coordinates: [35.8242, 127.148],
    timezone: "Asia/Seoul",
    language: "ko",
    languageLabel: "Korean",
    notes: koreanNotes.jeonju,
    fallback: { temperature: 22, weatherCode: 0, isDay: true },
  },
  {
    city: "Helsinki",
    country: "FI",
    countryName: "Finland",
    coordinates: [60.1699, 24.9384],
    timezone: "Europe/Helsinki",
    language: "en",
    languageLabel: "English",
    notes: {
      clear: { note: "Everyone found a sunny corner by the harbor.", translation: "모두 항구 근처의 햇살 드는 자리를 하나씩 찾았어요." },
      cloudy: { note: "The pale sky makes the tram windows glow.", translation: "옅은 하늘빛에 트램 창문이 은은하게 빛나요." },
      rain: { note: "Wet bicycles are lined up outside the library.", translation: "도서관 밖에 젖은 자전거들이 나란히 서 있어요." },
      snow: { note: "Fresh snow has softened every sound on the street.", translation: "갓 내린 눈이 거리의 모든 소리를 부드럽게 만들었어요." },
      night: { note: "Still a little bright outside, even this late.", translation: "이렇게 늦은 시간인데도 밖이 아직 조금 환해요." },
    },
    fallback: { temperature: 14, weatherCode: 2, isDay: true },
  },
  {
    city: "Tokyo",
    country: "JP",
    countryName: "Japan",
    coordinates: [35.6762, 139.6503],
    timezone: "Asia/Tokyo",
    language: "ja",
    languageLabel: "Japanese",
    notes: {
      clear: { note: "日向のベンチで少しだけ休みました。", translation: "I rested for a moment on a sunny bench." },
      cloudy: { note: "曇り空で、街の色がいつもより静かです。", translation: "Under the cloudy sky, the city colors feel quieter than usual." },
      rain: { note: "傘に当たる雨の音を聞きながら帰りました。", translation: "I walked home listening to rain tap against my umbrella." },
      snow: { note: "駅前に珍しい雪が静かに降っています。", translation: "Rare snow is falling quietly in front of the station." },
      night: { note: "終電のあと、交差点が少し広く見えました。", translation: "After the last train, the crossing seemed a little wider." },
    },
    fallback: { temperature: 25, weatherCode: 1, isDay: false },
  },
  {
    city: "Reykjavík",
    country: "IS",
    countryName: "Iceland",
    coordinates: [64.1466, -21.9426],
    timezone: "Atlantic/Reykjavik",
    language: "en",
    languageLabel: "English",
    notes: {
      clear: { note: "The mountains looked close enough to walk to today.", translation: "오늘은 산이 걸어갈 수 있을 만큼 가까워 보였어요." },
      cloudy: { note: "Low clouds are resting on the rooftops.", translation: "낮게 내려온 구름이 지붕 위에 머물고 있어요." },
      rain: { note: "The rain changed direction twice on my short walk.", translation: "짧게 걷는 동안 비의 방향이 두 번이나 바뀌었어요." },
      snow: { note: "Snow is gathering in the quiet spaces between houses.", translation: "집과 집 사이의 조용한 틈에 눈이 쌓이고 있어요." },
      night: { note: "The windows feel especially warm against the dark.", translation: "어둠 속 창문 불빛이 유난히 따뜻하게 느껴져요." },
    },
    fallback: { temperature: 9, weatherCode: 3, isDay: true },
  },
  {
    city: "Melbourne",
    country: "AU",
    countryName: "Australia",
    coordinates: [-37.8136, 144.9631],
    timezone: "Australia/Melbourne",
    language: "en",
    languageLabel: "English",
    notes: {
      clear: { note: "Every table outside the cafe was taken by noon.", translation: "정오가 되자 카페 야외 테이블이 모두 찼어요." },
      cloudy: { note: "The city looks as if it might change its mind about the weather.", translation: "도시가 아직 어떤 날씨가 될지 망설이는 것 같아요." },
      rain: { note: "We waited beneath the tram shelter without speaking.", translation: "우리는 말없이 트램 정류장 지붕 아래에서 비를 피했어요." },
      snow: { note: "A rare dusting of snow made everyone stop and look.", translation: "드물게 내린 얇은 눈에 모두가 멈춰 바라봤어요." },
      night: { note: "Someone left a tiny bouquet on the tram seat.", translation: "누군가 트램 좌석에 작은 꽃다발을 두고 갔어요." },
    },
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
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "rain";
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
