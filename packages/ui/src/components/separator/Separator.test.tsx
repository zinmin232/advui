import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Separator } from './Separator'

describe('Separator', () => {
  it('is hidden from assistive technology by default', () => {
    renderWithProvider(<Separator testID="sep" />)
    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByTestId('sep')).toHaveAttribute('aria-hidden', 'true')
  })

  it('exposes separator semantics and orientation when not decorative', () => {
    renderWithProvider(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })
})
