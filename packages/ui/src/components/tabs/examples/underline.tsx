import { Tabs, Text } from '@adv-ui/core'
import { BellIcon, SettingsIcon, UserIcon } from '@adv-ui/icons'

export default function TabsUnderline() {
  return (
    <Tabs defaultValue="profile" variant="underline" width="100%">
      <Tabs.List aria-label="Preferences">
        <Tabs.Trigger value="profile" icon={<UserIcon />}>
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger value="notifications" icon={<BellIcon />}>
          Notifications
        </Tabs.Trigger>
        <Tabs.Trigger value="advanced" icon={<SettingsIcon />} disabled>
          Advanced
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="profile" paddingVertical="$3">
        <Text>Public profile settings.</Text>
      </Tabs.Content>
      <Tabs.Content value="notifications" paddingVertical="$3">
        <Text>Choose what you get notified about.</Text>
      </Tabs.Content>
    </Tabs>
  )
}
