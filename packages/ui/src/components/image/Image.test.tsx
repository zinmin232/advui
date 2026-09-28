import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Image } from './Image'

const src = 'https://example.com/road.jpg'

describe('Image', () => {
  // happy-dom never loads images but reports them all as complete. Real
  // browsers report an image that is still loading as not complete.
  let complete: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(false)
  })
  afterEach(() => complete.mockRestore())

  it('renders an img named by alt', () => {
    renderWithProvider(<Image src={src} alt="A desert road" ratio={16 / 9} />)
    const image = screen.getByRole('img', { name: 'A desert road' })
    expect(image.tagName).toBe('IMG')
    expect(image).toHaveAttribute('src', src)
  })

  it('keeps a decorative image out of the accessibility tree', () => {
    const { container } = renderWithProvider(<Image src={src} alt="" ratio={1} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('reports a load and drops the placeholder', () => {
    const onLoad = vi.fn()
    const { container } = renderWithProvider(
      <Image src={src} alt="Road" ratio={1} onLoad={onLoad} testID="frame" />,
    )
    const frame = screen.getByTestId('frame')
    const placeholder = getComputedStyle(frame).backgroundColor
    fireEvent.load(container.querySelector('img')!)
    expect(onLoad).toHaveBeenCalledOnce()
    expect(getComputedStyle(frame).backgroundColor).not.toBe(placeholder)
  })

  it('shows a fallback that keeps the name when the image fails', () => {
    const onError = vi.fn()
    const { container } = renderWithProvider(
      <Image src={src} alt="Clinic entrance" ratio={1} onError={onError} />,
    )
    fireEvent.error(container.querySelector('img')!)
    expect(onError).toHaveBeenCalledOnce()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Clinic entrance' })).toBeInTheDocument()
  })

  it('takes a custom fallback and tries again when the source changes', async () => {
    function Swap() {
      const [photo, setPhoto] = useState(src)
      return (
        <>
          <Image src={photo} alt="Team" ratio={1} fallback={<Text>Photo unavailable</Text>} />
          <button type="button" onClick={() => setPhoto('https://example.com/team.jpg')}>
            Next
          </button>
        </>
      )
    }
    const { container, user } = renderWithProvider(<Swap />)
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByText('Photo unavailable')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.queryByText('Photo unavailable')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/team.jpg')
  })

  it('picks up a result that came before hydration', () => {
    complete.mockReturnValue(true)
    const width = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(640)
    const onLoad = vi.fn()
    renderWithProvider(<Image src={src} alt="Road" ratio={1} onLoad={onLoad} />)
    expect(onLoad).toHaveBeenCalledOnce()
    width.mockReturnValue(0)
    const onError = vi.fn()
    renderWithProvider(<Image src={src} alt="Clinic" ratio={1} onError={onError} />)
    expect(onError).toHaveBeenCalledOnce()
    expect(screen.getByRole('img', { name: 'Clinic' }).tagName).toBe('DIV')
    width.mockRestore()
  })
})
