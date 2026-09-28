import { Video } from '@advui/core'

export default function VideoBasic() {
  return (
    <Video
      maxWidth="$144"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=70"
      title="A pink flower opening, time-lapse"
    />
  )
}
