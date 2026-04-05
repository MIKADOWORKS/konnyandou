import { ImageResponse } from 'next/og'
import { OgBackground, OgDivider, loadNoaAvatar } from '@/lib/og-background'

export const alt = 'こんにゃん堂 - AIフレンド・ノアとツキのタロット占い'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const avatarData = await loadNoaAvatar().catch(() => null)
  const avatarSrc = avatarData
    ? `data:image/png;base64,${Buffer.from(avatarData).toString('base64')}`
    : undefined

  return new ImageResponse(
    (
      <OgBackground>
        {/* Main content area */}
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
          {/* Noa avatar */}
          {avatarSrc && (
            <img
              src={avatarSrc}
              width={120}
              height={120}
              style={{
                borderRadius: '50%',
                border: '3px solid rgba(240, 208, 96, 0.4)',
                marginBottom: 24,
              }}
            />
          )}

          {/* Site name */}
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

          <OgDivider />

          {/* Catchcopy */}
          <div
            style={{
              fontSize: 36,
              color: '#c8a8ff',
              letterSpacing: '0.08em',
              display: 'flex',
            }}
          >
            AIフレンド・ノアとツキのタロット占い
          </div>

          {/* Sub description */}
          <div
            style={{
              fontSize: 22,
              color: 'rgba(200, 168, 255, 0.6)',
              marginTop: 20,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            あなたの毎日にヒントをお届け
          </div>
        </div>
      </OgBackground>
    ),
    {
      ...size,
    },
  )
}
