export default function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center gap-3 animate-fadeSlideIn">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-knd-lavender"
            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <div className="text-knd-lavender/60 text-xs font-body">ツキに聞いてるよ...</div>
    </div>
  );
}
