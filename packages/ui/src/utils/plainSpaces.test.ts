import { describe, expect, it } from 'vitest'
import { plainSpaces } from './plainSpaces'

describe('plainSpaces', () => {
  it('turns thin and narrow no-break spaces into plain spaces', () => {
    expect(plainSpaces('Oct 1\u2009–\u200914, 2026')).toBe('Oct 1 – 14, 2026')
    expect(plainSpaces('3:00\u202fPM')).toBe('3:00 PM')
  })

  it('keeps other spaces as they are', () => {
    // A no-break space (U+00A0) is not one ICU versions disagree on.
    expect(plainSpaces('1\u00a0000 €')).toBe('1\u00a0000 €')
  })
})
