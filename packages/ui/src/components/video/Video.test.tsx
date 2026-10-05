import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { Video } from './Video'

describe('Video', () => {
  it('renders a named video with controls and caption tracks', () => {
    const { container } = renderWithProvider(
      <Video
        src="https://example.org/clip.mp4"
        poster="https://example.org/clip.jpg"
        title="Handwashing in five steps"
        captions={[{ src: '/clip.en.vtt', srcLang: 'en', label: 'English', default: true }]}
      />,
    )
    const video = container.querySelector('video')!
    expect(video).toHaveAttribute('aria-label', 'Handwashing in five steps')
    expect(video).toHaveAttribute('src', 'https://example.org/clip.mp4')
    expect(video).toHaveAttribute('poster', 'https://example.org/clip.jpg')
    expect(video).toHaveAttribute('controls')
    expect(video).toHaveAttribute('playsinline')
    const track = video.querySelector('track')!
    expect(track).toHaveAttribute('kind', 'captions')
    expect(track).toHaveAttribute('srclang', 'en')
    expect(track).toHaveAttribute('label', 'English')
    expect(video).not.toHaveAttribute('crossorigin')
  })

  it('fetches with CORS when captions come from another origin', () => {
    const { container } = renderWithProvider(
      <Video
        src="https://cdn.example.org/clip.mp4"
        title="Clip"
        crossOrigin="anonymous"
        captions={[{ src: 'https://cdn.example.org/clip.en.vtt', srcLang: 'en', label: 'English' }]}
      />,
    )
    expect(container.querySelector('video')).toHaveAttribute('crossorigin', 'anonymous')
  })

  it('mutes autoplay', () => {
    const { container } = renderWithProvider(
      <Video src="https://example.org/clip.mp4" title="Clip" autoPlay loop />,
    )
    const video = container.querySelector('video')!
    expect(video.muted).toBe(true)
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
  })

  it('shows a message when the video fails', () => {
    const onError = vi.fn()
    const { container } = renderWithProvider(
      <Video src="https://example.org/missing.mp4" title="Clip" onError={onError} />,
    )
    fireEvent.error(container.querySelector('video')!)
    expect(onError).toHaveBeenCalled()
    expect(container.querySelector('video')).toBeNull()
    expect(screen.getByText('This video can’t be played.')).toBeInTheDocument()
  })
})
