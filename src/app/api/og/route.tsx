import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { OgBackground, OgBrandFooter } from '@/lib/og-background';

export const runtime = 'edge';

const OG_SIZE = { width: 1200, height: 630 };

function TarotSingleLayout({
  card,
  en,
  emoji,
  reversed,
}: {
  card: string;
  en: string;
  emoji: string;
  reversed: boolean;
}) {
  return (
    <OgBackground>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#c8a8ff',
            letterSpacing: '0.1em',
            display: 'flex',
            marginBottom: 16,
          }}
        >
          🔮 タロット占い
        </div>

        <div
          style={{
            fontSize: 80,
            display: 'flex',
            marginBottom: 12,
          }}
        >
          {emoji}
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#f0d060',
            letterSpacing: '0.05em',
            textShadow: '0 0 40px rgba(240, 208, 96, 0.3)',
            display: 'flex',
          }}
        >
          {card}
        </div>

        <div
          style={{
            fontSize: 28,
            color: 'rgba(200, 168, 255, 0.8)',
            marginTop: 8,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <span style={{ display: 'flex' }}>{en}</span>
          <span
            style={{
              display: 'flex',
              fontSize: 22,
              padding: '4px 16px',
              borderRadius: 20,
              background: reversed
                ? 'rgba(200, 100, 100, 0.3)'
                : 'rgba(100, 200, 150, 0.3)',
              border: reversed
                ? '1px solid rgba(200, 100, 100, 0.5)'
                : '1px solid rgba(100, 200, 150, 0.5)',
              color: reversed ? '#e8a0a0' : '#a0e8c0',
            }}
          >
            {reversed ? '逆位置' : '正位置'}
          </span>
        </div>
      </div>
      <OgBrandFooter />
    </OgBackground>
  );
}

function TarotSpreadLayout({
  cards,
}: {
  cards: { name: string; emoji: string; reversed: boolean }[];
}) {
  const positions = ['過去', '現在', '未来'];
  return (
    <OgBackground>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#c8a8ff',
            letterSpacing: '0.1em',
            display: 'flex',
            marginBottom: 32,
          }}
        >
          🔮 タロット3枚スプレッド
        </div>

        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 280,
                padding: '24px 16px',
                borderRadius: 16,
                background: 'rgba(200, 168, 255, 0.08)',
                border: '1px solid rgba(200, 168, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: 'rgba(200, 168, 255, 0.6)',
                  marginBottom: 12,
                  display: 'flex',
                }}
              >
                {positions[i]}
              </div>
              <div style={{ fontSize: 48, display: 'flex', marginBottom: 8 }}>
                {card.emoji}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#f0d060',
                  display: 'flex',
                  textAlign: 'center',
                }}
              >
                {card.name}
              </div>
              <div
                style={{
                  fontSize: 16,
                  marginTop: 8,
                  padding: '2px 12px',
                  borderRadius: 12,
                  display: 'flex',
                  background: card.reversed
                    ? 'rgba(200, 100, 100, 0.3)'
                    : 'rgba(100, 200, 150, 0.3)',
                  color: card.reversed ? '#e8a0a0' : '#a0e8c0',
                }}
              >
                {card.reversed ? '逆位置' : '正位置'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <OgBrandFooter />
    </OgBackground>
  );
}

function ZodiacLayout({
  sign,
  icon,
  overallStars,
}: {
  sign: string;
  icon: string;
  overallStars: number;
}) {
  return (
    <OgBackground>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#c8a8ff',
            letterSpacing: '0.1em',
            display: 'flex',
            marginBottom: 16,
          }}
        >
          ⭐ 今日の運勢
        </div>

        <div
          style={{
            fontSize: 80,
            display: 'flex',
            marginBottom: 12,
          }}
        >
          {icon}
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#f0d060',
            letterSpacing: '0.05em',
            textShadow: '0 0 40px rgba(240, 208, 96, 0.3)',
            display: 'flex',
          }}
        >
          {sign}
        </div>

        <div
          style={{
            fontSize: 44,
            marginTop: 20,
            display: 'flex',
            gap: 8,
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                color: i < overallStars ? '#f0d060' : 'rgba(200, 168, 255, 0.3)',
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <OgBrandFooter />
    </OgBackground>
  );
}

