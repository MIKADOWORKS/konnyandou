'use client';

interface ConstellationDecorProps {
  className?: string;
}

export default function ConstellationDecor({ className }: ConstellationDecorProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={`absolute opacity-[0.12] ${className ?? ''}`}
      width="200"
      height="120"
    >
      <circle cx="20" cy="30" r="2.5" fill="#c8a8ff" />
      <circle cx="60" cy="15" r="2" fill="#c8a8ff" />
      <circle cx="95" cy="45" r="2.5" fill="#c8a8ff" />
      <circle cx="130" cy="20" r="2" fill="#c8a8ff" />
      <circle cx="160" cy="55" r="2.5" fill="#c8a8ff" />
      <circle cx="180" cy="90" r="2" fill="#c8a8ff" />
      <line x1="20" y1="30" x2="60" y2="15" stroke="#c8a8ff" strokeWidth="0.8" />
      <line x1="60" y1="15" x2="95" y2="45" stroke="#c8a8ff" strokeWidth="0.8" />
      <line x1="95" y1="45" x2="130" y2="20" stroke="#c8a8ff" strokeWidth="0.8" />
      <line x1="130" y1="20" x2="160" y2="55" stroke="#c8a8ff" strokeWidth="0.8" />
      <line x1="160" y1="55" x2="180" y2="90" stroke="#c8a8ff" strokeWidth="0.8" />
    </svg>
  );
}
