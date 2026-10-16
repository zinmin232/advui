import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { Button } from '../button/Button'
import { Text } from '../typography/Text'
import { Carousel } from './Carousel'
import { indexAt, lastIndexFor } from './shared'

const slides = (count: number) =>
  Array.from({ length: count }, (_, i) => <Text key={i}>{`Slide body ${i + 1}`}</Text>)

const dot = (n: number) => screen.getByRole('button', { name: `Go to slide ${n}` })
const status = () => screen.getByRole('status')

describe('Carousel', () => {
  it('is a named carousel region of named slides (APG)', () => {
    renderWithProvider(<Carousel aria-label="Featured">{slides(3)}</Carousel>)
    const region = screen.getByRole('region', { name: 'Featured' })
    expect(region).toHaveAttribute('aria-roledescription', 'carousel')
    const groups = screen.getAllByRole('group')
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      '1 of 3',
      '2 of 3',
      '3 of 3',
    ])
    expect(groups[0]).toHaveAttribute('aria-roledescription', 'slide')
    expect(screen.getByText('Slide body 2')).toBeInTheDocument()
    // The arrows and dots name the slide area they move.
    const track = document.getElementById(
      screen.getByRole('button', { name: 'Next slide' }).getAttribute('aria-controls')!,
    )
    expect(track).toContainElement(groups[0]!)
  })

  it('moves with the arrows, marks the current dot and announces the position', async () => {
    const onIndexChange = vi.fn()
    const { user } = renderWithProvider(
      <Carousel aria-label="Featured" onIndexChange={onIndexChange}>
        {slides(3)}
      </Carousel>,
    )
    const previous = screen.getByRole('button', { name: 'Previous slide' })
    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(previous).toBeDisabled()
    expect(dot(1)).toHaveAttribute('aria-current', 'true')

    await user.click(next)
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(dot(2)).toHaveAttribute('aria-current', 'true')
    expect(dot(1)).not.toHaveAttribute('aria-current')
    expect(status()).toHaveTextContent('Slide 2 of 3')

    await user.click(next)
    expect(next).toBeDisabled()
    await user.click(previous)
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
  })

  it('wraps around with loop', async () => {
    const onIndexChange = vi.fn()
    const { user } = renderWithProvider(
      <Carousel aria-label="Featured" loop onIndexChange={onIndexChange}>
        {slides(3)}
      </Carousel>,
    )
    await user.click(screen.getByRole('button', { name: 'Previous slide' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(2)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
  })

  it('jumps with the dots and follows a controlled index', async () => {
    function Controlled() {
      const [index, setIndex] = useState(0)
      return (
        <>
          <Carousel aria-label="Tour" index={index} onIndexChange={setIndex}>
            {slides(4)}
          </Carousel>
          <Button onPress={() => setIndex(3)}>Skip</Button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    await user.click(dot(3))
    expect(dot(3)).toHaveAttribute('aria-current', 'true')
    await user.click(screen.getByRole('button', { name: 'Skip' }))
    expect(dot(4)).toHaveAttribute('aria-current', 'true')
    expect(status()).toHaveTextContent('Slide 4 of 4')
  })

  it('shows a dot for each slide that can come first', () => {
    renderWithProvider(
      <Carousel aria-label="Plans" slidesPerView={2}>
        {slides(5)}
      </Carousel>,
    )
    // Slides 4 and 5 fill the last view.
    expect(screen.getAllByRole('button', { name: /^Go to slide/ })).toHaveLength(4)
  })

  it('pages with the arrow keys, Home and End on the slide area only', () => {
    const onIndexChange = vi.fn()
    renderWithProvider(
      <Carousel aria-label="Featured" onIndexChange={onIndexChange}>
        <Carousel.Item>
          <input aria-label="Note" />
        </Carousel.Item>
        {slides(3)}
      </Carousel>,
    )
    const track = document.getElementById(
      screen.getByRole('button', { name: 'Next slide' }).getAttribute('aria-controls')!,
    )!
    expect(track).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(track, { key: 'ArrowRight' })
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(track, { key: 'End' })
    expect(onIndexChange).toHaveBeenLastCalledWith(3)
    fireEvent.keyDown(track, { key: 'Home' })
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
    onIndexChange.mockClear()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Note' }), { key: 'ArrowRight' })
    expect(onIndexChange).not.toHaveBeenCalled()
  })

  it('scrolls the slide area when the index changes', async () => {
    const scrollTo = vi.spyOn(HTMLElement.prototype, 'scrollTo').mockImplementation(() => {})
    const { user } = renderWithProvider(
      <Carousel aria-label="Featured" defaultIndex={1}>
        {slides(3)}
      </Carousel>,
    )
    // The first scroll, to defaultIndex, jumps; later ones glide.
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    scrollTo.mockRestore()
  })

  it('has no controls for a single slide', () => {
    renderWithProvider(
      <Carousel aria-label="Featured" autoplay>
        {slides(1)}
      </Carousel>,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('hides the arrows or the dots on request, and translates its labels', () => {
    renderWithProvider(
      <>
        <Carousel
          aria-label="Destacados"
          showDots={false}
          labels={{
            carousel: 'carrusel',
            slideName: (index, count) => `${index + 1} de ${count}`,
            next: 'Siguiente',
          }}
        >
          {slides(2)}
        </Carousel>
        <Carousel aria-label="Dots only" showArrows={false}>
          {slides(2)}
        </Carousel>
      </>,
    )
    expect(screen.getByRole('region', { name: 'Destacados' })).toHaveAttribute(
      'aria-roledescription',
      'carrusel',
    )
    expect(screen.getByRole('group', { name: '2 de 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    const dotsOnly = within(screen.getByRole('region', { name: 'Dots only' }))
    expect(screen.getAllByRole('button', { name: /^Go to slide/ })).toHaveLength(2)
    expect(dotsOnly.getAllByRole('button', { name: /^Go to slide/ })).toHaveLength(2)
    expect(dotsOnly.queryByRole('button', { name: 'Previous slide' })).toBeNull()
  })

  describe('autoplay', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it('moves on its own without announcing, and waits while hovered', async () => {
      const onIndexChange = vi.fn()
      renderWithProvider(
        <Carousel aria-label="News" autoplay={1000} onIndexChange={onIndexChange}>
          {slides(2)}
        </Carousel>,
      )
      await act(() => vi.advanceTimersByTimeAsync(1050))
      expect(onIndexChange).toHaveBeenLastCalledWith(1)
      expect(status()).toHaveTextContent('')
      // After the last slide it starts again.
      await act(() => vi.advanceTimersByTimeAsync(1050))
      expect(onIndexChange).toHaveBeenLastCalledWith(0)

      onIndexChange.mockClear()
      const region = screen.getByRole('region', { name: 'News' })
      fireEvent.pointerEnter(region)
      await act(() => vi.advanceTimersByTimeAsync(3000))
      expect(onIndexChange).not.toHaveBeenCalled()
      fireEvent.pointerLeave(region)
      await act(() => vi.advanceTimersByTimeAsync(1050))
      expect(onIndexChange).toHaveBeenLastCalledWith(1)
    })

    it('stops with the pause button and waits while focus is inside', async () => {
      const onIndexChange = vi.fn()
      renderWithProvider(
        <Carousel aria-label="News" autoplay={1000} onIndexChange={onIndexChange}>
          {slides(3)}
        </Carousel>,
      )
      const pause = screen.getByRole('button', { name: 'Pause slide show' })
      act(() => pause.focus())
      await act(() => vi.advanceTimersByTimeAsync(3000))
      expect(onIndexChange).not.toHaveBeenCalled()

      fireEvent.click(pause)
      act(() => pause.blur())
      await act(() => vi.advanceTimersByTimeAsync(3000))
      expect(onIndexChange).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Play slide show' }))
      await act(() => vi.advanceTimersByTimeAsync(1050))
      expect(onIndexChange).toHaveBeenLastCalledWith(1)
    })

    it('starts paused when the user asks for less motion', async () => {
      const matchMedia = window.matchMedia
      window.matchMedia = ((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })) as unknown as typeof window.matchMedia
      try {
        const onIndexChange = vi.fn()
        renderWithProvider(
          <Carousel aria-label="News" autoplay={1000} onIndexChange={onIndexChange}>
            {slides(2)}
          </Carousel>,
        )
        expect(screen.getByRole('button', { name: 'Play slide show' })).toBeInTheDocument()
        await act(() => vi.advanceTimersByTimeAsync(3000))
        expect(onIndexChange).not.toHaveBeenCalled()
      } finally {
        window.matchMedia = matchMedia
      }
    })
  })
})

describe('carousel geometry', () => {
  it('counts the stops for whole and fractional slides per view', () => {
    expect(lastIndexFor(5, 1)).toBe(4)
    expect(lastIndexFor(5, 3)).toBe(2)
    // 1.2 per view: the last slide is first in view only at the end of the track.
    expect(lastIndexFor(5, 1.2)).toBe(4)
    expect(lastIndexFor(5, 2.5)).toBe(3)
    expect(lastIndexFor(2, 3)).toBe(0)
  })

  it('finds the slide first in view, with the end of the track as the last stop', () => {
    // 5 slides of 100px with 2.5 in view: stops at 0, 100, 200 and the end, 250.
    expect(indexAt(0, 100, 250, 3)).toBe(0)
    expect(indexAt(140, 100, 250, 3)).toBe(1)
    expect(indexAt(249.5, 100, 250, 3)).toBe(3)
    expect(indexAt(50, 0, 0, 3)).toBe(0)
  })
})
