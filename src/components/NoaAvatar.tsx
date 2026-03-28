'use client';

import Image from 'next/image';

/**
 * ノアのアバター画像
 *
 * 差し替え手順:
 *   /public/images/noa-avatar.png に画像を配置するだけでOK
 *   推奨: 正方形 / 256x256px以上 / PNG or WebP
 *
 * 画像がない場合は絵文字フォールバックが表示される
 */

const NOA_IMAGE_PATH = '/images/noa-avatar.png';

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
      className="rounded-full overflow-hidden shrink-0 bg-knd-purple/30 relative"
      style={{
        width: size,
        height: size,
        border: `2px solid ${borderColor}`,
      }}
    >
      <Image
        src={NOA_IMAGE_PATH}
        alt="ノア"
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={(e) => {
          // 画像がなければ絵文字フォールバック
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        className="absolute inset-0 items-center justify-center hidden"
        style={{ fontSize: size * 0.5 }}
      >
        🔮
      </div>
    </div>
  );
}
