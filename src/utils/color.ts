/**
 * Mix a `#rrggbb` colour with white. Used for team-coloured text on the dark
 * UI: the raw swatches (e.g. #3b82f6) only reach ~4.5:1 on their tinted
 * button fills, while a 35% tint keeps the hue and stays above 7.5:1 for every
 * swatch.
 */
export function tint(hex: string, amount = 0.35): string {
  const n = parseInt(hex.slice(1, 7), 16)
  if (Number.isNaN(n) || hex.length < 7) return hex
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (255 - c) * amount),
  )
  return '#' + channels.map((c) => c.toString(16).padStart(2, '0')).join('')
}
