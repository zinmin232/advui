import { Button, toast } from '@adv-ui/core'

export default function ToastAction() {
  return (
    <Button
      variant="outline"
      onPress={() =>
        toast('Message archived', {
          action: { label: 'Undo', onClick: () => toast.success('Restored') },
        })
      }
    >
      Archive message
    </Button>
  )
}
