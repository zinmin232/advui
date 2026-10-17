import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { CopyButton } from './CopyButton'
import { setClipboard } from './clipboard'

afterEach(() => {
  setClipboard(undefined)
  vi.restoreAllMocks()
})

describe('CopyButton', () => {
  it('copies its value and announces it', async () => {
    const onCopy = vi.fn()
    const { user } = renderWithProvider(<CopyButton value="pnpm add @advui/core" onCopy={onCopy} />)
    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)
    expect(await navigator.clipboard.readText()).toBe('pnpm add @advui/core')
    expect(onCopy).toHaveBeenCalledWith('pnpm add @advui/core')
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
    // The name still says what the button does.
    expect(button).toHaveAccessibleName('Copy')
  })

  it('shows the result in place of a visible label until the timeout', async () => {
    const { user } = renderWithProvider(
      <CopyButton
        value="https://example.org/r/42"
        timeout={1000}
        labels={{ copied: 'Link copied' }}
      >
        Copy link
      </CopyButton>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument()
    expect(await navigator.clipboard.readText()).toBe('https://example.org/r/42')
    expect(
      await screen.findByRole('button', { name: 'Copy link' }, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('uses the clipboard from setClipboard', async () => {
    const write = vi.fn()
    setClipboard(write)
    const { user } = renderWithProvider(<CopyButton value="token-123" />)
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(write).toHaveBeenCalledWith('token-123')
  })

  it('says when the clipboard refuses the text', async () => {
    const error = new Error('denied')
    setClipboard(() => Promise.reject(error))
    const onCopy = vi.fn()
    const onCopyError = vi.fn()
    const { user } = renderWithProvider(
      <CopyButton value="secret" onCopy={onCopy} onCopyError={onCopyError} />,
    )
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(onCopyError).toHaveBeenCalledWith(error)
    expect(onCopy).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Couldn’t copy')
  })

  it('falls back to a selection copy where the Clipboard API is missing', async () => {
    const { user } = renderWithProvider(<CopyButton value="plain http" />)
    // After setup: user-event installs its own clipboard.
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue(undefined as never)
    let selected = ''
    const execCommand = vi.fn(() => {
      selected = document.querySelector('textarea')?.value ?? ''
      return true
    })
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true })
    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(selected).toBe('plain http')
    expect(document.querySelector('textarea')).toBeNull()
    expect(button).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
  })
})
