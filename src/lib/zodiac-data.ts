export interface ZodiacSign {
  sign: string;
  icon: string;
  en: string;
  dates: string;
  element: string;
  ruling: string;
  traits: string[];
  description: string;
}

export const ZODIAC: ZodiacSign[] = [
  {
    sign: '牡羊座',
    icon: '♈',
    en: 'Aries',
    dates: '3/21-4/19',
    element: '火',
    ruling: '火星',
    traits: ['情熱的', 'リーダーシップ', '行動力', 'チャレンジ精神'],
    description:
      '12星座のトップバッターである牡羊座は、生まれながらのパイオニア。新しいことへの挑戦を恐れず、持ち前の行動力で道を切り開いていきます。',
  },
  {
    sign: '牡牛座',
    icon: '♉',
    en: 'Taurus',
    dates: '4/20-5/20',
    element: '地',
    ruling: '金星',
    traits: ['安定志向', '感性豊か', '忍耐力', '誠実'],
    description:
      '地に足のついた安定感が魅力の牡牛座。五感に優れ、美しいものや心地よいものを見極める力があります。',
  },
  {
    sign: '双子座',
    icon: '♊',
    en: 'Gemini',
    dates: '5/21-6/21',
    element: '風',
    ruling: '水星',
    traits: ['知的好奇心', 'コミュニケーション力', '柔軟性', '多才'],
    description:
      '知的好奇心が旺盛で、情報収集と発信が得意な双子座。軽やかなフットワークで多方面に才能を発揮します。',
  },
  {
    sign: '蟹座',
    icon: '♋',
    en: 'Cancer',
    dates: '6/22-7/22',
    element: '水',
    ruling: '月',
    traits: ['共感力', '家庭的', '直感力', '包容力'],
    description:
      '深い愛情と共感力を持つ蟹座。大切な人を守りたいという気持ちが強く、居心地のいい空間を作るのが上手です。',
  },
  {
    sign: '獅子座',
    icon: '♌',
    en: 'Leo',
    dates: '7/23-8/22',
    element: '火',
    ruling: '太陽',
    traits: ['華やかさ', '自信', '創造力', '寛大'],
    description:
      '太陽のように周りを明るくする獅子座。生まれながらの存在感と自信で、自然と注目を集めるスター気質の持ち主です。',
  },
  {
    sign: '乙女座',
    icon: '♍',
    en: 'Virgo',
    dates: '8/23-9/22',
    element: '地',
    ruling: '水星',
    traits: ['分析力', '几帳面', '奉仕精神', '実務能力'],
    description:
      '細やかな観察力と分析力を持つ乙女座。完璧を目指す姿勢と、人の役に立ちたいという奉仕の心が特徴です。',
  },
  {
    sign: '天秤座',
    icon: '♎',
    en: 'Libra',
    dates: '9/23-10/23',
    element: '風',
    ruling: '金星',
    traits: ['バランス感覚', '社交性', '美意識', '公平さ'],
    description:
      '調和とバランスを大切にする天秤座。優れた審美眼と社交性で、人間関係を円滑にするのが得意です。',
  },
  {
    sign: '蠍座',
    icon: '♏',
    en: 'Scorpio',
    dates: '10/24-11/22',
    element: '水',
    ruling: '冥王星',
    traits: ['洞察力', '集中力', '情熱', '探究心'],
    description:
      '深い洞察力と強い意志を持つ蠍座。表面に見えない本質を見抜く力があり、一度決めたことはとことん追求します。',
  },
  {
    sign: '射手座',
    icon: '♐',
    en: 'Sagittarius',
    dates: '11/23-12/21',
    element: '火',
    ruling: '木星',
    traits: ['冒険心', '楽観的', '哲学的', '自由'],
    description:
      '自由を愛し、未知の世界への冒険を求める射手座。ポジティブなエネルギーと広い視野で、人生を楽しむ達人です。',
  },
  {
    sign: '山羊座',
    icon: '♑',
    en: 'Capricorn',
    dates: '12/22-1/19',
    element: '地',
    ruling: '土星',
    traits: ['責任感', '忍耐力', '野心', '堅実'],
    description:
      '目標に向かって着実に歩みを進める山羊座。強い責任感と忍耐力で、どんな困難も乗り越えて成果を上げます。',
  },
  {
    sign: '水瓶座',
    icon: '♒',
    en: 'Aquarius',
    dates: '1/20-2/18',
    element: '風',
    ruling: '天王星',
    traits: ['独創性', '博愛精神', '革新的', '自立'],
    description:
      '独自の視点で世界を見る水瓶座。常識にとらわれない発想力と、すべての人の幸せを願う博愛の精神を持ちます。',
  },
  {
    sign: '魚座',
    icon: '♓',
    en: 'Pisces',
    dates: '2/19-3/20',
    element: '水',
    ruling: '海王星',
    traits: ['想像力', '共感力', '直感', '献身的'],
    description:
      '豊かな想像力と深い共感力を持つ魚座。目に見えないものを感じ取る力があり、芸術やスピリチュアルな分野に優れます。',
  },
];
