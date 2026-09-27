import { Button, ButtonGroup, IconButton } from '@advui/core'
import { ChevronDownIcon, GitBranchIcon } from '@advui/icons'

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup aria-label="Merge">
      <Button icon={<GitBranchIcon />}>Merge pull request</Button>
      <IconButton aria-label="More merge options" icon={<ChevronDownIcon />} />
    </ButtonGroup>
  )
}
