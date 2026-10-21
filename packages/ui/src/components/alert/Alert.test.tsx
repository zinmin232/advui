import { StarIcon } from '@advui/icons'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Text } from '../typography/Text'
import { Alert, type AlertVariant } from './Alert'

const color = (element: HTMLElement) => getComputedStyle(element).color

describe('Alert', () => {
  it('uses the assertive alert role for errors and warnings', () => {
    renderWithProvider(
      <Alert variant="error">
        <Alert.Title>Payment failed</Alert.Title>
        <Alert.Description>Update your card.</Alert.Description>
      </Alert>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed')
  })

  it('uses the polite status role for informational variants', () => {
    renderWithProvider(
      <Alert variant="success" icon={null}>
        <Alert.Title>Saved</Alert.Title>
      </Alert>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it.each<[AlertVariant, string]>([
    ['default', 'status'],
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['error', 'alert'],
    ['destructive', 'alert'],
  ])('gives the %s variant the %s role', (variant, role) => {
    renderWithProvider(<Alert variant={variant} title="Notice" />)
    expect(screen.getByRole(role)).toHaveTextContent('Notice')
  })

  it('takes a role in place of the variant one, such as note for static guidance', () => {
    renderWithProvider(<Alert variant="warning" role="note" title="Back up first" />)
    expect(screen.getByRole('note')).toHaveTextContent('Back up first')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('renders title and description props before the children', () => {
    renderWithProvider(
      <Alert title="Unsaved changes" description="Save before you leave.">
        <Text>Drafts are kept for a day.</Text>
      </Alert>,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Unsaved changesSave before you leave.Drafts are kept for a day.',
    )
  })

  it('renders a description alone, and an element title as given', () => {
    renderWithProvider(
      <Alert
        title={<Text testID="custom-title">Custom</Text>}
        description="Only a description below it."
      />,
    )
    expect(screen.getByTestId('custom-title')).toHaveTextContent('Custom')
    expect(screen.getByText('Only a description below it.')).toBeInTheDocument()
  })

  it('shows the variant icon, a custom icon, or none', () => {
    renderWithProvider(
      <>
        <Alert testID="variant" title="Variant icon" />
        <Alert testID="custom" title="Custom icon" icon={<StarIcon testID="star" />} />
        <Alert testID="none" title="No icon" icon={null} />
      </>,
    )
    expect(screen.getByTestId('variant').querySelectorAll('svg')).toHaveLength(1)
    expect(screen.getByTestId('custom')).toContainElement(screen.getByTestId('star'))
    expect(screen.getByTestId('none').querySelector('svg')).toBeNull()
  })

  it('renders actions inside the alert', async () => {
    const save = vi.fn()
    const { user } = renderWithProvider(
      <Alert
        variant="warning"
        title="Unsaved changes"
        actions={<Button onPress={save}>Save changes</Button>}
      />,
    )
    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(screen.getByRole('alert')).toContainElement(button)
    await user.click(button)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('has no dismiss button unless dismissible', () => {
    renderWithProvider(<Alert title="Stays" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('hides itself when dismissed and calls onDismiss once', async () => {
    const onDismiss = vi.fn()
    const { user } = renderWithProvider(
      <Alert variant="error" title="Connection failed" dismissible onDismiss={onDismiss} />,
    )
    expect(onDismiss).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('is a native button you can reach and press with the keyboard', async () => {
    const onDismiss = vi.fn()
    const { user } = renderWithProvider(
      <Alert title="Tip" dismissible dismissLabel="Dismiss tip" onDismiss={onDismiss} />,
    )
    const button = screen.getByRole('button', { name: 'Dismiss tip' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
    await user.tab()
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('stays open when controlled, calling onDismiss on every press', async () => {
    const onDismiss = vi.fn()
    const { user } = renderWithProvider(
      <Alert title="Kept" dismissible open onDismiss={onDismiss} />,
    )
    const button = screen.getByRole('button', { name: 'Dismiss' })
    await user.click(button)
    await user.click(button)
    expect(onDismiss).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('can be shown again when controlled', async () => {
    function Example() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <Button onPress={() => setOpen(true)}>Show</Button>
          <Alert title="Back again" dismissible open={open} onDismiss={() => setOpen(false)} />
        </>
      )
    }
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Back again')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Show' }))
    expect(screen.getByText('Back again')).toBeInTheDocument()
  })

  it('does not pass the dismiss press on to a pressable around it', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProvider(
      <div onClick={onClick}>
        <Alert title="Inside a card" dismissible />
      </div>,
    )
    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sizes padding, gap and text with size', () => {
    renderWithProvider(
      <>
        <Alert testID="sm" size="sm" title="Small" description="Body" />
        <Alert testID="lg" size="lg" title="Large" description="Body" />
      </>,
    )
    const sm = getComputedStyle(screen.getByTestId('sm'))
    const lg = getComputedStyle(screen.getByTestId('lg'))
    expect([sm.padding, sm.gap]).toEqual(['12px', '8px'])
    expect([lg.padding, lg.gap]).toEqual(['20px', '16px'])
    const small = getComputedStyle(screen.getByText('Small'))
    const large = getComputedStyle(screen.getByText('Large'))
    expect(small.fontSize).not.toBe(large.fontSize)
    expect([small.fontWeight, large.fontWeight]).toEqual(['600', '600'])
  })

  it('keeps the default padding, radius and border without overrides', () => {
    renderWithProvider(<Alert testID="alert" title="Defaults" />)
    const style = getComputedStyle(screen.getByTestId('alert'))
    expect(style.padding).toBe('16px')
    expect(style.gap).toBe('12px')
    expect(style.borderTopLeftRadius).not.toBe('0px')
    expect(style.borderTopWidth).toBe('1px')
  })

  it('lets style props override the variant and size', () => {
    renderWithProvider(
      <>
        <Alert testID="plain" variant="info" title="Plain" />
        <Alert
          testID="custom"
          variant="info"
          size="lg"
          padding="2"
          gap="1"
          borderRadius="sm"
          borderWidth={0}
          backgroundColor="primary"
          borderColor="primary"
          title="Custom"
        />
      </>,
    )
    const plain = getComputedStyle(screen.getByTestId('plain'))
    const custom = getComputedStyle(screen.getByTestId('custom'))
    expect(custom.padding).toBe('8px')
    expect(custom.gap).toBe('4px')
    expect(custom.borderTopLeftRadius).toBe('4px')
    expect(custom.borderTopWidth).toBe('0px')
    expect(custom.backgroundColor).not.toBe(plain.backgroundColor)
    expect(custom.borderTopColor).not.toBe(plain.borderTopColor)
  })

  it('colors the title, description and composed parts with color', () => {
    renderWithProvider(
      <>
        <Text testID="reference" color="primaryText">
          Reference
        </Text>
        <Alert variant="info" title="Plain title" />
        <Alert variant="info" color="primaryText" title="Tinted title" description="Tinted body">
          <Alert.Description>Tinted part</Alert.Description>
        </Alert>
      </>,
    )
    const reference = color(screen.getByTestId('reference'))
    expect(color(screen.getByText('Plain title'))).not.toBe(reference)
    expect(color(screen.getByText('Tinted title'))).toBe(reference)
    expect(color(screen.getByText('Tinted body'))).toBe(reference)
    expect(color(screen.getByText('Tinted part'))).toBe(reference)
  })

  it('renders in dark mode', () => {
    renderWithProvider(<Alert variant="destructive" title="Delete project" dismissible />, {
      colorMode: 'dark',
    })
    expect(screen.getByRole('alert')).toHaveTextContent('Delete project')
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
})
