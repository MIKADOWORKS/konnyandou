'use client';

interface NoaAvatarProps {
  size?: number;
  borderColor?: string;
}

export default function NoaAvatar({
  size = 50,
  borderColor = 'rgba(240, 208, 96, 0.4)',
}: NoaAvatarProps) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0 bg-knd-purple/30 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
      }}
    >
      <span className="text-2xl" style={{ fontSize: size * 0.5 }}>🔮</span>
    </div>
  );
}
