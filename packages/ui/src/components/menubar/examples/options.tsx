import { Menubar } from '@advui/core'
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from '@advui/icons'
import { useState } from 'react'

export default function MenubarOptions() {
  const [ruler, setRuler] = useState(true)
  const [wordCount, setWordCount] = useState(false)
  const [align, setAlign] = useState('left')
  const [spacing, setSpacing] = useState('1.15')

  return (
    <Menubar aria-label="Formatting">
      <Menubar.Menu>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.CheckboxItem checked={ruler} onCheckedChange={setRuler}>
            Show ruler
          </Menubar.CheckboxItem>
          <Menubar.CheckboxItem checked={wordCount} onCheckedChange={setWordCount}>
            Show word count
          </Menubar.CheckboxItem>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Format</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Group>
            <Menubar.Label>Align</Menubar.Label>
            <Menubar.RadioGroup value={align} onValueChange={setAlign}>
              <Menubar.RadioItem value="left" icon={<AlignLeftIcon />}>
                Left
              </Menubar.RadioItem>
              <Menubar.RadioItem value="center" icon={<AlignCenterIcon />}>
                Center
              </Menubar.RadioItem>
              <Menubar.RadioItem value="right" icon={<AlignRightIcon />}>
                Right
              </Menubar.RadioItem>
            </Menubar.RadioGroup>
          </Menubar.Group>
          <Menubar.Separator />
          <Menubar.Group>
            <Menubar.Label>Line spacing</Menubar.Label>
            <Menubar.RadioGroup value={spacing} onValueChange={setSpacing}>
              <Menubar.RadioItem value="1">Single</Menubar.RadioItem>
              <Menubar.RadioItem value="1.15">1.15</Menubar.RadioItem>
              <Menubar.RadioItem value="2">Double</Menubar.RadioItem>
            </Menubar.RadioGroup>
          </Menubar.Group>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger disabled>Tools</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>Spelling</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar>
  )
}
