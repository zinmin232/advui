import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { ImageGallery } from './ImageGallery'

const images = [
  { src: 'https://example.com/1.jpg', alt: 'Road', caption: 'Road to the canyon' },
  { src: 'https://example.com/2.jpg', alt: 'Lake' },
  { src: 'https://example.com/3.jpg', alt: 'Valley' },
]

describe('ImageGallery', () => {
  it('shows a named button per image', () => {
    renderWithProvider(<ImageGallery images={images} />)
    expect(screen.getAllByRole('button', { name: /^View / })).toHaveLength(3)
    // Thumbnails are decorative inside their named buttons.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('opens the viewer and pages with the buttons and arrow keys', async () => {
    const onIndexChange = vi.fn()
    const { user } = renderWithProvider(
      <ImageGallery images={images} onIndexChange={onIndexChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'View Road' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
    const dialog = await screen.findByRole('dialog', { name: 'Road' })
    expect(dialog).toHaveTextContent('1 of 3')
    expect(screen.getByRole('img', { name: 'Road' })).toBeInTheDocument()
    expect(screen.getByText('Road to the canyon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next image' }))
    expect(await screen.findByRole('dialog', { name: 'Lake' })).toHaveTextContent('2 of 3')
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByRole('dialog', { name: 'Valley' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled()
    await user.keyboard('{ArrowLeft}')
    expect(await screen.findByRole('dialog', { name: 'Lake' })).toBeInTheDocument()
  })

  it('closes with the close button', async () => {
    const onIndexChange = vi.fn()
    const { user } = renderWithProvider(
      <ImageGallery images={images} defaultIndex={1} onIndexChange={onIndexChange} />,
    )
    await screen.findByRole('dialog', { name: 'Lake' })
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(null)
  })

  it('translates its labels', () => {
    renderWithProvider(
      <ImageGallery images={images} labels={{ open: (image) => `Open ${image.alt}` }} />,
    )
    expect(screen.getByRole('button', { name: 'Open Lake' })).toBeInTheDocument()
  })
})
