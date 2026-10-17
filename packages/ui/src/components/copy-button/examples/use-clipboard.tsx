import { Button, toast, useClipboard } from '@advui/core'
import { CheckIcon, CodeIcon } from '@advui/icons'

const settings = { theme: 'dark', density: 'compact', locale: 'en-GB' }

export default function CopyButtonUseClipboard() {
  const { copy, status } = useClipboard()
  return (
    <Button
      variant="outline"
      icon={status === 'copied' ? <CheckIcon /> : <CodeIcon />}
      onPress={async () => {
        // A toast is announced, so screen reader users hear the result too.
        toast((await copy(JSON.stringify(settings, null, 2))) ? 'Settings copied' : 'Couldn’t copy')
      }}
    >
      Copy settings as JSON
    </Button>
  )
}
