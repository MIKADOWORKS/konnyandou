export interface ZodiacPost {
  sign: string;
  icon: string;
  stars: number;
  message: string;
  luckyColor: string;
  tsukiComment: string;
}

export interface DailyHoroscopeData {
  date: string;
  weekday: string;
  posts: ZodiacPost[];
}
