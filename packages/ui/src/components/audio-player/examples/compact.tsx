import { AudioPlayer } from '@advui/core'
import { MailIcon } from '@advui/icons'

export default function AudioPlayerCompact() {
  return (
    <AudioPlayer
      maxWidth="$96"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
      title="Voice message from Daw Hla"
      artwork={<MailIcon size={20} color="$mutedForeground" />}
      skip={0}
      rates={[1]}
    />
  )
}
