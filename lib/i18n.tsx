"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "ko" | "en";
export type TemperatureUnit = "celsius" | "fahrenheit";

const messages = {
  ko: {
    heroDate: "일요일 · 6월 7일 · 어딘가",
    heroTitle1: "지금 그곳의 날씨,",
    heroTitle2: "그곳의 사람이.",
    heroBody: "예보보다 가까운, 현지의 체감과 한마디.",
    wander: "천천히 여행하기",
    fromWhere: "당신이 있는 곳에서",
    locationTitle: "오늘, 당신이 있는 곳은?",
    locationBody: "도시를 찾고, 지금의 날씨에 짧은 한 줄을 남겨보세요.",
    yourCity: "도시 이름",
    useLocation: "현재 위치 사용",
    findingSky: "하늘을 찾는 중...",
    locationPrivacy: "현재 위치를 선택해도 정확한 좌표는 게시되지 않습니다.",
    myPostcard: "나의 엽서",
    noteLabel: "오늘의 한 줄",
    nickname: "닉네임",
    nicknameOptional: "선택 사항",
    nicknamePlaceholder: "예: 비오는날산책",
    anonymous: "익명의 여행자",
    editHint: "직접 수정해 주세요",
    notePlaceholder: "지금 이곳에서 있었던 작은 일을 적어보세요.",
    notePublic: "이 문장은 다른 방문자에게 공개됩니다.",
    localTime: "현지 시각",
    otherCity: "다른 도시",
    send: "모두에게 보내기",
    sending: "보내는 중...",
    sent: "엽서를 보냈어요",
    sendNotice: "보내면 도시, 날씨와 이 문장이 다른 방문자에게 공개됩니다.",
    sentMoments: "도착한 순간들",
    recentPostcards: "방금 도착한 엽서",
    postcard: "엽서",
    translated: "번역",
    fromPeople: "이곳에서 온 기록",
    note: "개의 기록",
    noNotes: "아직 이 도시에서 도착한 기록이 없어요. 첫 번째 엽서를 남겨보세요.",
    moreMoments: "개의 순간 더 보기",
    justNow: "방금",
    minutesAgo: "분 전",
    hoursAgo: "시간 전",
    daysAgo: "일 전",
    worldContinues: "세계의 하루는 계속됩니다.",
    comeBack: "나중에 다시 와보세요. 하늘이 달라져 있을지도 몰라요.",
    footerCredit: "날씨 제공 Open-Meteo · 기본 기록은 창작 문장입니다",
    postcardsLabel: "세계 곳곳에서 온 엽서",
    soundOn: "배경음 켜기",
    soundOff: "배경음 끄기",
    language: "언어",
    humidity: "습도",
    feelsLike: "체감",
    wind: "바람",
    precipitation: "강수",
    temperatureUnit: "온도 단위",
  },
  en: {
    heroDate: "Sunday · June 7 · Somewhere",
    heroTitle1: "Weather right now,",
    heroTitle2: "from someone there.",
    heroBody: "Closer than a forecast: local conditions, felt and shared.",
    wander: "Wander slowly",
    fromWhere: "From where you are",
    locationTitle: "Where are you today?",
    locationBody: "Find your city and leave one small line about the day.",
    yourCity: "Your city",
    useLocation: "Use current location",
    findingSky: "Finding the sky...",
    locationPrivacy: "Your precise coordinates are never published.",
    myPostcard: "My postcard",
    noteLabel: "Your one line",
    nickname: "Nickname",
    nicknameOptional: "optional",
    nicknamePlaceholder: "e.g. rainywalker",
    anonymous: "Anonymous traveler",
    editHint: "Make it your own",
    notePlaceholder: "Write down one small thing that happened here.",
    notePublic: "This sentence will be visible to other visitors.",
    localTime: "Local time",
    otherCity: "Other city",
    send: "Send to everyone",
    sending: "Sending...",
    sent: "Postcard sent",
    sendNotice:
      "Your city, weather, and this sentence will be visible to other visitors.",
    sentMoments: "Sent moments",
    recentPostcards: "Postcards just arrived",
    postcard: "Postcard",
    translated: "translated",
    fromPeople: "From people in",
    note: "notes",
    noNotes: "No notes have arrived from this city yet. Send the first one.",
    moreMoments: "more moments",
    justNow: "just now",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    daysAgo: "d ago",
    worldContinues: "The world continues.",
    comeBack: "Come back later. The sky may have changed.",
    footerCredit: "Weather by Open-Meteo · Curated notes are imagined",
    postcardsLabel: "Postcards from around the world",
    soundOn: "Turn ambient sound on",
    soundOff: "Turn ambient sound off",
    language: "Language",
    humidity: "Humidity",
    feelsLike: "Feels like",
    wind: "Wind",
    precipitation: "Rain",
    temperatureUnit: "Temperature unit",
  },
} as const;

type MessageKey = keyof (typeof messages)["ko"];
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");
  const [temperatureUnit, setTemperatureUnit] =
    useState<TemperatureUnit>("celsius");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("today-somewhere:locale");
    if (saved === "ko" || saved === "en") setLocale(saved);
    const savedUnit = window.localStorage.getItem(
      "today-somewhere:temperature-unit",
    );
    if (savedUnit === "celsius" || savedUnit === "fahrenheit") {
      setTemperatureUnit(savedUnit);
    }
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) return;
    document.documentElement.lang = locale;
    window.localStorage.setItem("today-somewhere:locale", locale);
    window.localStorage.setItem(
      "today-somewhere:temperature-unit",
      temperatureUnit,
    );
  }, [hasLoadedPreference, locale, temperatureUnit]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      temperatureUnit,
      setTemperatureUnit,
      t: (key: MessageKey) => messages[locale][key],
    }),
    [locale, temperatureUnit],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}

const koreanWeather: Record<string, string> = {
  Clear: "맑음",
  "Mostly clear": "대체로 맑음",
  "Partly cloudy": "구름 조금",
  Overcast: "흐림",
  Foggy: "안개",
  "Rime fog": "상고대 안개",
  "Light drizzle": "약한 이슬비",
  Drizzle: "이슬비",
  "Heavy drizzle": "강한 이슬비",
  "Light rain": "약한 비",
  Rain: "비",
  "Heavy rain": "강한 비",
  "Light snow": "약한 눈",
  Snow: "눈",
  "Heavy snow": "강한 눈",
  "Rain showers": "소나기",
  "Heavy showers": "강한 소나기",
  "Snow showers": "눈 소나기",
  "Heavy snow showers": "강한 눈 소나기",
  Thunderstorm: "뇌우",
  "Changing skies": "변화하는 하늘",
};

const koreanCities: Record<string, string> = {
  Seoul: "서울",
  Busan: "부산",
  Jeju: "제주",
  Gangneung: "강릉",
  Jeonju: "전주",
  Helsinki: "헬싱키",
  Tokyo: "도쿄",
  Reykjavík: "레이캬비크",
  Melbourne: "멜버른",
  Daegu: "대구",
};

const koreanCountries: Record<string, string> = {
  "South Korea": "대한민국",
  Finland: "핀란드",
  Japan: "일본",
  Iceland: "아이슬란드",
  Australia: "호주",
};

export function localizedWeather(label: string, locale: Locale) {
  return locale === "ko" ? koreanWeather[label] ?? label : label;
}

export function localizedCity(city: string, locale: Locale) {
  return locale === "ko" ? koreanCities[city] ?? city : city;
}

export function localizedCountry(country: string, locale: Locale) {
  return locale === "ko" ? koreanCountries[country] ?? country : country;
}

export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit,
) {
  if (unit === "fahrenheit") {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}
