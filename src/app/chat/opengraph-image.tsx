import { ImageResponse } from 'next/og'
import { OgPageLayout, loadNoaAvatar } from '@/lib/og-background'

export const alt = 'ノアに相談 | こんにゃん堂'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const avatarData = await loadNoaAvatar().catch(() => null)
  const avatarSrc = avatarData
    ? `data:image/png;base64,${Buffer.from(avatarData).toString('base64')}`
    : undefined

  return new ImageResponse(
    <OgPageLayout
      icon="💬"
      title="ノアに相談"
      subtitle="AIフレンド・ノアになんでも気軽に相談しよう"
      avatarSrc={avatarSrc}
    />,
    { ...size },
  )
}
