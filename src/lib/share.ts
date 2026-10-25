// Story-sized (1080x1920) share card drawn in the browser, plus the share sheet.
import type { Lang } from './i18n'

export interface CardInfo {
  lang: Lang
  season: string // "SEASON 01 // GHOST SIGNAL"
  heading: string // "ACCESS GRANTED"
  quest: string
  level: string // "LEVEL 02"
  fragment?: string
  fragmentLabel: string
  xp: string
  callsign: string
  runnerId: string
  footer: string // "JOIN THE SIGNAL"
}

function chamferPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: number) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w - c, y)
  ctx.lineTo(x + w, y + c)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + c, y + h)
  ctx.lineTo(x, y + h - c)
  ctx.closePath()
}

// Shrinks the font until the text fits the card width.
function fitFont(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, size: number, maxWidth = 960) {
  ctx.font = font(size)
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 4
    ctx.font = font(size)
  }
}

function glowText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, blur = 24) {
  ctx.save()
  ctx.fillStyle = color
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.fillText(text, x, y)
  ctx.shadowBlur = 0
  ctx.fillText(text, x, y)
  ctx.restore()
}

export async function makeShareCard(info: CardInfo): Promise<Blob> {
  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  try {
    await Promise.all([
      document.fonts.load('900 100px Orbitron'),
      document.fonts.load('48px "Share Tech Mono"'),
      document.fonts.load('700 48px Cairo'),
    ])
  } catch {
    // Fall back to system fonts.
  }
  const display = (size: number) => `900 ${size}px Orbitron, Cairo, sans-serif`
  const mono = (size: number) => `${size}px "Share Tech Mono", Cairo, monospace`

  // Void + grid + glows
  ctx.fillStyle = '#04050a'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#0f1b31'
  ctx.lineWidth = 2
  for (let x = 0; x <= W; x += 60) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y <= H; y += 60) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (const [x, y, color] of [[540, 0, '#00f0ff'], [540, 1920, '#ff2bd6']] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 900)
    g.addColorStop(0, `${color}40`)
    g.addColorStop(1, `${color}00`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  ctx.textAlign = 'center'
  ctx.direction = info.lang === 'ar' ? 'rtl' : 'ltr'

  // Header
  ctx.font = display(150)
  glowText(ctx, 'IRL', W / 2, 250, '#f5f000', 30)
  ctx.font = mono(40)
  ctx.fillStyle = '#7183a8'
  ctx.fillText(info.season, W / 2, 330)

  // ACCESS GRANTED with a chromatic offset
  fitFont(ctx, info.heading, display, 96)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = '#ff2bd6'
  ctx.fillText(info.heading, W / 2 - 6, 520)
  ctx.fillStyle = '#00f0ff'
  ctx.fillText(info.heading, W / 2 + 6, 520)
  ctx.globalAlpha = 1
  glowText(ctx, info.heading, W / 2, 520, '#3dff8b', 20)

  // Quest
  fitFont(ctx, info.level, mono, 44)
  ctx.fillStyle = '#7183a8'
  ctx.fillText(info.level, W / 2, 640)
  fitFont(ctx, info.quest, display, 76)
  glowText(ctx, info.quest, W / 2, 740, '#ffffff', 10)

  // Fragment box
  const box = { x: 290, y: 840, w: 500, h: 500 }
  ctx.save()
  ctx.shadowColor = '#f5f000'
  ctx.shadowBlur = 50
  chamferPath(ctx, box.x, box.y, box.w, box.h, 60)
  ctx.fillStyle = '#0a0e18'
  ctx.fill()
  ctx.restore()
  chamferPath(ctx, box.x, box.y, box.w, box.h, 60)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#f5f000'
  ctx.stroke()
  ctx.font = display(320)
  glowText(ctx, info.fragment ?? '✦', W / 2, box.y + 380, '#f5f000', 40)
  ctx.font = mono(40)
  ctx.fillStyle = '#f5f000'
  ctx.fillText(info.fragmentLabel, W / 2, box.y + box.h + 80)

  // XP
  ctx.font = display(84)
  glowText(ctx, info.xp, W / 2, 1580, '#00f0ff', 24)

  // Runner
  fitFont(ctx, `${info.callsign} // ${info.runnerId}`, mono, 46)
  ctx.fillStyle = '#e6f1ff'
  ctx.fillText(`${info.callsign} // ${info.runnerId}`, W / 2, 1690)

  // Footer
  ctx.font = display(44)
  glowText(ctx, info.footer, W / 2, H - 100, '#ff2bd6', 18)

  // Scanlines
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'),
  )
}

// Opens the phone's share sheet with the card, or downloads it on desktop.
export async function shareImage(blob: Blob, filename: string, text: string): Promise<'shared' | 'saved' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  downloadBlob(blob, filename)
  return 'saved'
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
