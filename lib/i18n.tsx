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

const messages = {
  ko: {
    heroDate: "일요일 · 6월 7일 · 어딘가",
    heroTitle1: "멀리 있는",
    heroTitle2: "평범한 하루.",
    heroBody: "세계 곳곳의 날씨와 작은 순간을 모은 조용한 엽서함.",
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
  },
  en: {
    heroDate: "Sunday · June 7 · Somewhere",
    heroTitle1: "Ordinary days,",
    heroTitle2: "far away.",
    heroBody:
      "A quiet collection of weather and small moments from people around the world.",
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
  },
} as const;

type MessageKey = keyof (typeof messages)["ko"];
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("today-somewhere:locale");
    if (saved === "ko" || saved === "en") setLocale(saved);
    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) return;
    document.documentElement.lang = locale;
    window.localStorage.setItem("today-somewhere:locale", locale);
  }, [hasLoadedPreference, locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: MessageKey) => messages[locale][key],
    }),
    [locale],
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
