import { AudioPlayer } from '@advui/core'

export default function AudioPlayerBasic() {
  return (
    <AudioPlayer
      maxWidth="$112"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
      title="Radio message: flood safety"
      subtitle="Community radio · Ayeyarwady"
    />
  )
}
