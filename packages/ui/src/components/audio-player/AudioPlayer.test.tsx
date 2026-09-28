import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen } from '../../../test/utils'
import { AudioPlayer, formatTime } from './AudioPlayer'
import { type AudioStatus, type CreateAudioEngine, setAudioEngine } from './engine'

function fakeEngine() {
  let report: (status: Partial<AudioStatus>) => void = () => {}
  const engine = {
    play: vi.fn(() => report({ playing: true })),
    pause: vi.fn(() => report({ playing: false })),
    seek: vi.fn(),
    setRate: vi.fn(),
    setLoop: vi.fn(),
    release: vi.fn(),
  }
  const create: CreateAudioEngine = (_source, onStatus) => {
    report = onStatus
    return engine
  }
  return { engine, create, report: (status: Partial<AudioStatus>) => act(() => report(status)) }
}

afterEach(() => setAudioEngine(undefined))

describe('formatTime', () => {
  it('shows minutes and seconds, and hours when needed', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65.4)).toBe('1:05')
    expect(formatTime(3725)).toBe('1:02:05')
  })
})

describe('AudioPlayer', () => {
  it('is a named group that plays and pauses', async () => {
    const fake = fakeEngine()
    setAudioEngine(fake.create)
    const onPlay = vi.fn()
    const { user } = renderWithProvider(
      <AudioPlayer src="https://example.org/a.mp3" title="Flood safety" onPlay={onPlay} />,
    )
    expect(screen.getByRole('group', { name: 'Flood safety' })).toBeInTheDocument()
    await fake.report({ duration: 200 })
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(fake.engine.play).toHaveBeenCalled()
    expect(onPlay).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(fake.engine.pause).toHaveBeenCalled()
  })

  it('reads the position on the seek bar and skips', async () => {
    const fake = fakeEngine()
    setAudioEngine(fake.create)
    const { user } = renderWithProvider(<AudioPlayer src="a.mp3" title="Flood safety" />)
    const seek = screen.getByRole('slider', { name: 'Seek' })
    expect(screen.getByRole('button', { name: 'Forward 10 seconds' })).toBeDisabled()
    await fake.report({ duration: 200, currentTime: 65 })
    expect(seek).toHaveAttribute('aria-valuetext', '1:05 of 3:20')
    await user.click(screen.getByRole('button', { name: 'Forward 10 seconds' }))
    expect(fake.engine.seek).toHaveBeenLastCalledWith(75)
    await user.click(screen.getByRole('button', { name: 'Back 10 seconds' }))
    expect(fake.engine.seek).toHaveBeenLastCalledWith(65)
  })

  it('cycles the playback speed', async () => {
    const fake = fakeEngine()
    setAudioEngine(fake.create)
    const { user } = renderWithProvider(<AudioPlayer src="a.mp3" title="Clip" rates={[1, 2]} />)
    await user.click(screen.getByRole('button', { name: 'Playback speed, 1×' }))
    expect(fake.engine.setRate).toHaveBeenLastCalledWith(2)
    expect(screen.getByRole('button', { name: 'Playback speed, 2×' })).toBeInTheDocument()
  })

  it('reports the end, and disables itself on error', async () => {
    const fake = fakeEngine()
    setAudioEngine(fake.create)
    const onEnded = vi.fn()
    const { unmount } = renderWithProvider(
      <AudioPlayer src="a.mp3" title="Clip" onEnded={onEnded} />,
    )
    await fake.report({ ended: true, playing: false })
    expect(onEnded).toHaveBeenCalled()
    await fake.report({ error: true })
    expect(screen.getByText('This audio can’t be played.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
    unmount()
    expect(fake.engine.release).toHaveBeenCalled()
  })
})
