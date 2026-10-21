import { useState } from 'react'
import { View } from 'tamagui/unstyled'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { List } from '../list/List'
import { Switch } from '../switch/Switch'
import { Text } from '../typography/Text'
import { ListItem, ListItemTitle } from './ListItem'

const style = (el: HTMLElement) => getComputedStyle(el)

describe('ListItem', () => {
  it('renders on its own, without list or button semantics', () => {
    renderWithProvider(<ListItem title="Privacy" description="Manage your privacy preferences" />)
    expect(screen.getByText('Privacy')).toBeInTheDocument()
    expect(screen.getByText('Manage your privacy preferences')).toBeInTheDocument()
    // A listitem outside a list is invalid; only items inside List take the role.
    expect(screen.queryByRole('listitem')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders leading, trailing, actions, element titles and custom content', () => {
    renderWithProvider(
      <>
        <ListItem
          leading={<View testID="leading" />}
          title="Messages"
          trailing="5 new"
          actions={<Button size="sm">Open</Button>}
        />
        <ListItem title={<Text testID="element-title">Element title</Text>} />
        <ListItem>
          <ListItemTitle>Custom content</ListItemTitle>
        </ListItem>
        <ListItem description="Description only" />
      </>,
    )
    expect(screen.getByTestId('leading')).toBeInTheDocument()
    expect(screen.getByText('5 new')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    expect(screen.getByTestId('element-title')).toHaveTextContent('Element title')
    expect(screen.getByText('Custom content')).toBeInTheDocument()
    expect(screen.getByText('Description only')).toBeInTheDocument()
  })

  it('is a listitem inside a List and takes its size unless it sets one', () => {
    renderWithProvider(
      <List size="sm">
        <ListItem title="From the list" onPress={() => {}} />
        <List.Item title="Own size" size="lg" onPress={() => {}} />
      </List>,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    const padding = (name: string) => style(screen.getByRole('button', { name })).paddingTop
    expect(padding('From the list')).toBe('8px')
    expect(padding('Own size')).toBe('16px')
  })

  it('scales padding and text with size', () => {
    renderWithProvider(
      <>
        <ListItem size="sm" title="Small" onPress={() => {}} />
        <ListItem title="Medium" onPress={() => {}} />
        <ListItem size="lg" title="Large" onPress={() => {}} />
      </>,
    )
    const button = (name: string) => screen.getByRole('button', { name })
    expect(style(button('Small')).paddingTop).toBe('8px')
    expect(style(button('Medium')).paddingTop).toBe('12px')
    expect(style(button('Large')).paddingTop).toBe('16px')
    const fontSize = (text: string) => parseFloat(style(screen.getByText(text)).fontSize)
    expect(fontSize('Small')).toBeLessThan(fontSize('Medium'))
    expect(fontSize('Medium')).toBeLessThan(fontSize('Large'))
  })

  it('draws the variant surfaces', () => {
    renderWithProvider(
      <>
        <View testID="muted" backgroundColor="muted" />
        <ListItem testID="plain" title="Plain" />
        <ListItem testID="filled" variant="filled" title="Filled" />
        <ListItem testID="outline" variant="outline" title="Outline" />
      </>,
    )
    const item = (id: string) => style(screen.getByTestId(id))
    expect(item('filled').backgroundColor).toBe(item('muted').backgroundColor)
    expect(item('plain').backgroundColor).not.toBe(item('muted').backgroundColor)
    expect(item('outline').borderTopWidth).toBe('1px')
    expect(item('plain').borderTopWidth).not.toBe('1px')
  })

  it('draws a divider only when asked, or between items of a divided List', () => {
    renderWithProvider(
      <>
        <ListItem testID="alone" title="Alone" />
        <ListItem testID="divided" divider title="Divided" />
        <List divided>
          <List.Item testID="first" title="First" />
          <List.Item testID="second" title="Second" />
          <List.Item testID="opt-out" divider={false} title="Opt out" />
        </List>
      </>,
    )
    const border = (id: string) => style(screen.getByTestId(id)).borderTopWidth
    expect(border('alone')).not.toBe('1px')
    expect(border('divided')).toBe('1px')
    expect(border('first')).not.toBe('1px')
    expect(border('second')).toBe('1px')
    expect(border('opt-out')).not.toBe('1px')
  })

  it('lets style props override the variant and size', () => {
    renderWithProvider(
      <>
        <Text testID="reference" color="primaryText">
          Reference
        </Text>
        <ListItem testID="default" variant="outline" title="Default" onPress={() => {}} />
        <ListItem
          testID="custom"
          variant="outline"
          title="Custom"
          description="Tinted"
          onPress={() => {}}
          actions={<Button size="sm">Act</Button>}
          backgroundColor="primarySoft"
          borderColor="primary"
          borderRadius="sm"
          color="primaryText"
          padding="2"
          gap="1"
        />
      </>,
    )
    const custom = style(screen.getByTestId('custom'))
    const fallback = style(screen.getByTestId('default'))
    expect(custom.backgroundColor).not.toBe(fallback.backgroundColor)
    expect(custom.borderTopColor).not.toBe(fallback.borderTopColor)
    expect(custom.borderTopLeftRadius).toBe('4px')
    // Padding and gap go to the pressable row, so it still fills the item.
    const row = style(screen.getByRole('button', { name: /Custom/ }))
    expect(row.paddingTop).toBe('8px')
    expect(row.gap).toBe('4px')
    expect(style(screen.getByRole('button', { name: 'Act' }).parentElement!).paddingRight).toBe(
      '8px',
    )
    const reference = style(screen.getByTestId('reference')).color
    expect(style(screen.getByText('Custom')).color).toBe(reference)
    expect(style(screen.getByText('Tinted')).color).toBe(reference)
  })

  it('lets long text wrap instead of truncating it', () => {
    const long = 'A very long title that should wrap onto a second line instead of being cut off'
    renderWithProvider(<ListItem title={long} description={long.toLowerCase()} />)
    for (const text of [long, long.toLowerCase()]) {
      expect(style(screen.getByText(text)).whiteSpace).not.toBe('nowrap')
      expect(style(screen.getByText(text)).textOverflow).not.toBe('ellipsis')
    }
  })

  it('makes a pressable item one button named by its content', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <ListItem title="Appearance" description="Theme and density" onPress={onPress} />,
    )
    const button = screen.getByRole('button', { name: /Appearance.*Theme and density/ })
    await user.click(button)
    await user.tab()
    await user.tab({ shift: true })
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onPress).toHaveBeenCalledTimes(3)
  })

  it('takes an accessible name from aria-label', () => {
    renderWithProvider(<ListItem title="5" aria-label="5 unread messages" onPress={() => {}} />)
    expect(screen.getByRole('button', { name: '5 unread messages' })).toBeInTheDocument()
  })

  it('marks the current item with aria-current, and a current link as the page', () => {
    renderWithProvider(
      <>
        <ListItem title="Dark" selected onPress={() => {}} />
        <ListItem title="Light" onPress={() => {}} />
        <ListItem title="Reports" href="/reports" selected />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Light' })).not.toHaveAttribute('aria-current')
    const link = screen.getByRole('link', { name: 'Reports' })
    expect(link).toHaveAttribute('href', '/reports')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('does not act when disabled, and a disabled link has no href', async () => {
    const onPress = vi.fn()
    const onSelectedChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <ListItem title="Security keys" disabled onPress={onPress} />
        <ListItem title="Option" disabled selectable onSelectedChange={onSelectedChange} />
        <ListItem title="Billing" disabled href="/billing" />
      </>,
    )
    const button = screen.getByRole('button', { name: 'Security keys' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    await user.click(button)
    await user.click(screen.getByRole('button', { name: 'Option' }))
    expect(onPress).not.toHaveBeenCalled()
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button', { name: 'Billing' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('toggles a selectable item, reporting the new state once per press', async () => {
    const onSelectedChange = vi.fn()
    const { user } = renderWithProvider(
      <ListItem title="Option A" selectable onSelectedChange={onSelectedChange} />,
    )
    // Nothing is reported while rendering.
    expect(onSelectedChange).not.toHaveBeenCalled()
    const option = screen.getByRole('button', { name: 'Option A' })
    expect(option).toHaveAttribute('aria-pressed', 'false')
    await user.click(option)
    expect(option).toHaveAttribute('aria-pressed', 'true')
    expect(onSelectedChange).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
    await user.keyboard(' ')
    expect(option).toHaveAttribute('aria-pressed', 'false')
    expect(onSelectedChange).toHaveBeenLastCalledWith(false)
  })

  it('leaves a controlled selection to the parent', async () => {
    function Choices() {
      const [value, setValue] = useState('a')
      return (
        <>
          {['a', 'b'].map((option) => (
            <ListItem
              key={option}
              title={`Choice ${option}`}
              selectable
              selected={value === option}
              onSelectedChange={(on) => on && setValue(option)}
            />
          ))}
        </>
      )
    }
    const { user } = renderWithProvider(<Choices />)
    const a = screen.getByRole('button', { name: 'Choice a' })
    const b = screen.getByRole('button', { name: 'Choice b' })
    expect(a).toHaveAttribute('aria-pressed', 'true')
    await user.click(b)
    expect(b).toHaveAttribute('aria-pressed', 'true')
    expect(a).toHaveAttribute('aria-pressed', 'false')
    // Pressing the chosen one asks to turn it off; this parent keeps it.
    await user.click(b)
    expect(b).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps actions and controls independent of the row', async () => {
    const onPress = vi.fn()
    const onDownload = vi.fn()
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <ListItem
          title="Quarterly report.pdf"
          onPress={onPress}
          disabled
          actions={<Button onPress={onDownload}>Download</Button>}
        />
        <ListItem
          title="Email notifications"
          trailing={<Switch aria-label="Email notifications" onCheckedChange={onCheckedChange} />}
        />
      </>,
    )
    const row = screen.getByRole('button', { name: 'Quarterly report.pdf' })
    const download = screen.getByRole('button', { name: 'Download' })
    // A sibling of the row's button, never nested inside it.
    expect(row.contains(download)).toBe(false)
    await user.click(download)
    download.focus()
    await user.keyboard('{Enter}')
    // The row is disabled; its actions are not.
    expect(onDownload).toHaveBeenCalledTimes(2)
    expect(onPress).not.toHaveBeenCalled()
    await user.click(screen.getByRole('switch', { name: 'Email notifications' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not trigger the row from an action when the row is enabled', async () => {
    const onPress = vi.fn()
    const onMore = vi.fn()
    const { user } = renderWithProvider(
      <ListItem
        title="Project document"
        onPress={onPress}
        actions={<Button onPress={onMore}>More</Button>}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'More' }))
    expect(onMore).toHaveBeenCalledOnce()
    expect(onPress).not.toHaveBeenCalled()
  })

  it('renders in dark mode', () => {
    renderWithProvider(<ListItem variant="outline" title="Dark" selected onPress={() => {}} />, {
      colorMode: 'dark',
    })
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-current', 'true')
  })
})
