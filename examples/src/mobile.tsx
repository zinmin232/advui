import {
  Avatar,
  Badge,
  Card,
  Grid,
  HStack,
  IconButton,
  Input,
  Label,
  Separator,
  Switch,
  Text,
  VStack,
  toast,
} from '@advui/core'
import {
  BellIcon,
  ChevronRightIcon,
  CreditCardIcon,
  GlobeIcon,
  LockIcon,
  LogOutIcon,
  MoonIcon,
  PackageIcon,
  SearchIcon,
  ShoppingCartIcon,
  StarIcon,
  UserIcon,
} from '@advui/icons'
import { type ReactNode, useState } from 'react'
import { View } from 'tamagui'
import { InputIcon, avatarUrl } from './shared'

const actions = [
  { label: 'Orders', icon: <PackageIcon />, badge: '2' },
  { label: 'Cart', icon: <ShoppingCartIcon /> },
  { label: 'Wallet', icon: <CreditCardIcon /> },
  { label: 'Saved', icon: <StarIcon /> },
]

export function MobileHomeScreen() {
  return (
    <VStack gap="$5" padding="$4" width="100%">
      <HStack justifyContent="space-between">
        <HStack gap="$3">
          <Avatar alt="Isabella Nguyen" src={avatarUrl(47)} />
          <VStack>
            <Text size="sm" tone="muted">
              Good morning
            </Text>
            <Text weight="semibold" size="lg">
              Isabella
            </Text>
          </VStack>
        </HStack>
        <IconButton
          aria-label="Notifications, 3 unread"
          variant="outline"
          circular
          icon={<BellIcon />}
          onPress={() => toast('3 new notifications')}
        />
      </HStack>

      <HStack position="relative">
        <Input
          aria-label="Search products"
          placeholder="Search products"
          flex={1}
          size="lg"
          paddingLeft="$10"
          borderRadius="$full"
        />
        <InputIcon>
          <SearchIcon size={18} color="$mutedForeground" />
        </InputIcon>
      </HStack>

      <Card backgroundColor="$primary" borderWidth={0}>
        <Card.Content gap="$2">
          <Badge variant="secondary" size="sm">
            Weekend deal
          </Badge>
          <Text size="xl" weight="bold" color="$primaryForeground">
            20% off running gear
          </Text>
          <Text size="sm" color="$primaryForeground" opacity={0.85}>
            Ends Sunday at midnight.
          </Text>
        </Card.Content>
      </Card>

      <Grid columns={4} gap="$2">
        {actions.map((action) => (
          <VStack
            key={action.label}
            render="button"
            role="button"
            aria-label={action.badge ? `${action.label}, ${action.badge} new` : action.label}
            alignItems="center"
            gap="$1.5"
            paddingVertical="$3"
            borderRadius="$lg"
            backgroundColor="$muted"
            borderWidth={0}
            cursor="pointer"
            pressStyle={{ backgroundColor: '$accentHover' }}
            onPress={() => toast(action.label)}
          >
            <View position="relative">
              {action.icon}
              {action.badge ? (
                <View
                  position="absolute"
                  top="$-1.5"
                  right="$-2"
                  backgroundColor="$destructive"
                  borderRadius="$full"
                  minWidth="$4"
                  height="$4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text size="xs" color="$destructiveForeground" fontSize={10} lineHeight={12}>
                    {action.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text size="xs" weight="medium">
              {action.label}
            </Text>
          </VStack>
        ))}
      </Grid>

      <VStack gap="$3">
        <HStack justifyContent="space-between">
          <Text weight="semibold" size="lg">
            Recent orders
          </Text>
          <Text size="sm" tone="primary" onPress={() => toast('All orders')}>
            See all
          </Text>
        </HStack>
        {[
          { id: '#4821', item: 'Velocity Runner 3', status: 'Shipped', variant: 'info' as const },
          {
            id: '#4790',
            item: 'Trail Socks (3 pack)',
            status: 'Delivered',
            variant: 'success' as const,
          },
        ].map((order) => (
          <Card
            key={order.id}
            interactive
            role="button"
            aria-label={`Order ${order.id}, ${order.status}`}
            onPress={() => toast(`Order ${order.id}`)}
          >
            <Card.Content>
              <HStack gap="$3">
                <View
                  width="$10"
                  height="$10"
                  borderRadius="$md"
                  backgroundColor="$muted"
                  alignItems="center"
                  justifyContent="center"
                >
                  <PackageIcon size={18} />
                </View>
                <VStack flex={1}>
                  <Text weight="medium">{order.item}</Text>
                  <Text size="sm" tone="muted">
                    Order {order.id}
                  </Text>
                </VStack>
                <Badge variant={order.variant} size="sm">
                  {order.status}
                </Badge>
              </HStack>
            </Card.Content>
          </Card>
        ))}
      </VStack>
    </VStack>
  )
}

function SettingsRow({
  icon,
  label,
  value,
  control,
  onPress,
  id,
}: {
  icon: ReactNode
  label: string
  value?: string
  control?: ReactNode
  onPress?: () => void
  id?: string
}) {
  const content = (
    <HStack gap="$3" minHeight="$12" paddingHorizontal="$4" paddingVertical="$2">
      <View
        width="$8"
        height="$8"
        borderRadius="$md"
        backgroundColor="$muted"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </View>
      {id ? (
        <Label htmlFor={id} flex={1}>
          {label}
        </Label>
      ) : (
        <Text flex={1}>{label}</Text>
      )}
      {value ? (
        <Text size="sm" tone="muted">
          {value}
        </Text>
      ) : null}
      {control ?? <ChevronRightIcon size={18} color="$mutedForeground" />}
    </HStack>
  )
  if (!onPress) return content
  return (
    <View
      render="button"
      role="button"
      aria-label={value ? `${label}: ${value}` : label}
      onPress={onPress}
      cursor="pointer"
      borderWidth={0}
      backgroundColor="transparent"
      padding={0}
      pressStyle={{ backgroundColor: '$accent' }}
    >
      {content}
    </View>
  )
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <VStack gap="$2">
      <Text
        size="xs"
        weight="semibold"
        tone="muted"
        textTransform="uppercase"
        letterSpacing={0.6}
        paddingHorizontal="$4"
      >
        {title}
      </Text>
      <Card>{children}</Card>
    </VStack>
  )
}

export function MobileSettingsScreen() {
  const [dark, setDark] = useState(false)
  const [push, setPush] = useState(true)
  return (
    <VStack gap="$6" padding="$4" width="100%">
      <HStack
        gap="$3"
        padding="$4"
        backgroundColor="$card"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$border"
      >
        <Avatar size="lg" alt="Isabella Nguyen" src={avatarUrl(47)} />
        <VStack flex={1}>
          <Text weight="semibold" size="lg">
            Isabella Nguyen
          </Text>
          <Text size="sm" tone="muted">
            isabella@acme.co
          </Text>
        </VStack>
        <Badge variant="info" size="sm">
          Pro
        </Badge>
      </HStack>

      <SettingsGroup title="Account">
        <SettingsRow
          icon={<UserIcon size={16} />}
          label="Personal info"
          onPress={() => toast('Personal info')}
        />
        <Separator />
        <SettingsRow
          icon={<LockIcon size={16} />}
          label="Password & security"
          onPress={() => toast('Security')}
        />
        <Separator />
        <SettingsRow
          icon={<CreditCardIcon size={16} />}
          label="Payment methods"
          value="Visa ••42"
          onPress={() => toast('Payments')}
        />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        <SettingsRow
          icon={<BellIcon size={16} />}
          label="Push notifications"
          id="mobile-push"
          control={<Switch id="mobile-push" checked={push} onCheckedChange={setPush} />}
        />
        <Separator />
        <SettingsRow
          icon={<MoonIcon size={16} />}
          label="Dark mode"
          id="mobile-dark"
          control={<Switch id="mobile-dark" checked={dark} onCheckedChange={setDark} />}
        />
        <Separator />
        <SettingsRow
          icon={<GlobeIcon size={16} />}
          label="Language"
          value="English"
          onPress={() => toast('Language')}
        />
      </SettingsGroup>

      <SettingsGroup title="Session">
        <SettingsRow
          icon={<LogOutIcon size={16} color="$destructive" />}
          label="Sign out"
          onPress={() => toast('Signed out')}
        />
      </SettingsGroup>
      <Text size="xs" tone="muted" textAlign="center">
        Version 0.1.0
      </Text>
    </VStack>
  )
}
