// Deterministic pseudo-random generator (mulberry32).
// We avoid Math.random() because it diverges between SSR and client,
// which triggers a React hydration mismatch (and then next/image and
// sibling DOM can get unmounted/remounted, making content disappear).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_COUNT = 60;

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

// Computed once at module load — identical values on server and client
// because the seed and algorithm are deterministic.
const STARS: Star[] = (() => {
  const rand = mulberry32(0xc8a8ff);
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    const size = rand() * 2.5 + 0.5;
    return {
      id: i,
      left: `${(rand() * 100).toFixed(4)}%`,
      top: `${(rand() * 100).toFixed(4)}%`,
      size: Number(size.toFixed(4)),
      color: size > 2 ? '#f0d060' : '#c8b8e8',
      delay: Number((rand() * 4).toFixed(4)),
      duration: Number((rand() * 3 + 2).toFixed(4)),
    };
  });
})();

export default function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: star.color,
            opacity: 0.3,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
