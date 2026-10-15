/**
 * Replaces the thin (U+2009) and narrow no-break (U+202F) spaces that newer
 * ICU versions put in formatted dates ("Oct 1 – 14, 2026", "3:00 PM") with
 * plain spaces. Node and browsers ship different ICU data, so without this a
 * server-rendered date would not match the browser's text at hydration.
 */
export function plainSpaces(text: string) {
  return text.replace(/[\u2009\u202f]/g, ' ')
}
