import { useEffect, useState } from 'react'
import { View } from 'tamagui'
import { type VideoProps, VideoFallback, defaultVideoLabels, getVideoView } from './shared'

let warned = false

/**
 * A video with the platform's own controls: `<video>` on web, the player
 * registered with `setVideoView` on iOS and Android.
 */
export function Video({
  src,
  title,
  poster: _poster,
  captions: _captions,
  ratio = 16 / 9,
  autoPlay = false,
  muted = autoPlay,
  loop = false,
  controls = true,
  onEnded,
  onError,
  labels,
  ...props
}: VideoProps) {
  const Player = getVideoView()
  const [failed, setFailed] = useState(false)
  // A missing player is a setup mistake; say so once instead of showing a blank box.
  useEffect(() => {
    if (Player || warned) return
    warned = true
    console.warn(
      'Video: no native player. Call setVideoView() at app start (e.g. with expo-video).',
    )
  }, [Player])

  return (
    <View
      width="100%"
      aspectRatio={ratio}
      borderRadius="$lg"
      overflow="hidden"
      backgroundColor="$muted"
      {...props}
    >
      {Player && !failed ? (
        <Player
          source={src}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          accessibilityLabel={title}
          onEnded={onEnded}
          onError={() => {
            setFailed(true)
            onError?.()
          }}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <VideoFallback message={labels?.error ?? defaultVideoLabels.error} />
      )}
    </View>
  )
}
