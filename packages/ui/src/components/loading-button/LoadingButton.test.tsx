import { ArrowRightIcon, PlusIcon } from '@advui/icons'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { Button } from '../button/Button'
import { LoadingButton } from './LoadingButton'

/** The order of the button's parts: `spinner`, test ids, or text. */
function parts(button: HTMLElement) {
  return Array.from(button.children).map((child) =>
    child.querySelector('.aui-spinner') || child.classList.contains('aui-spinner')
      ? 'spinner'
      : (child.querySelector('[data-testid]')?.getAttribute('data-testid') ??
        child.getAttribute('data-testid') ??
        child.textContent),
  )
}

describe('LoadingButton', () => {
  it('renders exactly like Button when not loading', () => {
    const { container } = renderWithProvider(
      <>
        <LoadingButton icon={<PlusIcon />}>Save</LoadingButton>
        <Button icon={<PlusIcon />}>Save</Button>
      </>,
    )
    const [loadingButton, button] = screen.getAllByRole('button', { name: 'Save' })
    expect(loadingButton!.outerHTML).toBe(button!.outerHTML)
    expect(loadingButton).not.toBeDisabled()
    expect(loadingButton).not.toHaveAttribute('aria-busy')
    expect(container.querySelector('.aui-spinner')).toBeNull()
  })

  it('shows a spinner next to the label while loading, keeping the name', () => {
    renderWithProvider(<LoadingButton loading>Save</LoadingButton>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(parts(button)).toEqual(['spinner', 'Save'])
    // The spinner is decorative: no progressbar inside the button's name.
    expect(within(button).queryByRole('progressbar')).toBeNull()
  })

  it('replaces the label with loadingText', () => {
    renderWithProvider(
      <LoadingButton loading loadingText="Saving…">
        Save
      </LoadingButton>,
    )
    expect(screen.getByRole('button', { name: 'Saving…' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Save')).toBeNull()
  })

  it('renders a custom spinner instead of the default one', () => {
    renderWithProvider(
      <LoadingButton loading spinner={<span data-testid="dots" />}>
        Save
      </LoadingButton>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    expect(parts(button)).toEqual(['dots', 'Save'])
    expect(button.querySelector('.aui-spinner')).toBeNull()
  })

  it('puts the spinner left or right, in place of the icon on that side', () => {
    renderWithProvider(
      <>
        <LoadingButton
          loading
          icon={<PlusIcon testID="plus" />}
          iconAfter={<ArrowRightIcon testID="arrow" />}
        >
          Left
        </LoadingButton>
        <LoadingButton
          loading
          spinnerPosition="right"
          icon={<PlusIcon testID="plus" />}
          iconAfter={<ArrowRightIcon testID="arrow" />}
        >
          Right
        </LoadingButton>
        <LoadingButton loading iconAfter={<ArrowRightIcon testID="arrow" />}>
          Continue
        </LoadingButton>
      </>,
    )
    expect(parts(screen.getByRole('button', { name: 'Left' }))).toEqual([
      'spinner',
      'Left',
      'arrow',
    ])
    expect(parts(screen.getByRole('button', { name: 'Right' }))).toEqual([
      'plus',
      'Right',
      'spinner',
    ])
    // With only a trailing icon, the spinner defaults to its side.
    expect(parts(screen.getByRole('button', { name: 'Continue' }))).toEqual(['Continue', 'spinner'])
  })

  it('runs onPress normally, and ignores clicks and keys while loading', async () => {
    const onPress = vi.fn()
    // The parent starts loading on the first press, as a real save would.
    function SaveForm() {
      const [loading, setLoading] = useState(false)
      return (
        <LoadingButton
          loading={loading}
          onPress={() => {
            onPress()
            setLoading(true)
          }}
        >
          Save
        </LoadingButton>
      )
    }
    const { user } = renderWithProvider(<SaveForm />)
    const button = screen.getByRole('button', { name: 'Save' })
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(button).toHaveAttribute('aria-busy', 'true')

    // Double clicks, Enter and Space while saving are all ignored (keys even
    // with focus forced onto it; browsers move focus off a disabled button).
    await user.dblClick(button)
    button.focus()
    await user.keyboard('{Enter} ')
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('respects disabled, with or without loading', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <>
        <LoadingButton disabled onPress={onPress}>
          Off
        </LoadingButton>
        <LoadingButton disabled loading onPress={onPress}>
          Both
        </LoadingButton>
      </>,
    )
    const off = screen.getByRole('button', { name: 'Off' })
    const both = screen.getByRole('button', { name: 'Both' })
    expect(off).toBeDisabled()
    expect(off).not.toHaveAttribute('aria-busy')
    expect(both).toBeDisabled()
    expect(both).toHaveAttribute('aria-busy', 'true')
    await user.click(off)
    await user.click(both)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('keeps Button props: variant, size, theme and style props', () => {
    renderWithProvider(
      <>
        <Button
          variant="outline"
          size="lg"
          theme="dark"
          borderRadius="$xl"
          backgroundColor="$info"
          disabled
        >
          Save
        </Button>
        <LoadingButton
          variant="outline"
          size="lg"
          theme="dark"
          borderRadius="$xl"
          backgroundColor="$info"
          loading
        >
          Save
        </LoadingButton>
      </>,
    )
    const [button, loadingButton] = screen.getAllByRole('button', { name: 'Save' })
    // Same frame styles as a disabled Button of that variant and size.
    expect(loadingButton!.className).toBe(button!.className)
    expect(loadingButton!.parentElement!.className).toBe(button!.parentElement!.className)
  })
})
