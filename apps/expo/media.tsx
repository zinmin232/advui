import { type NativeVideoViewProps, setAudioEngine, setVideoView } from '@advui/core'
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import { useEventListener } from 'expo'
import { VideoView, useVideoPlayer } from 'expo-video'

// Video: the library draws the frame; expo-video plays inside it.
function ExpoVideo({
  source,
  autoPlay,
  muted,
  loop,
  controls,
  accessibilityLabel,
  onEnded,
  onError,
  style,
}: NativeVideoViewProps) {
  const player = useVideoPlayer(typeof source === 'string' ? { uri: source } : source, (p) => {
    p.loop = loop
    p.muted = muted
    if (autoPlay) p.play()
  })
  useEventListener(player, 'playToEnd', () => onEnded?.())
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') onError?.()
  })
  return (
    <VideoView
      player={player}
      nativeControls={controls}
      contentFit="contain"
      accessibilityLabel={accessibilityLabel}
      style={style}
    />
  )
}

export function registerMedia() {
  setVideoView(ExpoVideo)

  // Sound plays with the iPhone's silent switch on, as people expect from a player.
  void setAudioModeAsync({ playsInSilentMode: true })
  setAudioEngine((source, onStatus) => {
    const player = createAudioPlayer(source)
    const subscription = player.addListener('playbackStatusUpdate', (status) =>
      onStatus({
        playing: status.playing,
        currentTime: status.currentTime,
        duration: status.duration,
        buffering: status.isBuffering,
        ...(status.didJustFinish && { ended: true, playing: false }),
      }),
    )
    return {
      play: () => {
        onStatus({ ended: false })
        player.play()
      },
      pause: () => player.pause(),
      seek: (seconds) => void player.seekTo(seconds),
      setRate: (rate) => player.setPlaybackRate(rate),
      setLoop: (loop) => {
        player.loop = loop
      },
      release: () => {
        subscription.remove()
        player.remove()
      },
    }
  })
}
