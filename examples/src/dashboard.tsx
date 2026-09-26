import {
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  HStack,
  Progress,
  Tabs,
  Text,
  VStack,
} from '@advui/core'
import { CreditCardIcon, DownloadIcon, PackageIcon, UsersIcon, BarChartIcon } from '@advui/icons'
import { View } from 'tamagui'
import { Kpi, SectionTitle, avatarUrl, people } from './shared'

const bars = [42, 68, 51, 80, 62, 90, 74, 58, 86, 70, 95, 64]
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function DashboardScreen() {
  return (
    <VStack gap="$6" padding="$4" width="100%" $md={{ padding: '$8' }}>
      <HStack justifyContent="space-between" flexWrap="wrap" gap="$3">
        <VStack>
          <Text size="3xl" weight="bold">
            Dashboard
          </Text>
          <Text tone="muted">Your store at a glance</Text>
        </VStack>
        <Button icon={<DownloadIcon />}>Download report</Button>
      </HStack>

      <Tabs defaultValue="overview">
        <Tabs.List aria-label="Dashboard views">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
          <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview" gap="$4">
          <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4">
            <Kpi
              label="Total revenue"
              value="$45,231.89"
              delta="+20.1% from last month"
              icon={<CreditCardIcon size={16} color="$mutedForeground" />}
            />
            <Kpi
              label="Subscriptions"
              value="+2,350"
              delta="+180.1% from last month"
              icon={<UsersIcon size={16} color="$mutedForeground" />}
            />
            <Kpi
              label="Sales"
              value="+12,234"
              delta="+19% from last month"
              icon={<PackageIcon size={16} color="$mutedForeground" />}
            />
            <Kpi
              label="Active now"
              value="573"
              delta="+201 since last hour"
              icon={<BarChartIcon size={16} color="$mutedForeground" />}
            />
          </Grid>
          <Grid columns={{ base: 1, lg: 2 }} gap="$4">
            <Card>
              <Card.Header>
                <Card.Title>Overview</Card.Title>
                <Card.Description>Monthly revenue</Card.Description>
              </Card.Header>
              <Card.Content>
                <HStack
                  height="$48"
                  alignItems="flex-end"
                  gap="$2"
                  role="img"
                  aria-label="Bar chart of monthly revenue, peaking in November"
                >
                  {bars.map((value, index) => (
                    <VStack
                      key={index}
                      flex={1}
                      alignItems="center"
                      gap="$1"
                      height="100%"
                      justifyContent="flex-end"
                    >
                      <View
                        width="100%"
                        height={`${value}%`}
                        backgroundColor="$primary"
                        borderTopLeftRadius="$sm"
                        borderTopRightRadius="$sm"
                        opacity={index === 10 ? 1 : 0.75}
                      />
                      <Text size="xs" tone="muted" aria-hidden>
                        {months[index]}
                      </Text>
                    </VStack>
                  ))}
                </HStack>
              </Card.Content>
            </Card>
            <Card>
              <Card.Header>
                <Card.Title>Recent sales</Card.Title>
                <Card.Description>You made 265 sales this month.</Card.Description>
              </Card.Header>
              <Card.Content gap="$4">
                {people.map((p) => (
                  <HStack key={p.email} gap="$3">
                    <Avatar size="sm" alt={p.name} src={avatarUrl(p.img)} />
                    <VStack flex={1} minWidth={0}>
                      <Text size="sm" weight="medium" truncate>
                        {p.name}
                      </Text>
                      <Text size="xs" tone="muted" truncate>
                        {p.email}
                      </Text>
                    </VStack>
                    <Text size="sm" weight="medium">
                      {p.amount}
                    </Text>
                  </HStack>
                ))}
              </Card.Content>
            </Card>
          </Grid>
          <Card>
            <Card.Header>
              <SectionTitle title="Goals" description="Quarterly targets" />
            </Card.Header>
            <Card.Content gap="$4">
              {[
                { label: 'Revenue', value: 72, tone: 'primary' as const },
                { label: 'New customers', value: 91, tone: 'success' as const },
                { label: 'Churn reduction', value: 38, tone: 'warning' as const },
              ].map((goal) => (
                <VStack key={goal.label} gap="$2">
                  <HStack justifyContent="space-between">
                    <Text size="sm">{goal.label}</Text>
                    <Badge size="sm" variant="secondary">
                      {goal.value}%
                    </Badge>
                  </HStack>
                  <Progress value={goal.value} tone={goal.tone} label={`${goal.label} progress`} />
                </VStack>
              ))}
            </Card.Content>
          </Card>
        </Tabs.Content>
        <Tabs.Content value="analytics">
          <Text tone="muted">Analytics would render charts here (Charts are on the roadmap).</Text>
        </Tabs.Content>
        <Tabs.Content value="reports">
          <Text tone="muted">No reports generated yet.</Text>
        </Tabs.Content>
      </Tabs>
    </VStack>
  )
}
