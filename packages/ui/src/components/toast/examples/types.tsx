import { Button, HStack, toast } from '@adv-ui/core'

export default function ToastTypes() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button variant="outline" onPress={() => toast('Event created')}>
        Default
      </Button>
      <Button
        variant="outline"
        onPress={() => toast.success('Saved', { description: 'All changes are live.' })}
      >
        Success
      </Button>
      <Button variant="outline" onPress={() => toast.error('Upload failed')}>
        Error
      </Button>
      <Button variant="outline" onPress={() => toast.warning('Low battery')}>
        Warning
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Publishing…',
            success: 'Published!',
            error: 'Failed',
          })
        }
      >
        Promise
      </Button>
    </HStack>
  )
}
