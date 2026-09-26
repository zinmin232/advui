import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Tabs } from './Tabs'

function Example(props: { onValueChange?: (v: string) => void; variant?: 'pills' | 'underline' }) {
  return (
    <Tabs defaultValue="account" {...props}>
      <Tabs.List aria-label="Settings">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="password">Password</Tabs.Trigger>
        <Tabs.Trigger value="billing" disabled>
          Billing
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="account">
        <Text>Account panel</Text>
      </Tabs.Content>
      <Tabs.Content value="password">
        <Text>Password panel</Text>
      </Tabs.Content>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('implements the tabs pattern with linked panels', () => {
    renderWithProvider(<Example />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    const tab = screen.getByRole('tab', { name: 'Account' })
    expect(tab).toHaveAttribute('aria-selected', 'true')
    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveTextContent('Account panel')
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('switches panels on click', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    await user.click(screen.getByRole('tab', { name: 'Password' }))
    expect(onValueChange).toHaveBeenCalledWith('password')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Password panel')
  })

  it('moves focus with arrow keys', async () => {
    const { user } = renderWithProvider(<Example variant="underline" />)
    screen.getByRole('tab', { name: 'Account' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveFocus()
  })
})
