import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Text } from '../typography/Text'
import { Portal } from './Portal'

// Tamagui's host: a fixed layer over the window.
function layerOf(element: HTMLElement) {
  let node: HTMLElement | null = element
  while (node && node.style.position !== 'fixed') node = node.parentElement
  return node
}

describe('Portal', () => {
  it('renders its children at the end of the body, above the app', async () => {
    const { container } = renderWithProvider(
      <>
        <Text>In the app</Text>
        <Portal>
          <Button>Floating</Button>
        </Portal>
      </>,
    )
    const button = await screen.findByRole('button', { name: 'Floating' })
    expect(container).toHaveTextContent('In the app')
    expect(container).not.toContainElement(button)
    expect(document.body).toContainElement(button)
    // The overlay layer, where a panel in it may still scroll by touch.
    expect(layerOf(button)).toHaveStyle({ zIndex: '1200', touchAction: 'auto' })
  })

  it('takes a layer name or a number', async () => {
    renderWithProvider(
      <>
        <Portal zIndex="toast">
          <Text>Toast layer</Text>
        </Portal>
        <Portal zIndex={5}>
          <Text>Number</Text>
        </Portal>
      </>,
    )
    expect(layerOf(await screen.findByText('Toast layer'))).toHaveStyle({ zIndex: '1500' })
    expect(layerOf(await screen.findByText('Number'))).toHaveStyle({ zIndex: '5' })
  })
})
