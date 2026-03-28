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
