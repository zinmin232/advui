'use client'

import * as UI from '@advui/core'
import type { PlaygroundControl, PlaygroundSpec } from '@advui/catalog'
import { Button, HStack, Input, Label, Switch, Text, VStack, toast } from '@advui/core'
import { CopyIcon, ExternalLinkIcon, SettingsIcon } from '@advui/icons'
import { type ReactNode, useMemo, useState } from 'react'
import { View } from 'tamagui'
import { themeToCode, useThemeStore } from '../lib/theme-store'
import { PreviewSurface } from './component-preview'
import { Segmented } from './customizer-panel'
import { withBasePath } from '../lib/site'

type Values = Record<string, string | number | boolean>

function GridCell({ label }: { label: string }) {
  return (
    <UI.Box flexGrow={1} padding="$3" borderRadius="$md" backgroundColor="$muted">
      <UI.Text size="sm" weight="medium">
        {label}
      </UI.Text>
    </UI.Box>
  )
}

interface Structure {
  /** The children, or a function of the props when they change with them. */
  element: ReactNode | ((values: Values) => ReactNode)
  code: string | ((values: Values) => string)
  /** Props the controls do not set, such as a footer, and how they read in the JSX. */
  props?: Record<string, unknown>
  propsCode?: string[]
}

/** Children for components whose content is structural rather than a text label. */
const structuralChildren: Record<string, Structure> = {
  Card: {
    element: (
      <>
        <UI.Card.Header>
          <UI.Card.Title>Team plan</UI.Card.Title>
          <UI.Card.Description>Everything your team needs.</UI.Card.Description>
        </UI.Card.Header>
        <UI.Card.Content>
          <UI.Text size="3xl" weight="bold">
            $29
          </UI.Text>
        </UI.Card.Content>
        <UI.Card.Footer>
          <UI.Button fullWidth>Upgrade</UI.Button>
        </UI.Card.Footer>
      </>
    ),
    code: `  <Card.Header>
    <Card.Title>Team plan</Card.Title>
    <Card.Description>Everything your team needs.</Card.Description>
  </Card.Header>
  <Card.Content>
    <Text size="3xl" weight="bold">$29</Text>
  </Card.Content>
  <Card.Footer>
    <Button fullWidth>Upgrade</Button>
  </Card.Footer>`,
  },
  // A full-row item, a two-column item and plain cells show how spans clamp and wrap.
  // An array, not a fragment: Grid makes a cell of each child.
  Grid: {
    element: [
      <UI.Grid.Item key="full" span="full">
        <GridCell label="span full" />
      </UI.Grid.Item>,
      <UI.Grid.Item key="two" span={2}>
        <GridCell label="span 2" />
      </UI.Grid.Item>,
      ...['1', '2', '3', '4'].map((label) => <GridCell key={label} label={label} />),
    ],
    code: `  <Grid.Item span="full">…</Grid.Item>
  <Grid.Item span={2}>…</Grid.Item>
  <Box>1</Box>
  <Box>2</Box>
  <Box>3</Box>
  <Box>4</Box>`,
  },
  // In a horizontal form the fields share the row, as in a search or filter form.
  Form: {
    element: ({ direction }) => {
      const share = direction === 'horizontal' ? { flex: 1, minWidth: 160 } : null
      return (
        <>
          <UI.Field label="Name" {...share}>
            <UI.Input placeholder="Ada Lovelace" />
          </UI.Field>
          <UI.Field label="Email" {...share}>
            <UI.Input inputMode="email" placeholder="ada@example.org" />
          </UI.Field>
        </>
      )
    },
    code: ({ direction }) => {
      const share = direction === 'horizontal' ? ' flex={1} minWidth={160}' : ''
      return `  <Field label="Name"${share}>
    <Input placeholder="Ada Lovelace" />
  </Field>
  <Field label="Email"${share}>
    <Input inputMode="email" placeholder="ada@example.org" />
  </Field>`
    },
    props: {
      onSubmit: () => toast.success('Submitted'),
      footer: (
        <>
          <UI.Button variant="outline">Cancel</UI.Button>
          <UI.Form.Submit>Save</UI.Form.Submit>
        </>
      ),
    },
    propsCode: [
      'onSubmit={save}',
      `footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Form.Submit>Save</Form.Submit>
    </>
  }`,
    ],
  },
}

const resolve = <T,>(part: T | ((values: Values) => T), values: Values) =>
  typeof part === 'function' ? (part as (values: Values) => T)(values) : part

const iconFor: Record<string, ReactNode> = { IconButton: <SettingsIcon /> }

export function initialValues(spec: PlaygroundSpec, overrides: Values = {}): Values {
  return Object.fromEntries(spec.controls.map((c) => [c.prop, overrides[c.prop] ?? c.default]))
}

function formatProp(name: string, value: string | number | boolean) {
  if (value === true) return name
  if (typeof value === 'string') return `${name}="${value}"`
  return `${name}={${JSON.stringify(value)}}`
}

/** Generates idiomatic JSX, omitting props that equal their defaults. */
export function generateJsx(spec: PlaygroundSpec, values: Values): string {
  const props: string[] = []
  for (const [name, value] of Object.entries(spec.staticProps ?? {}))
    props.push(formatProp(name, value))
  if (spec.component === 'IconButton') props.push('icon={<SettingsIcon />}')
  for (const control of spec.controls) {
    const value = values[control.prop]
    // A text control's default is sample content, such as a title, not the
    // component's own default, so it is always shown.
    const isDefault = value === control.default && control.type !== 'text'
    if (value === undefined || isDefault || value === false || value === '') continue
    props.push(formatProp(control.prop, value))
  }
  const structural = structuralChildren[spec.component]
  props.push(...(structural?.propsCode ?? []))
  const open =
    props.length > 2
      ? `<${spec.component}\n  ${props.join('\n  ')}\n`
      : `<${spec.component}${props.length ? ` ${props.join(' ')}` : ''}`
  if (structural) return `${open}>\n${resolve(structural.code, values)}\n</${spec.component}>`
  if (spec.children)
    return `${open}>${props.length > 2 ? '\n  ' : ''}${spec.children}${props.length > 2 ? '\n' : ''}</${spec.component}>`
  return `${open}${props.length > 2 ? '' : ' '}/>`
}

