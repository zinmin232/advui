import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { List } from './List'

describe('List', () => {
  it('is a list of list items', () => {
    renderWithProvider(
      <List>
        <List.Item title="Field reports" description="12 files" />
        <List.Item title="Budget" trailing="XLSX" />
      </List>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('12 files')).toBeInTheDocument()
    expect(screen.getByText('XLSX')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('draws dividers between items, not above the first', () => {
    renderWithProvider(
      <List divided>
        <List.Item title="One" />
        <List.Item title="Two" />
        <List.Item title="Three" />
      </List>,
    )
    const [first, second, third] = screen.getAllByRole('listitem')
    const border = (el: HTMLElement) => getComputedStyle(el).borderTopWidth
    expect(border(first!)).not.toBe('1px')
    expect(border(second!)).toBe('1px')
    expect(border(third!)).toBe('1px')
  })

  it('makes a pressable item one button named by its content', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <List>
        <List.Item title="Account" description="Name and email" onPress={onPress} />
      </List>,
    )
    const button = screen.getByRole('button', { name: /Account.*Name and email/ })
    await user.click(button)
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('activates with Enter and Space', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <List>
        <List.Item title="Account" onPress={onPress} />
      </List>,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Account' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('does not press a disabled item', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <List>
        <List.Item title="Security keys" disabled onPress={onPress} />
      </List>,
    )
    const button = screen.getByRole('button', { name: 'Security keys' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    await user.click(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('renders custom content in place of title and description', () => {
    renderWithProvider(
      <List>
        <List.Item>
          <List.ItemTitle>Custom</List.ItemTitle>
        </List.Item>
      </List>,
    )
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })
})
