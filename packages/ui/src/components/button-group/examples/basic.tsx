import { Button, ButtonGroup, IconButton } from '@advui/core'
import { MoreHorizontalIcon } from '@advui/icons'

export default function ButtonGroupBasic() {
  return (
    <ButtonGroup aria-label="Message actions" variant="outline">
      <Button>Archive</Button>
      <Button>Report</Button>
      <Button>Snooze</Button>
      <IconButton aria-label="More actions" icon={<MoreHorizontalIcon />} />
    </ButtonGroup>
  )
}
