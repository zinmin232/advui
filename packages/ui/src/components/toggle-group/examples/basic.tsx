import { ToggleGroup } from '@advui/core'
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from '@advui/icons'

export default function ToggleGroupBasic() {
  return (
    <ToggleGroup type="single" defaultValue="left" aria-label="Text alignment">
      <ToggleGroup.Item value="left" aria-label="Align left" icon={<AlignLeftIcon />} />
      <ToggleGroup.Item value="center" aria-label="Align center" icon={<AlignCenterIcon />} />
      <ToggleGroup.Item value="right" aria-label="Align right" icon={<AlignRightIcon />} />
    </ToggleGroup>
  )
}