function CompatibilityLayout({
  person1,
  sign1,
  icon1,
  person2,
  sign2,
  icon2,
  score,
}: {
  person1: string;
  sign1: string;
  icon1: string;
  person2: string;
  sign2: string;
  icon2: string;
  score: number;
}) {
  return (
    <OgBackground>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: '#c8a8ff',
            letterSpacing: '0.1em',
            display: 'flex',
            marginBottom: 24,
          }}
        >
          💕 相性占い
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 72, display: 'flex' }}>{icon1}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f0d060',
                display: 'flex',
              }}
            >
              {sign1}
            </div>
            {person1 && (
              <div style={{ fontSize: 20, color: 'rgba(200, 168, 255, 0.7)', display: 'flex' }}>
                {person1}
              </div>
            )}
          </div>

          <div style={{ fontSize: 48, color: 'rgba(200, 168, 255, 0.4)', display: 'flex' }}>
            ×
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 72, display: 'flex' }}>{icon2}</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#f0d060',
                display: 'flex',
              }}
            >
              {sign2}
            </div>
            {person2 && (
              <div style={{ fontSize: 20, color: 'rgba(200, 168, 255, 0.7)', display: 'flex' }}>
                {person2}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: '#f4a8c8',
            textShadow: '0 0 40px rgba(244, 168, 200, 0.4)',
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span style={{ display: 'flex' }}>{score}</span>
          <span style={{ fontSize: 36, color: 'rgba(244, 168, 200, 0.7)', display: 'flex' }}>点</span>
        </div>
      </div>
      <OgBrandFooter />
    </OgBackground>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');

  try {
    if (type === 'tarot') {
      const card = (searchParams.get('card') || '').slice(0, 20);
      const en = (searchParams.get('en') || '').slice(0, 30);
      const emoji = (searchParams.get('emoji') || '🃏').slice(0, 4);
      const reversed = searchParams.get('rev') === '1';

      if (!card) throw new Error('missing card');

      return new ImageResponse(
        <TarotSingleLayout card={card} en={en} emoji={emoji} reversed={reversed} />,
        {
          ...OG_SIZE,
          headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
        },
      );
    }

    if (type === 'spread') {
      const cards = [0, 1, 2].map((i) => ({
        name: (searchParams.get(`c${i}`) || '').slice(0, 20),
        emoji: (searchParams.get(`e${i}`) || '🃏').slice(0, 4),
        reversed: searchParams.get(`r${i}`) === '1',
      }));

      if (cards.some((c) => !c.name)) throw new Error('missing card data');

      return new ImageResponse(<TarotSpreadLayout cards={cards} />, {
        ...OG_SIZE,
        headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
      });
    }

    if (type === 'zodiac') {
      const sign = (searchParams.get('sign') || '').slice(0, 10);
      const icon = (searchParams.get('icon') || '⭐').slice(0, 4);
      const overallStars = Math.min(5, Math.max(1, Number(searchParams.get('stars')) || 3));

      if (!sign) throw new Error('missing sign');

      return new ImageResponse(
        <ZodiacLayout sign={sign} icon={icon} overallStars={overallStars} />,
        {
          ...OG_SIZE,
          headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
        },
      );
    }

    if (type === 'compatibility') {
      const person1 = (searchParams.get('p1') || '').slice(0, 20);
      const sign1 = (searchParams.get('s1') || '').slice(0, 10);
      const icon1 = (searchParams.get('i1') || '⭐').slice(0, 4);
      const person2 = (searchParams.get('p2') || '').slice(0, 20);
      const sign2 = (searchParams.get('s2') || '').slice(0, 10);
      const icon2 = (searchParams.get('i2') || '⭐').slice(0, 4);
      const score = Math.min(100, Math.max(0, Number(searchParams.get('score')) || 0));

      if (!sign1 || !sign2) throw new Error('missing signs');

      return new ImageResponse(
        <CompatibilityLayout
          person1={person1}
          sign1={sign1}
          icon1={icon1}
          person2={person2}
          sign2={sign2}
          icon2={icon2}
          score={score}
        />,
        {
          ...OG_SIZE,
          headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
        },
      );
    }

    throw new Error('invalid type');
  } catch {
    // Fallback: return a generic branded image
    return new ImageResponse(
      <OgBackground>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: '#f0d060',
              letterSpacing: '0.05em',
              textShadow: '0 0 40px rgba(240, 208, 96, 0.3)',
              display: 'flex',
            }}
          >
            こんにゃん堂
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#c8a8ff',
              marginTop: 24,
              display: 'flex',
            }}
          >
            AIフレンド・ノアとツキのタロット占い
          </div>
        </div>
      </OgBackground>,
      {
        ...OG_SIZE,
        headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
      },
    );
  }
}
