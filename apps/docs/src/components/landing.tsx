'use client'

import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Grid,
  HStack,
  Input,
  Label,
  Progress,
  Select,
  Switch,
  Tabs,
  Text,
  VStack,
  toast,
} from '@adv-ui/core'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CodeIcon,
  GlobeIcon,
  PaletteIcon,
  SmartphoneIcon,
  StarIcon,
} from '@adv-ui/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { View } from 'tamagui'
import { siteConfig } from '../lib/site'
import { CopyButton } from './code-block'
import { SiteHeader } from './site-header'

const features: Array<{ icon: ReactNode; title: string; body: string }> = [
  {
    icon: <SmartphoneIcon />,
    title: 'Web, iOS and Android',
    body: 'One component, three platforms. Semantic HTML in Next.js, native views in Expo.',
  },
  {
    icon: <PaletteIcon />,
    title: 'Theme in one line',
    body: 'Presets or any brand color. Light and dark are generated with guaranteed WCAG AA contrast.',
  },
  {
    icon: <CheckCircleIcon />,
    title: 'Accessible by default',
    body: 'Roles, focus management, keyboard support, reduced motion and 44pt touch targets.',
  },
  {
    icon: <CodeIcon />,
    title: 'Own the code',
    body: `Install the package, or copy source with npx ${siteConfig.cliName} add — shadcn-style.`,
  },
]

function Showcase() {
  return (
    <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="$4" width="100%">
      <Card>
        <Card.Header>
          <Card.Title>Create an account</Card.Title>
          <Card.Description>Enter your email below.</Card.Description>
        </Card.Header>
        <Card.Content gap="$3">
          <VStack gap="$2">
            <Label htmlFor="hero-email">Email</Label>
            <Input id="hero-email" placeholder="you@example.com" />
          </VStack>
          <HStack gap="$2">
            <Checkbox id="hero-terms" defaultChecked />
            <Label htmlFor="hero-terms">I agree to the terms</Label>
          </HStack>
          <Button fullWidth onPress={() => toast.success('Account created')}>
            Create account
          </Button>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Title>Notifications</Card.Title>
          <Card.Description>Choose what you hear about.</Card.Description>
        </Card.Header>
        <Card.Content gap="$4">
          {['Mentions', 'Direct messages', 'Product updates'].map((label, i) => (
            <HStack key={label} justifyContent="space-between">
              <Label htmlFor={`hero-sw-${i}`}>{label}</Label>
              <Switch id={`hero-sw-${i}`} defaultChecked={i < 2} size="sm" />
            </HStack>
          ))}
          <VStack gap="$2">
            <Label htmlFor="hero-freq">Frequency</Label>
            <Select id="hero-freq" defaultValue="daily">
              <Select.Item value="instant">Instantly</Select.Item>
              <Select.Item value="daily">Daily digest</Select.Item>
              <Select.Item value="weekly">Weekly digest</Select.Item>
            </Select>
          </VStack>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <HStack justifyContent="space-between">
            <Card.Title>Team</Card.Title>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </HStack>
        </Card.Header>
        <Card.Content gap="$3">
          {['Olivia Martin', 'Jackson Lee', 'Isabella Nguyen'].map((name, i) => (
            <HStack key={name} gap="$3">
              <Avatar
                size="sm"
                alt={name}
                src={`https://i.pravatar.cc/96?img=${[32, 12, 47][i]}`}
              />
              <Text size="sm" flex={1}>
                {name}
              </Text>
              <Badge variant={i === 0 ? 'default' : 'outline'} size="sm">
                {i === 0 ? 'Owner' : 'Member'}
              </Badge>
            </HStack>
          ))}
          <Tabs defaultValue="week" marginTop="$2">
            <Tabs.List aria-label="Period">
              <Tabs.Trigger value="week">Week</Tabs.Trigger>
              <Tabs.Trigger value="month">Month</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="week" gap="$2">
              <Text size="sm" tone="muted">
                Sprint progress
              </Text>
              <Progress value={68} label="Sprint progress" />
            </Tabs.Content>
            <Tabs.Content value="month" gap="$2">
              <Text size="sm" tone="muted">
                Monthly goal
              </Text>
              <Progress value={42} tone="success" label="Monthly goal" />
            </Tabs.Content>
          </Tabs>
        </Card.Content>
      </Card>
    </Grid>
  )
}

export function Landing() {
  const install = `pnpm add ${siteConfig.corePackage}`
  return (
    <View minHeight="100vh" backgroundColor="$background">
      <SiteHeader />
      <VStack
        render="main"
        id="main"
        alignItems="center"
        paddingHorizontal="$4"
        gap="$16"
        paddingBottom="$20"
      >
        <VStack
          alignItems="center"
          gap="$6"
          paddingTop="$16"
          $md={{ paddingTop: '$24' }}
          maxWidth="$192"
        >
          <Link href="/docs/components" className="plain-link">
            <Badge variant="secondary" icon={<StarIcon />}>
              25 components · web, iOS, Android
            </Badge>
          </Link>
          <Text
            render="h1"
            size="5xl"
            weight="bold"
            textAlign="center"
            letterSpacing={-1.5}
            margin={0}
            $max-sm={{ fontSize: '$8', lineHeight: '$8' }}
          >
            Build once. Ship to web, iOS and Android.
          </Text>
          <Text size="xl" tone="muted" textAlign="center">
            {siteConfig.name} is a themeable, accessible component library for React, Next.js, React
            Native and Expo — built on Tamagui.
          </Text>
          <HStack gap="$3" flexWrap="wrap" justifyContent="center">
            <Button
              size="lg"
              iconAfter={<ArrowRightIcon />}
              render={<Link href="/docs/introduction" />}
            >
              Get started
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/docs/components" />}>
              Browse components
            </Button>
          </HStack>
          <HStack
            gap="$2"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$lg"
            paddingLeft="$4"
            paddingRight="$1"
            height="$11"
            backgroundColor="$muted"
          >
            <Text mono size="sm">
              {install}
            </Text>
            <CopyButton value={install} label="Copy install command" />
          </HStack>
        </VStack>

        <View width="100%" maxWidth={1200}>
          <Showcase />
        </View>

        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4" width="100%" maxWidth={1200}>
          {features.map((f) => (
            <VStack key={f.title} gap="$2">
              <View
                width="$10"
                height="$10"
                borderRadius="$lg"
                backgroundColor="$primarySoft"
                alignItems="center"
                justifyContent="center"
              >
                {f.icon}
              </View>
              <Text weight="semibold">{f.title}</Text>
              <Text size="sm" tone="muted">
                {f.body}
              </Text>
            </VStack>
          ))}
        </Grid>

        <Card width="100%" maxWidth={1200} variant="filled">
          <Card.Content $md={{ flexDirection: 'row', alignItems: 'center' }} gap="$4">
            <VStack flex={1} gap="$1">
              <HStack gap="$2">
                <GlobeIcon />
                <Text weight="semibold" size="lg">
                  See it in real screens
                </Text>
              </HStack>
              <Text tone="muted">
                Login, dashboards, settings, a product page and mobile screens — built only with
                these components.
              </Text>
            </VStack>
            <Button
              variant="outline"
              iconAfter={<ArrowRightIcon />}
              render={<Link href="/examples" />}
            >
              View examples
            </Button>
          </Card.Content>
        </Card>
      </VStack>
    </View>
  )
}
