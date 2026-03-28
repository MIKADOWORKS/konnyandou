import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0620, #120838)',
          borderRadius: 36,
        }}
      >
        {/* Moon + Stars composition */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Crescent moon */}
          <div
            style={{
              position: 'absolute',
              left: 20,
              top: 24,
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#c8a8ff',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 44,
              top: 16,
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0a0620, #120838)',
              display: 'flex',
            }}
          />

          {/* Star 1 - large */}
          <div
            style={{
              position: 'absolute',
              right: 16,
              top: 18,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#f0d060',
              display: 'flex',
            }}
          />

          {/* Star 2 - medium */}
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 60,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#f0d060',
              display: 'flex',
            }}
          />

          {/* Star 3 - small */}
          <div
            style={{
              position: 'absolute',
              right: 36,
              top: 100,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f0d060',
              opacity: 0.8,
              display: 'flex',
            }}
          />

          {/* Tiny accent dots */}
          <div
            style={{
              position: 'absolute',
              left: 10,
              bottom: 20,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#c8a8ff',
              opacity: 0.5,
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
