import { CopyIcon, SearchIcon } from '@advui/icons'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Field } from '../field/Field'
import { IconButton } from '../icon-button/IconButton'
import { Input } from './Input'

describe('Input', () => {
  it('accepts typing and reports changes', async () => {
    const onChangeText = vi.fn()
    const { user } = renderWithProvider(
      <Input aria-label="Email" placeholder="you@example.com" onChangeText={onChangeText} />,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    await user.type(input, 'hi')
    expect(input).toHaveValue('hi')
    expect(onChangeText).toHaveBeenLastCalledWith('hi')
  })

  it('marks invalid fields for assistive technology', () => {
    renderWithProvider(<Input aria-label="Email" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('cannot be edited when disabled', async () => {
    const { user } = renderWithProvider(<Input aria-label="Email" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await user.type(input, 'x')
    expect(input).toHaveValue('')
  })

  describe('slots', () => {
    it('without slots stays a single input', () => {
      renderWithProvider(<Input aria-label="Email" />)
      expect(screen.getByRole('textbox').closest('.is_InputGroup')).toBeNull()
    })

    it('puts icons and buttons in the field, and a press beside the text focuses it', async () => {
      const onCopy = vi.fn()
      const { user } = renderWithProvider(
        <Input
          aria-label="API key"
          leading={<SearchIcon testID="icon" />}
          trailing={<IconButton icon={<CopyIcon />} aria-label="Copy" onPress={onCopy} />}
        />,
      )
      const input = screen.getByRole('textbox', { name: 'API key' })
      expect(input.closest('.is_InputGroup')).not.toBeNull()

      await user.click(screen.getByTestId('icon'))
      expect(input).toHaveFocus()

      await user.click(screen.getByRole('button', { name: 'Copy' }))
      expect(onCopy).toHaveBeenCalledTimes(1)
      expect(input).not.toHaveFocus()
    })

    it('reads addon text with the field, after its help text', () => {
      renderWithProvider(
        <Field label="Website" description="Where people find you.">
          <Input leadingAddon="https://" trailingAddon=".com" />
        </Field>,
      )
      const input = screen.getByRole('textbox', { name: 'Website' })
      expect(input).toHaveAccessibleDescription('Where people find you. https:// .com')
      expect(screen.getByText('https://')).toBeInTheDocument()
    })

    it('gives layout props to the box, and draws the ring on it while focused', async () => {
      const { user } = renderWithProvider(
        <Input aria-label="Price" leading="$" trailingAddon="USD" width={240} invalid />,
      )
      const input = screen.getByRole('textbox', { name: 'Price' })
      const group = input.closest('.is_InputGroup') as HTMLElement
      expect(getComputedStyle(group).width).toBe('240px')
      expect(getComputedStyle(input).width).not.toBe('240px')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      expect(getComputedStyle(group).outlineStyle).not.toBe('solid')
      await user.click(input)
      expect(getComputedStyle(group).outlineStyle).toBe('solid')
    })

    it('keeps the field while a slot comes and goes', async () => {
      function Clearable() {
        const [value, setValue] = useState('')
        return (
          <Input
            aria-label="Name"
            value={value}
            onChangeText={setValue}
            trailing={value ? <IconButton icon={<CopyIcon />} aria-label="Clear" /> : null}
          />
        )
      }
      const { user } = renderWithProvider(<Clearable />)
      const input = screen.getByRole('textbox', { name: 'Name' })
      await user.type(input, 'Ada')
      expect(screen.getByRole('textbox', { name: 'Name' })).toBe(input)
      expect(input).toHaveFocus()
      expect(input).toHaveValue('Ada')
    })
  })
})
