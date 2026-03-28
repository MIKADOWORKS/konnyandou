export default function PositionBadge({ isReversed }: { isReversed: boolean }) {
  return (
    <div className="text-center mb-4">
      <span
        className="inline-block px-3.5 py-1 rounded-full text-[11px] font-body border"
        style={{
          background: isReversed ? 'rgba(180, 100, 200, 0.2)' : 'rgba(240, 208, 96, 0.15)',
          borderColor: isReversed ? 'rgba(180, 100, 200, 0.3)' : 'rgba(240, 208, 96, 0.3)',
          color: isReversed ? '#c8a0e0' : '#f0d060',
        }}
      >
        {isReversed ? '逆位置' : '正位置'}
      </span>
    </div>
  );
}