function Control({
  control,
  value,
  onChange,
}: {
  control: PlaygroundControl
  value: string | number | boolean
  onChange: (v: string | number | boolean) => void
}) {
  const id = `pg-${control.prop}`
  switch (control.type) {
    case 'select':
      return (
        <Segmented
          label={control.prop}
          value={String(value)}
          options={control.options.map((o) => ({ value: o, label: o }))}
          onChange={onChange}
        />
      )
    case 'boolean':
      return (
        <HStack gap="$3" justifyContent="space-between">
          <Label htmlFor={id}>{control.prop}</Label>
          <Switch id={id} size="sm" checked={Boolean(value)} onCheckedChange={onChange} />
        </HStack>
      )
    case 'number':
      return (
        <VStack gap="$2">
          <Label htmlFor={id}>{control.prop}</Label>
          <Input
            id={id}
            size="sm"
            inputMode="numeric"
            value={String(value)}
            onChangeText={(text) => {
              const n = Number(text)
              if (!Number.isNaN(n))
                onChange(Math.min(control.max ?? n, Math.max(control.min ?? n, n)))
            }}
          />
        </VStack>
      )
    default:
      return (
        <VStack gap="$2">
          <Label htmlFor={id}>{control.prop}</Label>
          <Input id={id} size="sm" value={String(value)} onChangeText={onChange} />
        </VStack>
      )
  }
}

export function Playground({
  spec,
  initial,
  showOpenLink = true,
}: {
  spec: PlaygroundSpec
  initial?: Values
  showOpenLink?: boolean
}) {
  const [values, setValues] = useState<Values>(() => initialValues(spec, initial))
  const { theme } = useThemeStore()
  const Component = (UI as unknown as Record<string, React.ComponentType<Record<string, unknown>>>)[
    spec.component
  ]
  const jsx = useMemo(() => generateJsx(spec, values), [spec, values])

  if (!Component) return <Text tone="error">Unknown component {spec.component}</Text>

  const structural = structuralChildren[spec.component]
  const element = (
    <Component
      {...spec.staticProps}
      {...(iconFor[spec.component] ? { icon: iconFor[spec.component] } : null)}
      {...values}
      {...structural?.props}
      {...(spec.component === 'Card' ? { width: '100%', maxWidth: '$80' } : null)}
      {...(spec.component === 'Grid' ? { width: '100%' } : null)}
      {...(spec.component === 'Form' ? { width: '100%', maxWidth: '$96' } : null)}
    >
      {structural ? resolve(structural.element, values) : spec.children}
    </Component>
  )

  const query = new URLSearchParams({
    component: spec.component,
    ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)])),
  })

  return (
    <View
      borderWidth={1}
      borderColor="$border"
      borderRadius="$lg"
      overflow="hidden"
      $lg={{ flexDirection: 'row' }}
    >
      <View
        flex={1}
        minWidth={0}
        borderColor="$border"
        borderBottomWidth={1}
        $lg={{ borderBottomWidth: 0, borderRightWidth: 1 }}
      >
        <PreviewSurface minHeight="$72">
          {/* Remount when props change so uncontrolled defaults (defaultChecked…) apply. */}
          <View key={JSON.stringify(values)} width="100%" alignItems="center">
            {element}
          </View>
        </PreviewSurface>
        <View
          borderTopWidth={1}
          borderColor="$border"
          backgroundColor="$muted"
          padding="$4"
          gap="$2"
        >
          <HStack justifyContent="space-between">
            <Text size="xs" weight="semibold" tone="muted">
              JSX
            </Text>
            <HStack gap="$1">
              <Button
                size="sm"
                variant="ghost"
                icon={<CopyIcon />}
                onPress={async () => {
                  await navigator.clipboard.writeText(jsx)
                  toast.success('JSX copied')
                }}
              >
                Copy JSX
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<CopyIcon />}
                onPress={async () => {
                  await navigator.clipboard.writeText(themeToCode(theme))
                  toast.success('Theme copied')
                }}
              >
                Copy theme
              </Button>
            </HStack>
          </HStack>
          <Text
            render="pre"
            mono
            size="sm"
            margin={0}
            whiteSpace="pre-wrap"
            aria-label="Generated JSX"
          >
            {jsx}
          </Text>
        </View>
      </View>
      <VStack
        padding="$4"
        gap="$4"
        width="100%"
        $lg={{ width: '$72' }}
        aria-label="Props"
        role="group"
      >
        <HStack justifyContent="space-between">
          <Text size="sm" weight="semibold">
            Props
          </Text>
          {showOpenLink ? (
            <Button
              size="sm"
              variant="link"
              iconAfter={<ExternalLinkIcon />}
              render={<a href={withBasePath(`/playground?${query}`)} />}
            >
              Open in Playground
            </Button>
          ) : null}
        </HStack>
        {spec.controls.map((control) => (
          <Control
            key={control.prop}
            control={control}
            value={values[control.prop] ?? control.default}
            onChange={(v) => setValues((prev) => ({ ...prev, [control.prop]: v }))}
          />
        ))}
        <Button size="sm" variant="outline" onPress={() => setValues(initialValues(spec))}>
          Reset props
        </Button>
      </VStack>
    </View>
  )
}
