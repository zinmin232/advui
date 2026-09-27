import { Avatar, Button, HStack, Sheet, Text, VStack } from '@advui/core'
import { BellIcon } from '@advui/icons'

const activity = [
  { who: 'Grace Hopper', what: 'deployed Atlas to production', when: '2m' },
  { who: 'Alan Turing', what: 'commented on “Checkout flow”', when: '14m' },
  { who: 'Katherine Johnson', what: 'approved your pull request', when: '1h' },
  { who: 'Linus Torvalds', what: 'pushed 3 commits to main', when: '2h' },
  { who: 'Margaret Hamilton', what: 'invited you to “Apollo”', when: '3h' },
  { who: 'Tim Berners-Lee', what: 'shared a link with the team', when: '5h' },
  { who: 'Barbara Liskov', what: 'resolved 4 comments', when: '1d' },
  { who: 'Donald Knuth', what: 'starred Atlas', when: '2d' },
]

export default function SheetScroll() {
  return (
    <Sheet>
      <Sheet.Trigger>
        <Button variant="outline" icon={<BellIcon />}>
          Activity
        </Button>
      </Sheet.Trigger>
      {/* Opens at 85% of the screen; drag the handle down to half height. */}
      <Sheet.Content snapPoints={[85, 50]}>
        <Sheet.Header>
          <Sheet.Title>Activity</Sheet.Title>
          <Sheet.Description>What happened in your projects today.</Sheet.Description>
        </Sheet.Header>
        <Sheet.ScrollView>
          <VStack gap="$4" paddingBottom="$4">
            {activity.map((item) => (
              <HStack key={item.who} gap="$3" alignItems="center">
                {/* The name is in the text next to it. */}
                <Avatar size="sm" alt={item.who} aria-hidden />
                <VStack flex={1}>
                  <Text size="sm">
                    <Text size="sm" weight="semibold">
                      {item.who}
                    </Text>{' '}
                    {item.what}
                  </Text>
                  <Text size="xs" tone="muted">
                    {item.when} ago
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </Sheet.ScrollView>
      </Sheet.Content>
    </Sheet>
  )
}
