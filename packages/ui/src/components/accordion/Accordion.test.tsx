import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Accordion, type AccordionProps } from './Accordion'

function Faq(props: Partial<AccordionProps>) {
  const rootProps = { type: 'single', collapsible: true, ...props } as AccordionProps
  return (
    <Accordion {...rootProps}>
      <Accordion.Item value="one">
        <Accordion.Trigger>First question</Accordion.Trigger>
        <Accordion.Content>First answer</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger level={2}>Second question</Accordion.Trigger>
        <Accordion.Content>Second answer</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three" disabled>
        <Accordion.Trigger>Locked question</Accordion.Trigger>
        <Accordion.Content>Locked answer</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}

describe('Accordion', () => {
  it('wraps each trigger button in a heading of the requested level', () => {
    renderWithProvider(<Faq />)
    expect(screen.getByRole('heading', { level: 3, name: 'First question' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Second question' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('opens the default section as a labelled region', () => {
    renderWithProvider(<Faq defaultValue="one" />)
    const trigger = screen.getByRole('button', { name: 'First question' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const region = screen.getByRole('region', { name: 'First question' })
    expect(region).toHaveTextContent('First answer')
    // aria-controls must point at the rendered region (Tamagui leaves the id off).
    expect(region.id).toBeTruthy()
    expect(trigger).toHaveAttribute('aria-controls', region.id)
    expect(screen.queryByText('Second answer')).toBeNull()
  })

  it('single mode opens one section at a time and can collapse it', async () => {
    const { user } = renderWithProvider(<Faq defaultValue="one" />)
    await user.click(screen.getByRole('button', { name: 'Second question' }))
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await user.click(screen.getByRole('button', { name: 'Second question' }))
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('multiple mode keeps several sections open', async () => {
    const { user } = renderWithProvider(<Faq type="multiple" defaultValue={['one']} />)
    await user.click(screen.getByRole('button', { name: 'Second question' }))
    await waitFor(() => expect(screen.getByText('Second answer')).toBeInTheDocument())
    expect(screen.getByText('First answer')).toBeInTheDocument()
  })

  it('moves focus between triggers with the arrow keys and Home / End', async () => {
    const { user } = renderWithProvider(<Faq />)
    screen.getByRole('button', { name: 'First question' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('button', { name: 'First question' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveFocus()
  })

  it('does not open a disabled section', async () => {
    const { user } = renderWithProvider(<Faq />)
    const locked = screen.getByRole('button', { name: 'Locked question' })
    expect(locked).toBeDisabled()
    await user.click(locked)
    expect(screen.queryByText('Locked answer')).toBeNull()
  })
})
