'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
}

export function ParticipantQRCode({
  value,
  size = 256,
  level = 'H',
  includeMargin = true,
}: QRCodeProps) {
  if (!value) {
    return (
      <div className="w-64 h-64 bg-gray-200 rounded flex items-center justify-center">
        QR unavailable
      </div>
    )
  }

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level={level}
      includeMargin={includeMargin}
      title="Participant QR Code"
    />
  )
}

