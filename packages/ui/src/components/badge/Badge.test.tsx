import { CheckIcon } from '@adv-ui/icons'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its label as plain text (no interactive role)', () => {
    renderWithProvider(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it.each([
    'default',
    'secondary',
    'outline',
    'destructive',
    'success',
    'warning',
    'info',
  ] as const)('renders the %s variant with an icon', (variant) => {
    renderWithProvider(
      <Badge variant={variant} icon={<CheckIcon testID="badge-icon" />}>
        {variant}
      </Badge>,
    )
    expect(screen.getByText(variant)).toBeVisible()
    expect(screen.getByTestId('badge-icon')).toHaveAttribute('aria-hidden', 'true')
  })
})
