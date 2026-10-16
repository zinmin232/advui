import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { Field } from '../field/Field'
import { TagsInput } from './TagsInput'

const textBox = () => screen.getByRole('textbox')

describe('TagsInput', () => {
  it('adds a tag on Enter and on a comma, and clears the text box', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput aria-label="Topics" onValueChange={onValueChange} />,
    )
    await user.type(screen.getByRole('textbox', { name: 'Topics' }), 'react{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['react'])
    expect(textBox()).toHaveValue('')
    await user.type(textBox(), ' native ,')
    expect(onValueChange).toHaveBeenLastCalledWith(['react', 'native'])
    expect(textBox()).toHaveValue('')
    expect(screen.getByText('native')).toBeInTheDocument()
  })

  it('leaves Enter alone while an input method is composing', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput aria-label="Topics" onValueChange={onValueChange} />,
    )
    await user.type(textBox(), 'にほん')
    fireEvent.keyDown(textBox(), { key: 'Enter', isComposing: true })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(textBox()).toHaveValue('にほん')
  })

  it('adds every part of a pasted list', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput aria-label="Topics" separators={[',', ';']} onValueChange={onValueChange} />,
    )
    await user.click(textBox())
    await user.paste('web, ios;android')
    expect(onValueChange).toHaveBeenLastCalledWith(['web', 'ios', 'android'])
    expect(textBox()).toHaveValue('')
  })

  it('keeps refused text in the text box: duplicates, over max, or failing validate', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput
        aria-label="Emails"
        defaultValue={['a@x.io']}
        max={2}
        validate={(tag) => tag.includes('@')}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textBox(), 'a@x.io{Enter}')
    expect(textBox()).toHaveValue('a@x.io')
    await user.clear(textBox())
    await user.type(textBox(), 'nope{Enter}')
    expect(textBox()).toHaveValue('nope')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.clear(textBox())
    await user.type(textBox(), 'b@x.io{Enter}c@x.io{Enter}')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(['a@x.io', 'b@x.io'])
    expect(textBox()).toHaveValue('c@x.io')
  })

  it('allows duplicates when asked', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput
        aria-label="Rolls"
        allowDuplicates
        defaultValue={['6']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(textBox(), '6{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['6', '6'])
  })

  it('removes tags with their buttons and with Backspace, and announces changes', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TagsInput
        aria-label="Topics"
        defaultValue={['web', 'ios', 'android']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove ios' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['web', 'android'])
    expect(screen.getByRole('status')).toHaveTextContent('Removed ios')
    // The removed button's focus goes to the text box.
    expect(textBox()).toHaveFocus()
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['web'])
    await user.keyboard('rust{Enter}')
    expect(screen.getByRole('status')).toHaveTextContent('Added rust')
  })

  it('adds the typed text on blur unless addOnBlur is off', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <TagsInput aria-label="On" onValueChange={onValueChange} />
        <TagsInput aria-label="Off" addOnBlur={false} onValueChange={onValueChange} />
      </>,
    )
    await user.type(screen.getByRole('textbox', { name: 'On' }), 'kept')
    await user.type(screen.getByRole('textbox', { name: 'Off' }), 'draft')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(['kept'])
    await user.tab()
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'Off' })).toHaveValue('draft')
  })

  it('works controlled and translates its labels', async () => {
    function Controlled() {
      const [tags, setTags] = useState(['uno'])
      return (
        <TagsInput
          aria-label="Etiquetas"
          value={tags}
          onValueChange={setTags}
          labels={{ remove: (tag) => `Quitar ${tag}`, added: (added) => `${added[0]} añadida` }}
        />
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    await user.type(textBox(), 'dos{Enter}')
    expect(screen.getByRole('button', { name: 'Quitar dos' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('dos añadida')
  })

  it('takes its name, help text and state from a Field', () => {
    renderWithProvider(
      <Field id="topics" label="Topics" error="Add at least one." required disabled>
        <TagsInput defaultValue={['web']} />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Topics' })
    expect(input).toHaveAttribute('id', 'topics')
    expect(input).toHaveAccessibleDescription('Add at least one.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toBeDisabled()
  })

  it('submits each tag under its name in a native form', () => {
    const { container } = renderWithProvider(
      <form>
        <TagsInput aria-label="Topics" name="topic" defaultValue={['web', 'ios']} />
      </form>,
    )
    const form = container.querySelector('form')!
    expect(new FormData(form).getAll('topic')).toEqual(['web', 'ios'])
  })
})
