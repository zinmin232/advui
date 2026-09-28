import { AlertCircleIcon } from '@advui/icons'
import type { ComponentType } from 'react'
import { type GetProps, View } from 'tamagui'
import { Text } from '../typography/Text'

export interface VideoCaptionTrack {
  /** A WebVTT file. */
  src: string
  /** Language code, e.g. `en` or `my`. */
  srcLang: string
  /** Shown in the player's captions menu, e.g. "English". */
  label: string
  /** `captions` (default) include sounds; `subtitles` only speech. */
  kind?: 'captions' | 'subtitles'
  default?: boolean
}

export interface VideoLabels {
  /** Shown when the video cannot be played. */
  error: string
}

export const defaultVideoLabels: VideoLabels = {
  error: 'This video can’t be played.',
}

export interface VideoProps extends Omit<GetProps<typeof View>, 'children'> {
  /** A URL, or `require()` of a bundled file on native. */
  src: string | number
  /** Names the video for screen readers. Say what it shows. */
  title: string
  /** Image shown before playback (web). */
  poster?: string
  /** Caption or subtitle tracks (web). */
  captions?: VideoCaptionTrack[]
  /** Width / height. Default: 16 / 9. */
  ratio?: number
  /** Starts muted: browsers block autoplay with sound. */
  autoPlay?: boolean
  /** Default: `autoPlay`. */
  muted?: boolean
  loop?: boolean
  /** The platform's playback controls. Default: true. */
  controls?: boolean
  onEnded?: () => void
  onError?: () => void
  labels?: Partial<VideoLabels>
}

/** What the app's native player receives; see `setVideoView`. */
export interface NativeVideoViewProps {
  source: string | number
  autoPlay: boolean
  muted: boolean
  loop: boolean
  controls: boolean
  accessibilityLabel: string
  onEnded?: () => void
  onError?: () => void
  style: { width: '100%'; height: '100%' }
}

// A module value (not context) so it also reaches videos inside native portals.
let appVideoView: ComponentType<NativeVideoViewProps> | undefined

/**
 * Registers the app's native video player for every Video, e.g. a small
 * wrapper around `expo-video`. Web needs none: it uses `<video>`.
 */
export function setVideoView(view: ComponentType<NativeVideoViewProps> | undefined) {
  appVideoView = view
}

export function getVideoView() {
  return appVideoView
}

/** Shown in place of the video when it fails, or when native has no player. */
export function VideoFallback({ message }: { message: string }) {
  return (
    <View flex={1} alignItems="center" justifyContent="center" gap="$2" padding="$4">
      <View aria-hidden>
        <AlertCircleIcon size={24} color="$mutedForeground" />
      </View>
      <Text size="sm" tone="muted" textAlign="center">
        {message}
      </Text>
    </View>
  )
}
