import { Button, HStack } from '@adv-ui/core'
import { ArrowRightIcon, MailIcon, PlusIcon } from '@adv-ui/icons'

export default function ButtonWithIcon() {
  return (
    <HStack gap="$2" flexWrap="wrap">
      <Button icon={<MailIcon />}>Login with email</Button>
      <Button variant="outline" icon={<PlusIcon />}>
        New project
      </Button>
      <Button variant="secondary" iconAfter={<ArrowRightIcon />}>
        Continue
      </Button>
    </HStack>
  )
}
