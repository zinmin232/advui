import { PauseIcon, PlayIcon, RotateCcwIcon, RotateCwIcon } from '@advui/icons'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { type GetProps, View, XStack, isWeb } from 'tamagui'
import { Button } from '../button/Button'
import { IconButton } from '../icon-button/IconButton'
import { Slider } from '../slider/Slider'
import { Spinner } from '../spinner/Spinner'
import { Text } from '../typography/Text'
import { type AudioEngine, type AudioStatus, createHtmlAudioEngine, getAudioEngine } from './engine'

export interface AudioPlayerLabels {
  play: string
  pause: string
  seek: string
  /** Name of the skip buttons. Default: "Back 10 seconds". */
  back: (seconds: number) => string
  forward: (seconds: number) => string
  /** Name of the speed button, with its value. Default: "Playback speed, 1×". */
  rate: (rate: number) => string
  /** The seek bar's value: "1:05 of 3:20". */
  position: (current: string, duration: string) => string
  error: string
}

const defaultLabels: AudioPlayerLabels = {
  play: 'Play',
  pause: 'Pause',
  seek: 'Seek',
  back: (seconds) => `Back ${seconds} seconds`,
  forward: (seconds) => `Forward ${seconds} seconds`,
  rate: (rate) => `Playback speed, ${rate}×`,
  position: (current, duration) => `${current} of ${duration}`,
  error: 'This audio can’t be played.',
}

/** "1:05", or "1:02:05" past an hour. */
export function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export interface AudioPlayerProps extends Omit<GetProps<typeof View>, 'children'> {
  /** A URL, or `require()` of a bundled file on native. */
  src: string | number
  /** Names the player and is shown as its heading. */
  title: string
  /** A second line, e.g. the speaker or date. */
  subtitle?: string
  /** Artwork or an icon before the title. */
  artwork?: ReactNode
  /** Seconds moved by the skip buttons; 0 hides them. Default: 10. */
  skip?: number
  /** Speeds the speed button cycles through; one hides it. Default: 1, 1.25, 1.5, 2. */
  rates?: number[]
  autoPlay?: boolean
  loop?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  labels?: Partial<AudioPlayerLabels>
}

const initialStatus: AudioStatus = {
  playing: false,
  currentTime: 0,
  duration: 0,
  buffering: false,
  ended: false,
  error: false,
}

let warned = false

/**
 * Plays a sound with a play button, a seek bar, skip buttons and a speed
 * control. Web uses the browser's audio; native uses `setAudioEngine`.
 */
