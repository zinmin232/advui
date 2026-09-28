import { Video } from '@advui/core'

export default function VideoMutedLoop() {
  return (
    <Video
      maxWidth="$96"
      ratio={1}
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      title="A pink flower opening, looping without sound"
      muted
      loop
    />
  )
}
