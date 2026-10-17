import { Menubar, toast } from '@advui/core'

export default function MenubarBasic() {
  return (
    <Menubar aria-label="Document">
      <Menubar.Menu>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item shortcut="⌘N" onSelect={() => toast('New document')}>
            New document
          </Menubar.Item>
          <Menubar.Item shortcut="⌘O" onSelect={() => toast('Open')}>
            Open…
          </Menubar.Item>
          <Menubar.Item onSelect={() => toast('Copy made')}>Make a copy</Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item disabled>Download (offline)</Menubar.Item>
          <Menubar.Item shortcut="⌘P" onSelect={() => toast('Print')}>
            Print
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item destructive onSelect={() => toast('Moved to bin')}>
            Move to bin
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item shortcut="⌘Z" onSelect={() => toast('Undo')}>
            Undo
          </Menubar.Item>
          <Menubar.Item shortcut="⇧⌘Z" onSelect={() => toast('Redo')}>
            Redo
          </Menubar.Item>
          <Menubar.Separator />
          <Menubar.Item shortcut="⌘X" onSelect={() => toast('Cut')}>
            Cut
          </Menubar.Item>
          <Menubar.Item shortcut="⌘C" onSelect={() => toast('Copied')}>
            Copy
          </Menubar.Item>
          <Menubar.Item shortcut="⌘V" onSelect={() => toast('Pasted')}>
            Paste
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu>
        <Menubar.Trigger>Help</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item shortcut="⌘/" onSelect={() => toast('Keyboard shortcuts')}>
            Keyboard shortcuts
          </Menubar.Item>
          <Menubar.Item onSelect={() => toast('Thanks for the report')}>
            Report a problem
          </Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar>
  )
}
