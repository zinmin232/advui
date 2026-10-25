import { HStack, IconButton, Indicator, toast } from '@advui/core'
import { BellIcon, MailIcon } from '@advui/icons'
import { useState } from 'react'

export default function IndicatorCounts() {
  const [notifications, setNotifications] = useState(3)
  return (
    <HStack gap="2">
      {/* The count goes in the button's name, which replaces anything inside it. */}
      <IconButton
        aria-label={notifications ? `Notifications, ${notifications} unread` : 'Notifications'}
        icon={
          <Indicator count={notifications} size="sm">
            <BellIcon />
          </Indicator>
        }
        onPress={() => setNotifications(0)}
      />
      <IconButton
        aria-label="Messages, 12 unread"
        icon={
          <Indicator count={12} max={9} size="sm" tone="error">
            <MailIcon />
          </Indicator>
        }
        onPress={() => toast('Opening messages')}
      />
    </HStack>
  )
}
