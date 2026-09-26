import { Button, DropdownMenu, toast } from '@advui/core'
import { ChevronDownIcon, CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from '@advui/icons'

export default function DropdownMenuBasic() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <Button variant="outline" iconAfter={<ChevronDownIcon />}>
          My account
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>ada@example.com</DropdownMenu.Label>
        <DropdownMenu.Item icon={<UserIcon />} shortcut="⇧⌘P" onSelect={() => toast('Profile')}>
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<CreditCardIcon />} onSelect={() => toast('Billing')}>
          Billing
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<SettingsIcon />} shortcut="⌘," onSelect={() => toast('Settings')}>
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled>Team (coming soon)</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<LogOutIcon />} destructive onSelect={() => toast('Signed out')}>
          Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
