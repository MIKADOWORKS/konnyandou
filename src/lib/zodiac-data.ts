export interface ZodiacSign {
  sign: string;
  icon: string;
  en: string;
  dates: string;
}

export const ZODIAC: ZodiacSign[] = [
  { sign: '牡羊座', icon: '♈', en: 'Aries', dates: '3/21-4/19' },
  { sign: '牡牛座', icon: '♉', en: 'Taurus', dates: '4/20-5/20' },
  { sign: '双子座', icon: '♊', en: 'Gemini', dates: '5/21-6/21' },
  { sign: '蟹座', icon: '♋', en: 'Cancer', dates: '6/22-7/22' },
  { sign: '獅子座', icon: '♌', en: 'Leo', dates: '7/23-8/22' },
  { sign: '乙女座', icon: '♍', en: 'Virgo', dates: '8/23-9/22' },
  { sign: '天秤座', icon: '♎', en: 'Libra', dates: '9/23-10/23' },
  { sign: '蠍座', icon: '♏', en: 'Scorpio', dates: '10/24-11/22' },
  { sign: '射手座', icon: '♐', en: 'Sagittarius', dates: '11/23-12/21' },
  { sign: '山羊座', icon: '♑', en: 'Capricorn', dates: '12/22-1/19' },
  { sign: '水瓶座', icon: '♒', en: 'Aquarius', dates: '1/20-2/18' },
  { sign: '魚座', icon: '♓', en: 'Pisces', dates: '2/19-3/20' },
];
