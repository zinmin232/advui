import { PlusIcon } from '@adv-ui/icons'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from './Button'

describe('Button', () => {
  it('renders a native button with its label as accessible name', () => {
    renderWithProvider(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('calls onPress on click and on keyboard activation', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(<Button onPress={onPress}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })

    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    await user.click(button)

    expect(onPress).toHaveBeenCalledTimes(3)
  })

  it('does not fire when disabled and is removed from the tab order', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Button disabled onPress={onPress}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })

    expect(button).toBeDisabled()
    await user.click(button)
    await user.tab()
    expect(button).not.toHaveFocus()
    expect(onPress).not.toHaveBeenCalled()
  })

  it('announces loading state and blocks presses', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Button loading onPress={onPress}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: /save/i })

    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeInTheDocument()
    await user.click(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('renders icons as decorative so the label stays the accessible name', () => {
    renderWithProvider(<Button icon={<PlusIcon testID="icon" />}>Add</Button>)
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('supports composition with Button.Text', () => {
    renderWithProvider(
      <Button variant="outline" size="lg">
        <Button.Text>Composed</Button.Text>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Composed' })).toBeInTheDocument()
  })

  it.each(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const)(
    'renders the %s variant in light and dark mode',
    (variant) => {
      for (const colorMode of ['light', 'dark'] as const) {
        const { unmount } = renderWithProvider(<Button variant={variant}>{variant}</Button>, {
          colorMode,
        })
        expect(document.documentElement).toHaveClass(`t_${colorMode}`)
        expect(screen.getByRole('button', { name: variant })).toBeVisible()
        unmount()
      }
    },
  )
})
