import { Video } from '@advui/core'

export default function VideoMutedLoop() {
  return (
    // No sound, so no captions are needed.
    <Video
      maxWidth="$96"
      ratio={1}
      src="https://zinmin232.github.io/advui/media/handwashing-loop.mp4"
      title="The five handwashing steps, looping without sound"
      muted
      loop
    />
  )
}
