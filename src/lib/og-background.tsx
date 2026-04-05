import { type ReactNode } from 'react';

const stars = [
  { x: 80, y: 60, r: 3, color: '#c8a8ff' },
  { x: 200, y: 120, r: 2, color: '#f0d060' },
  { x: 350, y: 80, r: 2.5, color: '#c8a8ff' },
  { x: 500, y: 50, r: 2, color: '#f0d060' },
  { x: 700, y: 90, r: 3, color: '#c8a8ff' },
  { x: 850, y: 140, r: 2, color: '#f0d060' },
  { x: 950, y: 60, r: 2.5, color: '#c8a8ff' },
  { x: 1050, y: 110, r: 3, color: '#f0d060' },
  { x: 1120, y: 70, r: 2, color: '#c8a8ff' },
  { x: 150, y: 500, r: 2.5, color: '#f0d060' },
  { x: 300, y: 550, r: 2, color: '#c8a8ff' },
  { x: 450, y: 520, r: 3, color: '#f0d060' },
  { x: 750, y: 530, r: 2, color: '#c8a8ff' },
  { x: 900, y: 560, r: 2.5, color: '#f0d060' },
  { x: 1050, y: 540, r: 2, color: '#c8a8ff' },
  { x: 1150, y: 500, r: 3, color: '#f0d060' },
  { x: 60, y: 300, r: 2, color: '#c8a8ff' },
  { x: 1140, y: 320, r: 2.5, color: '#f0d060' },
  { x: 100, y: 180, r: 1.5, color: '#f0d060' },
  { x: 1100, y: 200, r: 1.5, color: '#c8a8ff' },
  { x: 250, y: 450, r: 1.5, color: '#c8a8ff' },
  { x: 1000, y: 470, r: 1.5, color: '#f0d060' },
];

export function OgBackground({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background:
          'linear-gradient(135deg, #0a0620 0%, #120838 50%, #0e0628 100%)',
      }}
    >
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.r * 2,
            height: star.r * 2,
            borderRadius: '50%',
            background: star.color,
            opacity: 0.7,
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 80,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'transparent',
          boxShadow: '15px -10px 0 0 #f0d060',
          opacity: 0.3,
          display: 'flex',
        }}
      />

      {children}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #c8a8ff, #f0d060, #c8a8ff)',
          opacity: 0.6,
          display: 'flex',
        }}
      />
    </div>
  );
}

export function OgBrandFooter() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 22,
          color: 'rgba(200, 168, 255, 0.6)',
          letterSpacing: '0.08em',
          display: 'flex',
        }}
      >
        こんにゃん堂 — AI占い師ノア
      </div>
    </div>
  );
}

export function OgDivider() {
  return (
    <div
      style={{
        width: 400,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #c8a8ff, transparent)',
        marginTop: 24,
        marginBottom: 24,
        display: 'flex',
      }}
    />
  );
}

/**
 * ノアアバター画像をArrayBufferとして読み込む。
 * opengraph-image.tsx や /api/og で使用。
 */
export async function loadNoaAvatar(): Promise<ArrayBuffer> {
  const url = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/images/noa-avatar.png`
    : 'http://localhost:3000/images/noa-avatar.png';
  const res = await fetch(url);
  return res.arrayBuffer();
}

/**
 * 各ページ共通のOGP画像レイアウト。
 * アイコン + タイトル + サブタイトル + ノアアバターを表示。
 */
export function OgPageLayout({
  icon,
  title,
  subtitle,
  avatarSrc,
}: {
  icon: string;
  title: string;
  subtitle: string;
  avatarSrc?: string;
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
          padding: '60px 80px',
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 64, display: 'flex', marginBottom: 16 }}>
          {icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#f0d060',
            letterSpacing: '0.05em',
            textShadow: '0 0 40px rgba(240, 208, 96, 0.3)',
            display: 'flex',
          }}
        >
          {title}
        </div>

        <OgDivider />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: '#c8a8ff',
            letterSpacing: '0.08em',
            display: 'flex',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Noa avatar */}
      {avatarSrc && (
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            right: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={avatarSrc}
            width={56}
            height={56}
            style={{ borderRadius: '50%', border: '2px solid rgba(240, 208, 96, 0.4)' }}
          />
          <div style={{ fontSize: 20, color: 'rgba(200, 168, 255, 0.6)', display: 'flex' }}>
            こんにゃん堂
          </div>
        </div>
      )}
    </OgBackground>
  );
}
