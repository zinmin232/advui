import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { isTextContent } from './isTextContent'

describe('isTextContent', () => {
  it('accepts strings, numbers and JSX text split into pieces', () => {
    expect(isTextContent('Save')).toBe(true)
    expect(isTextContent(3)).toBe(true)
    // <Button>Status ({count})</Button> passes ['Status (', 2, ')']
    expect(isTextContent(['Status (', 2, ')'])).toBe(true)
  })

  it('rejects elements, mixed content and empty values', () => {
    expect(isTextContent(createElement('span', null, 'Save'))).toBe(false)
    expect(isTextContent(['Save ', createElement('b', null, 'now')])).toBe(false)
    expect(isTextContent([])).toBe(false)
    expect(isTextContent(null)).toBe(false)
    expect(isTextContent(undefined)).toBe(false)
  })
})
