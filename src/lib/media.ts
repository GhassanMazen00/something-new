// Photo compression, share cards and invite links.

import type { Lang } from './i18n'

// Shrinks a camera photo (often 4000px+) to something that fits in local storage.
export async function compressImage(file: File, maxSide = 900, quality = 0.75): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}

export interface CardInfo {
  lang: Lang
  heading: string // "QUEST COMPLETE"
  title: string
  emoji: string
  color: string
  xpLine: string // "+100 XP"
  rarity: string
  streak: string
  school: string
  tagline: string
  photo?: string
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

// Draws a 1080x1920 story-sized card (Instagram / TikTok / WhatsApp status).
export async function makeShareCard(info: CardInfo): Promise<Blob> {
  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  try {
    await Promise.all([document.fonts.load('900 100px Rubik'), document.fonts.load('700 60px Rubik')])
  } catch {
    // Fall back to system font.
  }
  const font = (weight: number, size: number) => `${weight} ${size}px Rubik, system-ui, sans-serif`

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1d1240')
  bg.addColorStop(1, '#0b0b12')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  for (const [x, y, color] of [[900, 260, '#c6ff3d'], [120, 1650, '#ff4da6']] as const) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 520)
    g.addColorStop(0, `${color}55`)
    g.addColorStop(1, `${color}00`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  ctx.direction = info.lang === 'ar' ? 'rtl' : 'ltr'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // Wordmark + heading
  ctx.fillStyle = '#c6ff3d'
  ctx.font = font(900, 120)
  ctx.fillText('IRL', W / 2, 200)
  ctx.fillStyle = '#ffffffcc'
  ctx.font = font(700, 44)
  ctx.fillText(info.heading, W / 2, 290)

  // Photo (or a big emoji when there's no photo)
  const box = { x: 110, y: 350, w: 860, h: 860 }
  ctx.save()
  roundRect(ctx, box.x, box.y, box.w, box.h, 56)
  ctx.clip()
  if (info.photo) {
    const img = new Image()
    img.src = info.photo
    await img.decode()
    const scale = Math.max(box.w / img.width, box.h / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h)
  } else {
    const g = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h)
    g.addColorStop(0, info.color)
    g.addColorStop(1, '#1f1f2d')
    ctx.fillStyle = g
    ctx.fillRect(box.x, box.y, box.w, box.h)
    ctx.font = font(400, 360)
    ctx.fillText(info.emoji, W / 2, box.y + box.h / 2 + 130)
  }
  ctx.restore()
  ctx.lineWidth = 8
  ctx.strokeStyle = info.color
  roundRect(ctx, box.x, box.y, box.w, box.h, 56)
  ctx.stroke()

  // Quest title
  ctx.fillStyle = '#ffffff'
  ctx.font = font(800, 76)
  const lines = wrapLines(ctx, info.title, 900).slice(0, 3)
  let y = 1340
  for (const line of lines) {
    ctx.fillText(line, W / 2, y)
    y += 92
  }

  // XP + rarity
  y += 20
  ctx.font = font(900, 64)
  ctx.fillStyle = '#c6ff3d'
  ctx.fillText(`${info.xpLine} · ${info.rarity}`, W / 2, y)

  // Streak + school
  ctx.font = font(700, 48)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(info.streak, W / 2, y + 110)
  ctx.fillStyle = '#ffffffb3'
  ctx.fillText(`🏆 ${info.school}`, W / 2, y + 180)

  // Footer
  ctx.font = font(500, 40)
  ctx.fillStyle = '#ffffff80'
  ctx.fillText(info.tagline, W / 2, H - 80)

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
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'saved'
}

export function inviteUrl(schoolId: string, schoolName?: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('school', schoolId)
  if (schoolName) url.searchParams.set('name', schoolName)
  return url.toString()
}

export async function shareLink(text: string, url: string): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share({ text, url })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`)
    return 'copied'
  } catch {
    return 'cancelled'
  }
}
