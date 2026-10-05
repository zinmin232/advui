import { AudioPlayer } from '@advui/core'
import { MailIcon } from '@advui/icons'

export default function AudioPlayerCompact() {
  return (
    <AudioPlayer
      maxWidth="$96"
      src="https://zinmin232.github.io/advui/media/voice-message.mp3"
      title="Voice message from Daw Hla"
      artwork={<MailIcon size={20} color="$mutedForeground" />}
      skip={0}
      rates={[1]}
    />
  )
}
