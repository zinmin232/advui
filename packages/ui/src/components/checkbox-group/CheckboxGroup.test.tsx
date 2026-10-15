import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Field } from '../field/Field'
import { CheckboxGroup } from './CheckboxGroup'

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push' },
]

const box = (name: string) => screen.getByRole('checkbox', { name })

describe('CheckboxGroup', () => {
  it('is a named group whose items are checked from its value', () => {
    renderWithProvider(
      <CheckboxGroup aria-label="Notifications" defaultValue={['sms']}>
        {channels.map((c) => (
          <CheckboxGroup.Item key={c.value} {...c} />
        ))}
      </CheckboxGroup>,
    )
    expect(screen.getByRole('group', { name: 'Notifications' })).toBeInTheDocument()
    expect(box('Email')).toHaveAttribute('aria-checked', 'false')
    expect(box('SMS')).toHaveAttribute('aria-checked', 'true')
  })

  it('adds and removes values with clicks, label clicks and Space', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <CheckboxGroup aria-label="Notifications" onValueChange={onValueChange}>
        {channels.map((c) => (
          <CheckboxGroup.Item key={c.value} {...c} />
        ))}
      </CheckboxGroup>,
    )
    await user.click(box('Push'))
    expect(onValueChange).toHaveBeenLastCalledWith(['push'])
    await user.click(screen.getByText('Email'))
    expect(onValueChange).toHaveBeenLastCalledWith(['push', 'email'])
    box('Push').focus()
    await user.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith(['email'])
    expect(box('Push')).toHaveAttribute('aria-checked', 'false')
  })

  it('follows a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState(['email'])
      return (
        <>
          <CheckboxGroup aria-label="Notifications" value={value} onValueChange={setValue}>
            {channels.map((c) => (
              <CheckboxGroup.Item key={c.value} {...c} />
            ))}
          </CheckboxGroup>
          <button type="button" onClick={() => setValue([])}>
            Clear
          </button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    expect(box('Email')).toHaveAttribute('aria-checked', 'true')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(box('Email')).toHaveAttribute('aria-checked', 'false')
  })

  it('links an item description', () => {
    renderWithProvider(
      <CheckboxGroup aria-label="Plan">
        <CheckboxGroup.Item value="backups" label="Backups" description="Kept for 30 days." />
      </CheckboxGroup>,
    )
    expect(box('Backups')).toHaveAccessibleDescription('Kept for 30 days.')
  })

  it('Select All shows a mixed state and toggles every enabled item', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <CheckboxGroup
        aria-label="Notifications"
        defaultValue={['email']}
        onValueChange={onValueChange}
      >
        <CheckboxGroup.SelectAll label="All" />
        {channels.map((c) => (
          <CheckboxGroup.Item key={c.value} {...c} />
        ))}
        <CheckboxGroup.Item value="fax" label="Fax" disabled />
      </CheckboxGroup>,
    )
    const all = box('All')
    expect(all).toHaveAttribute('aria-checked', 'mixed')
    expect(all.getAttribute('aria-controls')?.split(' ')).toEqual(
      ['Email', 'SMS', 'Push', 'Fax'].map((name) => box(name).id),
    )

    await user.click(all)
    // The disabled item keeps its state, so the group is still only partly checked.
    expect(onValueChange).toHaveBeenLastCalledWith(['email', 'sms', 'push'])
    expect(all).toHaveAttribute('aria-checked', 'mixed')
    expect(box('Fax')).toHaveAttribute('aria-checked', 'false')

    await user.click(all)
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(all).toHaveAttribute('aria-checked', 'false')
  })

  it('Select All is checked when every item is', () => {
    renderWithProvider(
      <CheckboxGroup aria-label="Notifications" defaultValue={['sms', 'email', 'push']}>
        <CheckboxGroup.SelectAll label="All" />
        {channels.map((c) => (
          <CheckboxGroup.Item key={c.value} {...c} />
        ))}
      </CheckboxGroup>,
    )
    expect(box('All')).toHaveAttribute('aria-checked', 'true')
  })

  it('disables and invalidates every item', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <CheckboxGroup aria-label="Notifications" disabled invalid onValueChange={onValueChange}>
        <CheckboxGroup.SelectAll label="All" />
        {channels.map((c) => (
          <CheckboxGroup.Item key={c.value} {...c} />
        ))}
      </CheckboxGroup>,
    )
    await user.click(box('All'))
    await user.click(box('Email'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(box('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(box('All')).toBeDisabled()
  })

  it('takes its name, help text and state from a Field', () => {
    const { container } = renderWithProvider(
      <Field id="channels" label="Notifications" error="Pick at least one." required disabled>
        <CheckboxGroup>
          {channels.map((c) => (
            <CheckboxGroup.Item key={c.value} {...c} />
          ))}
        </CheckboxGroup>
      </Field>,
    )
    const group = screen.getByRole('group', { name: 'Notifications' })
    expect(group).toHaveAccessibleDescription('Pick at least one.')
    expect(group).not.toHaveAttribute('aria-required')
    expect(container.querySelectorAll('#channels')).toHaveLength(1)
    expect(box('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(box('Email')).toBeDisabled()
    // The checkboxes are named by their own labels, not the field's.
    expect(box('Email')).not.toHaveAccessibleDescription()
  })

  it('submits each checked value under the group name', async () => {
    const { container } = renderWithProvider(
      <form>
        <CheckboxGroup aria-label="Notifications" name="channels" defaultValue={['email', 'push']}>
          {channels.map((c) => (
            <CheckboxGroup.Item key={c.value} {...c} />
          ))}
        </CheckboxGroup>
      </form>,
    )
    const data = new FormData(container.querySelector('form')!)
    expect(data.getAll('channels')).toEqual(['email', 'push'])
  })
})
