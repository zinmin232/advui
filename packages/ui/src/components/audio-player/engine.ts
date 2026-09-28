/** Playback state an engine reports; each update may carry only what changed. */
export interface AudioStatus {
  playing: boolean
  /** Seconds. */
  currentTime: number
  /** Seconds; 0 until known. */
  duration: number
  buffering: boolean
  ended: boolean
  error: boolean
}

/** One loaded sound. Audio Player drives it; the app supplies it on native. */
export interface AudioEngine {
  play: () => void
  pause: () => void
  /** Seconds from the start. */
  seek: (seconds: number) => void
  setRate: (rate: number) => void
  setLoop: (loop: boolean) => void
  /** Stops and frees the sound. */
  release: () => void
}

export type CreateAudioEngine = (
  source: string | number,
  onStatus: (status: Partial<AudioStatus>) => void,
) => AudioEngine

// A module value (not context) so it also reaches players inside native portals.
let appEngine: CreateAudioEngine | undefined

/**
 * Registers the app's native audio engine for every Audio Player, e.g. a
 * small wrapper around `expo-audio`. Web needs none: it uses `HTMLAudioElement`.
 */
export function setAudioEngine(create: CreateAudioEngine | undefined) {
  appEngine = create
}

export function getAudioEngine() {
  return appEngine
}

/** The web engine: an `Audio` element that is never added to the page. */
export const createHtmlAudioEngine: CreateAudioEngine = (source, onStatus) => {
  const audio = new Audio()
  audio.preload = 'metadata'
  audio.src = String(source)
  const sync = () =>
    onStatus({
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      playing: !audio.paused && !audio.ended,
    })
  const listeners: Record<string, () => void> = {
    loadedmetadata: sync,
    durationchange: sync,
    timeupdate: sync,
    play: () => onStatus({ playing: true, ended: false }),
    pause: sync,
    waiting: () => onStatus({ buffering: true }),
    playing: () => onStatus({ buffering: false, playing: true }),
    canplay: () => onStatus({ buffering: false }),
    ended: () => onStatus({ playing: false, ended: true }),
    error: () => onStatus({ playing: false, buffering: false, error: true }),
  }
  for (const [name, listener] of Object.entries(listeners)) audio.addEventListener(name, listener)
  return {
    // A blocked or failed play() rejects; the element's own events report why.
    play: () => void audio.play()?.catch(() => sync()),
    pause: () => audio.pause(),
    seek: (seconds) => {
      audio.currentTime = seconds
      sync()
    },
    setRate: (rate) => {
      audio.playbackRate = rate
    },
    setLoop: (loop) => {
      audio.loop = loop
    },
    release: () => {
      audio.pause()
      for (const [name, listener] of Object.entries(listeners))
        audio.removeEventListener(name, listener)
      audio.removeAttribute('src')
      audio.load()
    },
  }
}
