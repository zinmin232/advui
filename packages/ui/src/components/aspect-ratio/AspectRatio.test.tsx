import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { AspectRatio } from './AspectRatio'

describe('AspectRatio', () => {
  it('sets the CSS aspect ratio and fills the width', () => {
    renderWithProvider(
      <AspectRatio ratio={16 / 9} testID="box">
        content
      </AspectRatio>,
    )
    const box = screen.getByTestId('box')
    const style = getComputedStyle(box)
    expect(style.aspectRatio).toMatch(/^1\.77\d* \/ 1$/)
    expect(style.width).toBe('100%')
  })

  it('is square by default', () => {
    renderWithProvider(<AspectRatio testID="box" />)
    expect(getComputedStyle(screen.getByTestId('box')).aspectRatio).toBe('1 / 1')
  })
})
