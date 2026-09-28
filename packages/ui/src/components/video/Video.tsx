import { useState } from 'react'
import { View } from 'tamagui'
import { type VideoProps, VideoFallback, defaultVideoLabels } from './shared'

/**
 * A video with the platform's own controls: `<video>` on web, the player
 * registered with `setVideoView` on iOS and Android.
 */
export function Video({
  src,
  title,
  poster,
  captions = [],
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
  const [failed, setFailed] = useState(false)
  return (
    <View
      width="100%"
      aspectRatio={ratio}
      borderRadius="$lg"
      overflow="hidden"
      backgroundColor="$muted"
      {...props}
    >
      {failed ? (
        <VideoFallback message={labels?.error ?? defaultVideoLabels.error} />
      ) : (
        <video
          src={typeof src === 'string' ? src : undefined}
          poster={poster}
          aria-label={title}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          // iOS Safari otherwise jumps to full screen on play.
          playsInline
          preload="metadata"
          onEnded={onEnded}
          onError={() => {
            setFailed(true)
            onError?.()
          }}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        >
          {captions.map((track) => (
            <track
              key={track.src}
              kind={track.kind ?? 'captions'}
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        </video>
      )}
    </View>
  )
}