export function AudioPlayer({
  src,
  title,
  subtitle,
  artwork,
  skip = 10,
  rates = [1, 1.25, 1.5, 2],
  autoPlay = false,
  loop = false,
  onPlay,
  onPause,
  onEnded,
  labels: labelsProp,
  ...props
}: AudioPlayerProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [status, setStatus] = useState(initialStatus)
  const [supported, setSupported] = useState(true)
  // The thumb's position while it is dragged, so time updates don't fight it.
  const [scrub, setScrub] = useState<number | null>(null)
  const [rate, setRate] = useState(rates[0] ?? 1)
  const engine = useRef<AudioEngine | null>(null)
  const callbacks = useRef({ onEnded })
  callbacks.current = { onEnded }

  useEffect(() => {
    const create = getAudioEngine() ?? (isWeb ? createHtmlAudioEngine : undefined)
    if (!create) {
      setSupported(false)
      // A missing engine is a setup mistake; say so once instead of a dead button.
      if (!warned) {
        warned = true
        console.warn(
          'Audio Player: no native audio engine. Call setAudioEngine() at app start (e.g. with expo-audio).',
        )
      }
      return
    }
    setStatus(initialStatus)
    const instance = create(src, (patch) => {
      setStatus((current) => ({ ...current, ...patch }))
      if (patch.ended) callbacks.current.onEnded?.()
    })
    instance.setLoop(loop)
    if (autoPlay) instance.play()
    engine.current = instance
    return () => {
      instance.release()
      engine.current = null
    }
    // A new source is a new sound; the other props apply to it below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => engine.current?.setLoop(loop), [loop])
  useEffect(() => engine.current?.setRate(rate), [rate])

  const disabled = !supported || status.error
  const ready = status.duration > 0
  const time = scrub ?? status.currentTime

  const toggle = () => {
    const current = engine.current
    if (!current) return
    if (status.playing) {
      current.pause()
      onPause?.()
    } else {
      // Play again from the start once it has ended.
      if (status.ended || (ready && status.currentTime >= status.duration)) current.seek(0)
      current.play()
      onPlay?.()
    }
  }

  const seekBy = (delta: number) => {
    const target = Math.max(0, Math.min(status.duration, status.currentTime + delta))
    engine.current?.seek(target)
    setStatus((current) => ({ ...current, currentTime: target, ended: false }))
  }

  const nextRate = () => setRate(rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1)

  return (
    <View
      {...(isWeb ? { role: 'group' } : {})}
      aria-label={title}
      width="100%"
      gap="$3"
      padding="$3"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      backgroundColor="$card"
      {...props}
    >
      <XStack alignItems="center" gap="$3">
        <IconButton
          variant="default"
          circular
          size="lg"
          aria-label={status.playing ? labels.pause : labels.play}
          icon={
            status.buffering ? <Spinner size="sm" /> : status.playing ? <PauseIcon /> : <PlayIcon />
          }
          disabled={disabled}
          onPress={toggle}
        />
        {artwork ? <View aria-hidden>{artwork}</View> : null}
        <View flex={1} minWidth={0}>
          <Text size="sm" weight="semibold" color="$cardForeground" numberOfLines={1}>
            {title}
          </Text>
          {status.error || !supported ? (
            <Text size="xs" tone="error">
              {labels.error}
            </Text>
          ) : subtitle ? (
            <Text size="xs" tone="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rates.length > 1 ? (
          <Button
            size="sm"
            variant="ghost"
            aria-label={labels.rate(rate)}
            disabled={disabled}
            onPress={nextRate}
            minWidth="$12"
          >
            {`${rate}×`}
          </Button>
        ) : null}
      </XStack>
      <XStack alignItems="center" gap="$2">
        {skip > 0 ? (
          <IconButton
            size="sm"
            aria-label={labels.back(skip)}
            icon={<RotateCcwIcon />}
            disabled={disabled || !ready}
            onPress={() => seekBy(-skip)}
          />
        ) : null}
        <Text aria-hidden size="xs" tone="muted" minWidth="$10" textAlign="right">
          {formatTime(time)}
        </Text>
        <Slider
          flex={1}
          size="sm"
          aria-label={labels.seek}
          min={0}
          max={Math.max(1, Math.floor(status.duration))}
          step={1}
          value={Math.floor(time)}
          disabled={disabled || !ready}
          getValueText={(value) =>
            labels.position(formatTime(value), ready ? formatTime(status.duration) : '–')
          }
          onValueChange={(value) => setScrub(Array.isArray(value) ? value[0]! : value)}
          onValueCommit={(value) => {
            const target = Array.isArray(value) ? value[0]! : value
            engine.current?.seek(target)
            setStatus((current) => ({ ...current, currentTime: target, ended: false }))
            setScrub(null)
          }}
        />
        <Text aria-hidden size="xs" tone="muted" minWidth="$10">
          {ready ? formatTime(status.duration) : '–:––'}
        </Text>
        {skip > 0 ? (
          <IconButton
            size="sm"
            aria-label={labels.forward(skip)}
            icon={<RotateCwIcon />}
            disabled={disabled || !ready}
            onPress={() => seekBy(skip)}
          />
        ) : null}
      </XStack>
    </View>
  )
}
