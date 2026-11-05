import { Code } from '../../components/code'
import type { TocItem } from '../../components/docs-shell'
import { A, C, Callout, H2, H3, LI, P, UL } from '../../components/prose'

export const formsToc: TocItem[] = [
  { id: 'field', title: 'Field' },
  { id: 'form', title: 'Form' },
  { id: 'validation', title: 'Validation' },
  { id: 'form-libraries', title: 'Form libraries' },
  { id: 'own-controls', title: 'Your own controls' },
  { id: 'right-keyboard', title: 'The right keyboard' },
  { id: 'return-key', title: 'The Return key' },
  { id: 'avoid-keyboard', title: 'Staying above the keyboard' },
]

export async function Forms() {
  return (
    <>
      <H2 id="field">Field</H2>
      <P>
        <A href="/docs/components/field">Field</A> wires a label, a control, help text and an error
        message together. Put one control inside it:
      </P>
      <Code
        code={`import { Field, Input } from '@advui/core'

<Field label="Email" description="We never share it." error={error} required>
  <Input value={email} onChangeText={setEmail} inputMode="email" />
</Field>`}
      />
      <P>
        Field reaches the control through context, so the control can sit at any depth, next to a
        Button for example. On web, the label targets the control and the help and error text are
        linked to it with <C>aria-describedby</C>. iOS and Android have no <C>{'<label>'}</C>, so
        there the label's text names the control and the help and error text become its hint. You
        write the same code for both.
      </P>
      <P>
        Every core form control reads Field this way: Input, Textarea, Select, Checkbox, Switch,
        Radio Group, the pickers and the rest.
      </P>
      <H2 id="form">Form</H2>
      <P>
        <A href="/docs/components/form">Form</A> lays out the fields with a title, a description and
        a footer, and wires up submit. It holds no values: those stay in your state, or in a form
        library.
      </P>
      <Code
        title="sign-up.tsx"
        code={`import { Field, Form, Input, PasswordInput, toast } from '@advui/core'
import { useState } from 'react'

export function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const found = {
      email: /^\\S+@\\S+\\.\\S+$/.test(email) ? undefined : 'Enter an email like you@example.org.',
      password: password.length >= 8 ? undefined : 'Use at least 8 characters.',
    }
    setErrors(found)
    if (found.email || found.password) return

    setSaving(true)
    try {
      await createAccount({ email, password })
      toast.success('Account created')
    } catch {
      toast.error('Could not create the account. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form
      title="Create account"
      onSubmit={submit}
      loading={saving}
      loadingText="Creating…"
      footer={<Form.Submit>Create account</Form.Submit>}
    >
      <Field label="Email" error={errors.email} required>
        <Input
          value={email}
          onChangeText={setEmail}
          inputMode="email"
          autoCapitalize="none"
          autoComplete="email"
        />
      </Field>
      <Field label="Password" description="At least 8 characters." error={errors.password} required>
        <PasswordInput value={password} onChangeText={setPassword} autoComplete="new-password" />
      </Field>
    </Form>
  )
}`}
      />
      <UL>
        <LI>
          <C>Form.Submit</C> is a submit button on web, so Enter in a field submits too. On iOS and
          Android, pressing it calls <C>onSubmit</C>; to make the keyboard's Return key submit, see{' '}
          <A href="#return-key">The Return key</A>.
        </LI>
        <LI>
          <C>loading</C> puts a spinner on <C>Form.Submit</C> and blocks another submit. Form does
          not wait for the Promise <C>onSubmit</C> returns, so set <C>loading</C> yourself, as
          above.
        </LI>
        <LI>
          <C>disabled</C> disables every control inside and <C>Form.Submit</C>, and blocks{' '}
          <C>onSubmit</C>. Other buttons, such as Cancel, stay enabled.
        </LI>
      </UL>
      <H2 id="validation">Validation</H2>
      <P>
        Validation belongs to your app, so it works the same on every platform. Form turns off the
        browser's own bubbles (<C>noValidate</C>). Pass the message to Field's <C>error</C>: it
        shows the text and marks the control invalid, and <C>undefined</C>, <C>null</C>,{' '}
        <C>false</C> and <C>""</C> all mean no error.
      </P>
      <P>
        Say what is wrong and how to fix it in that text. iOS and Android have no invalid state for
        screen readers, so the words are all TalkBack and VoiceOver can read, as part of the
        control's hint. For the same reason <C>required</C> adds “required” to the control's name
        there, which <C>requiredText</C> translates.
      </P>
      <H2 id="form-libraries">Form libraries</H2>
      <P>
        Form and Field know nothing about where values come from, so React Hook Form, Formik and
        others work with them. Core controls report values with <C>onChangeText</C>,{' '}
        <C>onValueChange</C> and <C>onCheckedChange</C> rather than DOM events, so React Hook Form's{' '}
        <C>register</C> does not fit them. Use <C>Controller</C>:
      </P>
      <Code
        title="subscribe.tsx"
        code={`import { Field, Form, Input } from '@advui/core'
import { Controller, useForm } from 'react-hook-form'

export function Subscribe() {
  const { control, handleSubmit, formState } = useForm({ defaultValues: { email: '' } })

  return (
    <Form
      onSubmit={handleSubmit(subscribe)}
      loading={formState.isSubmitting}
      footer={<Form.Submit>Subscribe</Form.Submit>}
    >
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Enter your email.' }}
        render={({ field: { ref, value, onChange, onBlur }, fieldState: { error } }) => (
          <Field label="Email" error={error?.message} required>
            <Input
              ref={ref}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              inputMode="email"
            />
          </Field>
        )}
      />
    </Form>
  )
}`}
      />
      <H2 id="own-controls">Your own controls</H2>
      <P>
        A control you write yourself takes part the same way. Call <C>useFieldControl(props)</C>{' '}
        first and use what it returns: the id the label targets, <C>invalid</C>, <C>disabled</C>,
        and the props that link the label and messages on each platform. <C>useParentForm()</C>{' '}
        reads the surrounding Form, for a button that submits it or a control that shows its{' '}
        <C>loading</C> state.
      </P>
      <H2 id="right-keyboard">The right keyboard</H2>
      <P>These props work on web, iOS and Android:</P>
      <UL>
        <LI>
          <C>inputMode</C> picks the keyboard: <C>email</C>, <C>tel</C>, <C>url</C>, <C>numeric</C>,{' '}
          <C>decimal</C> or <C>search</C>.
        </LI>
        <LI>
          <C>autoComplete</C> lets the browser or the phone fill in a saved value: <C>email</C>,{' '}
          <C>name</C>, <C>tel</C>, <C>current-password</C>, <C>new-password</C>,{' '}
          <C>one-time-code</C>.
        </LI>
        <LI>
          <C>autoCapitalize="none"</C> stops the keyboard capitalizing an email or a user name.
        </LI>
      </UL>
      <P>
        Use the specific control when there is one:{' '}
        <A href="/docs/components/password-input">Password Input</A>,{' '}
        <A href="/docs/components/number-input">Number Input</A> and{' '}
        <A href="/docs/components/otp-input">OTP Input</A>.
      </P>
      <H2 id="return-key">The Return key</H2>
      <P>
        On web, Enter in a field submits the form. On iOS and Android nothing connects the keyboard
        to Form, so Return only closes the keyboard until you wire it up. <C>returnKeyType</C>{' '}
        labels the key, and <C>onSubmitEditing</C> runs when it is pressed. Move to the next field
        with its <C>ref</C>, and submit from the last one with <C>submit</C> from{' '}
        <C>useParentForm()</C>, which works only in a component rendered inside the Form:
      </P>
      <Code
        title="sign-in-fields.tsx"
        code={`import { Field, Input, PasswordInput, useParentForm } from '@advui/core'
import { useRef } from 'react'
import { Platform, type TextInput } from 'react-native'

// Web already submits on Enter, and Input calls onSubmitEditing there too.
const native = Platform.OS !== 'web'

export function SignInFields() {
  const { submit } = useParentForm()
  const password = useRef<TextInput>(null)

  return (
    <>
      <Field label="Email">
        <Input
          inputMode="email"
          autoCapitalize="none"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={native ? () => password.current?.focus() : undefined}
        />
      </Field>
      <Field label="Password">
        <PasswordInput
          ref={password}
          returnKeyType="go"
          onSubmitEditing={native ? submit : undefined}
        />
      </Field>
    </>
  )
}`}
      />
      <P>
        <C>submitBehavior="submit"</C> keeps the keyboard open as focus moves to the next field.
      </P>
      <Callout variant="warning" title="Do not pass submit to onSubmitEditing on web">
        Tamagui's Input calls <C>onSubmitEditing</C> on Enter on web, and the form submits as well,
        so <C>onSubmit</C> would run twice.
      </Callout>
      <H2 id="avoid-keyboard">Staying above the keyboard</H2>
      <P>
        Browsers keep the focused field in view. On iOS and Android the keyboard covers the bottom
        of the screen, so a form on a phone needs a scroll view that moves out of its way. Two
        components do this (since 0.15.0):
      </P>
      <UL>
        <LI>
          <A href="/docs/components/app-shell">App Shell</A>: <C>AppShell.Main</C> does it by
          default. Turn it off with <C>avoidKeyboard={'{false}'}</C> if your app already handles the
          keyboard around the shell.
        </LI>
        <LI>
          <A href="/docs/components/scroll-area">Scroll Area</A>: add <C>avoidKeyboard</C> to one
          that fills the screen.
        </LI>
      </UL>
      <Code
        title="app/sign-up.tsx"
        code={`import { ScrollArea, VStack } from '@advui/core'
import { SignUp } from '../sign-up'

export default function SignUpScreen() {
  return (
    <ScrollArea avoidKeyboard flex={1}>
      <VStack padding="4">
        <SignUp />
      </VStack>
    </ScrollArea>
  )
}`}
      />
      <UL>
        <LI>
          Use it in place of React Native's <C>KeyboardAvoidingView</C>. It measures where it ends
          on screen, so a navigation header above it needs no offset.
        </LI>
        <LI>A tap on a button while the keyboard is up presses the button.</LI>
        <LI>
          Only the outermost scroll view that asks avoids the keyboard. A Scroll Area inside{' '}
          <C>AppShell.Main</C> leaves it to the shell.
        </LI>
        <LI>
          <C>AppShell.Footer</C> stays under the keyboard. Keep a form's submit button in{' '}
          <C>AppShell.Main</C>, where it scrolls into reach.
        </LI>
        <LI>
          A <A href="/docs/components/sheet">Sheet</A> rises above the keyboard by itself. A Dialog
          stays where it is, so a tall form on a phone belongs in a Sheet or on its own screen.
        </LI>
      </UL>
    </>
  )
}

export const navigationToc: TocItem[] = [
  { id: 'how-links-work', title: 'How links work' },
  { id: 'expo-router', title: 'Expo Router' },
  { id: 'nextjs', title: 'Next.js' },
  { id: 'shared-screens', title: 'Screens shared by both' },
  { id: 'other-routers', title: 'Other routers' },
]

export async function Navigation() {
  return (
    <>
      <H2 id="how-links-work">How links work</H2>
      <P>
        <A href="/docs/components/link">Link</A>,{' '}
        <A href="/docs/components/breadcrumb">Breadcrumb</A>,{' '}
        <A href="/docs/components/sidebar">Sidebar</A>,{' '}
        <A href="/docs/components/navigation-menu">Navigation Menu</A>,{' '}
        <A href="/docs/components/menu">Menu</A> and{' '}
        <A href="/docs/components/list-item">List Item</A> take an <C>href</C>. What it does depends
        on the platform:
      </P>
      <UL>
        <LI>
          <strong>Web:</strong> it is a real <C>{'<a>'}</C>, so opening in a new tab works. On its
          own it loads a whole new page. <C>render</C> swaps in your router's link for client-side
          navigation.
        </LI>
        <LI>
          <strong>iOS and Android:</strong> a path goes to the router you registered with{' '}
          <C>setRouter</C> (since 0.15.0). Without one, a Link stays plain text and warns in
          development. An absolute URL (<C>https:</C>, <C>mailto:</C>, <C>tel:</C>) opens with the
          system, and a fragment (<C>#plans</C>) is not followed.
        </LI>
      </UL>
      <P>
        Adv UI depends on no router. <A href="/docs/components/navigation-bar">Navigation Bar</A>{' '}
        and <A href="/docs/components/tabs">Tabs</A> show the current place rather than link away,
        so they take a <C>value</C> instead of an <C>href</C>.
      </P>
      <H2 id="expo-router">Expo Router</H2>
      <P>
        Register the router once, at the top of the root layout. <C>advui create --template expo</C>{' '}
        does this for you.
      </P>
      <Code
        title="app/_layout.tsx"
        code={`import { setRouter } from '@advui/core'
import { router } from 'expo-router'

setRouter(router)`}
      />
      <P>
        It is a plain module value rather than React context, because native portals drop context
        and a link may render in one: a sheet, a drawer or a toast. Now a path in any <C>href</C>{' '}
        opens that screen:
      </P>
      <Code
        code={`import { Link, ListItem, Text } from '@advui/core'

<Text>
  Read the <Link href="/guides/start">guide</Link> first.
</Text>
<ListItem title="Profile" href="/settings/profile" />`}
      />
      <H3>The current page</H3>
      <P>
        Components can't tell which page is open, so pass it in. Expo Router's <C>usePathname()</C>{' '}
        gives the path:
      </P>
      <Code
        title="app-nav.tsx"
        code={`import { Sidebar } from '@advui/core'
import { usePathname } from 'expo-router'

export function AppNav() {
  const pathname = usePathname()
  return (
    <Sidebar aria-label="App">
      <Sidebar.Content>
        <Sidebar.Item href="/" active={pathname === '/'}>
          Home
        </Sidebar.Item>
        <Sidebar.Item href="/settings" active={pathname.startsWith('/settings')}>
          Settings
        </Sidebar.Item>
      </Sidebar.Content>
    </Sidebar>
  )
}`}
      />
      <H3>More than a push</H3>
      <P>
        <C>href</C> always pushes. For anything else, leave it out and call the router in{' '}
        <C>onPress</C>, which is also how a Button navigates:
      </P>
      <Code
        code={`import { Button, Link } from '@advui/core'
import { router } from 'expo-router'

<Link onPress={() => router.replace('/sign-in')}>Sign in</Link>
<Button onPress={() => router.push('/checkout')}>Check out</Button>`}
      />
      <P>
        With both an <C>href</C> and an <C>onPress</C>, <C>onPress</C> runs first and then the{' '}
        <C>href</C> is followed. Call <C>event.preventDefault()</C> in <C>onPress</C> to stop it,
        for example behind a check. Do not also navigate there, or the link navigates twice.
      </P>
      <H3>Links inside overlays</H3>
      <P>
        In a stack the screen below stays mounted, so a drawer or sheet stays open on top of the new
        screen when a link inside it pushes one. Hold <C>open</C> yourself and close it in{' '}
        <C>onPress</C>:
      </P>
      <Code
        code={`import { Drawer, Link } from '@advui/core'
import { useState } from 'react'

const [open, setOpen] = useState(false)

<Drawer open={open} onOpenChange={setOpen}>
  <Drawer.Content side="right">
    <Link href="/settings" onPress={() => setOpen(false)}>
      Settings
    </Link>
  </Drawer.Content>
</Drawer>`}
      />
      <P>
        A <A href="/docs/components/sidebar">Sidebar</A> inside <C>AppShell.Sidebar</C> closes its
        drawer for you. On Android, the back button closes an open overlay first, and goes back on
        the next press.
      </P>
      <H3>Navigation Bar as the tab bar</H3>
      <P>
        Expo Router's <C>Tabs</C> takes a <C>tabBar</C>. Navigation Bar's <C>value</C> is the
        current route's name, and <C>onValueChange</C> navigates. It does not pad the bottom safe
        area, so the frame around it does:
      </P>
      <Code
        title="app/_layout.tsx"
        code={`import { Box, NavigationBar } from '@advui/core'
import { HomeIcon, SettingsIcon } from '@advui/icons'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <Box backgroundColor="card" paddingBottom={insets.bottom}>
          <NavigationBar
            aria-label="Main"
            value={state.routes[state.index]?.name}
            onValueChange={(name) => navigation.navigate(name)}
          >
            <NavigationBar.Item value="index" icon={<HomeIcon />} label="Home" />
            <NavigationBar.Item value="settings" icon={<SettingsIcon />} label="Settings" />
          </NavigationBar>
        </Box>
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}`}
      />
      <H2 id="nextjs">Next.js</H2>
      <P>
        The web has real links, so there is nothing to register. Without <C>render</C>, an{' '}
        <C>href</C> loads a whole new page. Pass <C>next/link</C> as <C>render</C> to keep
        client-side navigation. The <C>href</C> goes on your link, and <C>usePathname()</C> marks
        the current page:
      </P>
      <Code
        title="app/main-nav.tsx"
        code={`'use client'

import { NavigationMenu } from '@advui/core'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
]

export function MainNav() {
  const pathname = usePathname()
  return (
    <NavigationMenu aria-label="Main">
      {links.map((link) => (
        <NavigationMenu.Link
          key={link.href}
          render={<Link href={link.href} />}
          active={pathname === link.href}
        >
          {link.label}
        </NavigationMenu.Link>
      ))}
    </NavigationMenu>
  )
}`}
      />
      <P>
        <C>advui create --template next</C> starts you with this in <C>app/header.tsx</C>. These
        take <C>render</C> the same way: <C>Link</C>, <C>Button</C>, <C>Breadcrumb.Item</C>,{' '}
        <C>Sidebar.Item</C>, <C>Menu.Item</C> and <C>NavigationBar.Item</C>.
      </P>
      <Code
        code={`import { Button, Link as AdvLink, NavigationBar } from '@advui/core'
import { HomeIcon } from '@advui/icons'
import Link from 'next/link'

<AdvLink render={<Link href="/pricing" />}>Pricing</AdvLink>
<Button render={<Link href="/sign-up" />}>Sign up</Button>

<NavigationBar value={pathname} aria-label="Main">
  <NavigationBar.Item
    value="/"
    render={<Link href="/" />}
    icon={<HomeIcon />}
    label="Home"
  />
</NavigationBar>`}
      />
      <P>
        List Item has no <C>render</C>. Keep its <C>href</C>, so it is still a link for the browser,
        and take over in <C>onPress</C>:
      </P>
      <Code
        code={`import { ListItem } from '@advui/core'
import { useRouter } from 'next/navigation'

const router = useRouter()

<ListItem
  title="Profile"
  href="/settings/profile"
  onPress={(event) => {
    event.preventDefault()
    router.push('/settings/profile')
  }}
/>`}
      />
      <H2 id="shared-screens">Screens shared by both</H2>
      <P>
        A screen that runs in both apps can't import <C>next/link</C> on iOS and Android. Put the
        difference in a pair of platform files:
      </P>
      <Code
        title="router-link.tsx"
        code={`import Link from 'next/link'

export const routerLink = (href: string) => <Link href={href} />`}
      />
      <Code
        title="router-link.native.tsx"
        code={`export const routerLink = (_href: string) => undefined`}
      />
      <P>
        Then write the path twice in the screen: <C>href</C> for the router on iOS and Android, and{' '}
        <C>render</C> for client-side navigation on web.
      </P>
      <Code
        title="settings-screen.tsx"
        code={`import { Link } from '@advui/core'
import { routerLink } from './router-link'

<Link href="/billing" render={routerLink('/billing')}>
  Billing
</Link>`}
      />
      <H2 id="other-routers">Other routers</H2>
      <P>
        <C>setRouter</C> takes any object with a <C>push(href)</C>. A router that comes from a hook
        is registered from an effect, and links already on screen pick it up. With React
        Navigation's <C>useLinkTo</C>:
      </P>
      <Code
        code={`import { setRouter } from '@advui/core'
import { useLinkTo } from '@react-navigation/native'
import { useEffect } from 'react'

const linkTo = useLinkTo()
useEffect(() => setRouter({ push: linkTo }), [linkTo])`}
      />
    </>
  )
}

export const fromTamaguiToc: TocItem[] = [
  { id: 'what-changes', title: 'What changes' },
  { id: 'before-you-start', title: 'Before you start' },
  { id: 'config', title: 'Replace the config' },
  { id: 'provider', title: 'Replace the provider' },
  { id: 'controls', title: 'Replace the controls' },
  { id: 'tokens', title: 'Check tokens and themes' },
  { id: 'styled', title: 'Your own styled components' },
  { id: 'limits', title: 'Limits' },
]

export async function FromTamagui() {
  return (
    <>
      <H2 id="what-changes">What changes</H2>
      <P>
        Tamagui's root entry has styled components (<C>{"import { Button } from 'tamagui'"}</C>),
        and <C>@tamagui/config</C> has a default config for them. Adv UI replaces both, on the same
        Tamagui 3, so your layout code carries over.
      </P>
      <UL>
        <LI>
          <strong>Stays:</strong> <C>View</C>, <C>Text</C>, <C>XStack</C>, <C>YStack</C>,{' '}
          <C>ScrollView</C>, <C>styled()</C>, <C>useTheme()</C>, <C>useMedia()</C> and flat values
          such as <C>padding="4 md:6"</C>.
        </LI>
        <LI>
          <strong>Changes:</strong> the config, the provider and the styled controls, which have
          fewer parts in Adv UI.
        </LI>
      </UL>
      <Callout variant="warning" title="Move the config and the controls together">
        A config is global to the app, and neither side works on the other's. Tamagui's styled
        controls read a size table that Adv UI's config does not have, so under it a Switch shrinks
        to 8px. Adv UI's components read theme keys that Tamagui's config does not have. Do the
        whole move in one branch. In development Tamagui logs{' '}
        <C>size "md" references a missing token</C> for each styled control left over, so they are
        easy to find.
      </Callout>
      <H2 id="before-you-start">Before you start</H2>
      <P>
        Adv UI needs Tamagui 3 and React 19. On Tamagui 1 or 2, upgrade first with{' '}
        <A href="https://tamagui.dev/tailwind/guides/how-to-upgrade">Tamagui's upgrade guide</A>:
        its <C>@tamagui/codemod-flat-values</C> rewrites <C>$</C> tokens, <C>hoverStyle</C> and{' '}
        <C>$sm</C> props, none of which work in version 3. Then install the packages. On web, add
        React Native Web too, as on the <A href="/docs/installation">installation page</A>.
      </P>
      <Code lang="bash" code="pnpm add @advui/core @advui/theme @advui/icons" />
      <H2 id="config">Replace the config</H2>
      <Code
        title="tamagui.config.ts (before)"
        code={`import { defaultConfig } from '@tamagui/config/v6'
import { createTamagui } from 'tamagui'

export const config = createTamagui(defaultConfig)
export default config`}
      />
      <Code
        title="tamagui.config.ts (after)"
        code={`import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({ preset: 'indigo', radius: 'md' })
export default config`}
      />
      <P>
        Pick a preset, or pass your brand color in <C>colors</C>: the{' '}
        <A href="/docs/theme">Theme</A> page has them all. Delete any{' '}
        <C>{"declare module 'tamagui'"}</C> block, because <C>@advui/core</C> registers the config's
        types itself, and uninstall <C>@tamagui/config</C> once nothing imports it.
      </P>
      <H2 id="provider">Replace the provider</H2>
      <Code
        title="before"
        code={`import { TamaguiProvider } from 'tamagui'

<TamaguiProvider config={config} defaultTheme="light">
  <ToastProvider>
    {children}
    <ToastViewport />
  </ToastProvider>
</TamaguiProvider>`}
      />
      <Code
        title="after"
        code={`import { UniversalProvider } from '@advui/core'

<UniversalProvider config={config} defaultColorMode="light">
  {children}
</UniversalProvider>`}
      />
      <UL>
        <LI>
          <C>defaultColorMode</C> takes <C>light</C>, <C>dark</C> or <C>system</C>, the default.{' '}
          <C>useColorMode()</C> reads and changes it anywhere.
        </LI>
        <LI>
          It renders the toast viewport, so toasts need no provider of their own: call{' '}
          <C>toast('Saved')</C>.
        </LI>
        <LI>
          On iOS and Android, pass <C>insets</C>, as on the{' '}
          <A href="/docs/installation#expo">installation page</A>.
        </LI>
      </UL>
      <H2 id="controls">Replace the controls</H2>
      <P>
        Import from <C>@advui/core</C> instead. Most keep their names and lose their inner parts,
        which Adv UI puts together for you. <C>Select</C> shows the difference best:
      </P>
      <Code
        title="before"
        code={`import { Select } from 'tamagui'

<Select value={country} onValueChange={setCountry}>
  <Select.Trigger>
    <Select.Value placeholder="Choose…" />
  </Select.Trigger>
  <Select.Adapt when="max-md">{/* a Sheet for phones */}</Select.Adapt>
  <Select.Content>
    <Select.Viewport>
      <Select.Item index={0} value="mm">
        <Select.ItemText>Myanmar</Select.ItemText>
      </Select.Item>
    </Select.Viewport>
  </Select.Content>
</Select>`}
      />
      <Code
        title="after"
        code={`import { Select } from '@advui/core'

<Select value={country} onValueChange={setCountry} placeholder="Choose…">
  <Select.Item value="mm">Myanmar</Select.Item>
</Select>`}
      />
      <P>The rest, in the order you are likely to meet them:</P>
      <UL>
        <LI>
          <C>Button</C>: <C>variant="outlined"</C> → <C>variant="outline"</C>,{' '}
          <C>variant="quiet"</C> → <C>variant="ghost"</C>, and <C>circular</C> →{' '}
          <A href="/docs/components/icon-button">Icon Button</A>, which needs an <C>aria-label</C>.{' '}
          <C>icon</C> takes an element (<C>{'icon={<PlusIcon />}'}</C>), not a component.
        </LI>
        <LI>
          <C>TextArea</C> → <C>Textarea</C>.
        </LI>
        <LI>
          <C>Switch</C>, <C>Checkbox</C>, <C>Slider</C> and <C>Progress</C> take no children: drop{' '}
          <C>Switch.Thumb</C>, <C>Checkbox.Indicator</C>, <C>Slider.Track</C> and{' '}
          <C>Progress.Indicator</C>.
        </LI>
        <LI>
          <C>RadioGroup.Item</C> takes a <C>label</C>, and drops <C>RadioGroup.Indicator</C>.
        </LI>
        <LI>
          <C>Dialog</C> and <C>Sheet</C>: drop <C>Dialog.Portal</C>, <C>Dialog.Overlay</C>,{' '}
          <C>Sheet.Container</C>, <C>Sheet.Background</C>, <C>Sheet.Overlay</C> and{' '}
          <C>Sheet.Handle</C>. <C>Dialog.Content</C> and <C>Sheet.Content</C> bring them.
        </LI>
        <LI>
          <C>Tabs.Tab</C> → <C>Tabs.Trigger</C>.
        </LI>
        <LI>
          <C>Tooltip</C>: <C>{'<Tooltip content="Delete">'}</C> around the trigger, with no{' '}
          <C>Tooltip.Trigger</C> or <C>Tooltip.Content</C>.
        </LI>
        <LI>
          <C>Avatar</C>: <C>{'<Avatar src={url} alt="Ada" fallback="AL" />'}</C>.
        </LI>
        <LI>
          <C>Form.Trigger</C> → <C>Form.Submit</C>.
        </LI>
        <LI>
          <C>XGroup</C> and <C>YGroup</C> → <A href="/docs/components/button-group">Button Group</A>{' '}
          or <A href="/docs/components/list">List</A>.
        </LI>
        <LI>
          <C>ScrollView</C> keeps working. <A href="/docs/components/scroll-area">Scroll Area</A>{' '}
          adds themed scrollbars and <A href="/docs/forms#avoid-keyboard">keyboard avoidance</A>.
        </LI>
        <LI>
          <C>H1</C>–<C>H6</C>, <C>Paragraph</C> and <C>SizableText</C> still render, but outside Adv
          UI's type scale. Move to <C>{'<Heading level={1}>'}</C> and <C>Text</C>.
        </LI>
        <LI>
          <C>useToastController()</C> → <C>toast()</C>.
        </LI>
      </UL>
      <P>
        Each component's page has its full API. You can also drop <C>Adapt</C>: Select opens a
        bottom sheet on touch devices by itself.
      </P>
      <H2 id="tokens">Check tokens and themes</H2>
      <P>
        Bare token names stay, and most of them mean the same thing. These are the ones that differ
        from Tamagui's <C>@tamagui/config/v6</C>:
      </P>
      <UL>
        <LI>
          <strong>Space and size:</strong> the same 4px steps, so <C>4</C> is 16px. Half steps use a
          hyphen only (<C>1-5</C>, not <C>1.5</C>). <C>px</C> and steps such as <C>28</C> and{' '}
          <C>36</C> do not exist, and TypeScript reports them.
        </LI>
        <LI>
          <strong>Font sizes</strong> are numbered: <C>fontSize="sm"</C> → <C>fontSize="2"</C>,{' '}
          <C>base</C> → <C>3</C>, <C>lg</C> → <C>4</C>. See the{' '}
          <A href="/docs/typography">type scale</A>.
        </LI>
        <LI>
          <strong>Radius:</strong> with the default <C>radius: 'md'</C>, the names and values match
          up to <C>3xl</C>. They follow your config's <C>radius</C>.
        </LI>
        <LI>
          <strong>Breakpoints:</strong> <C>xs</C> to <C>xxl</C>, the <C>max-</C> forms,{' '}
          <C>touchable</C> and <C>hoverable</C> are the same. <C>xxs</C>, <C>xxxs</C> and the height
          queries are gone.
        </LI>
        <LI>
          <strong>Shorthands:</strong> <C>w</C> and <C>h</C> are gone, so write <C>width</C> and{' '}
          <C>height</C>. <C>p</C>, <C>px</C>, <C>m</C>, <C>bg</C> and <C>rounded</C> stay.
        </LI>
        <LI>
          <strong>Theme keys:</strong> <C>background</C>, <C>color</C>, <C>border-color</C> and{' '}
          <C>color-1</C> to <C>color-11</C> stay, so Tamagui primitives keep working. Prefer the
          semantic ones (<C>foreground</C>, <C>mutedForeground</C>, <C>card</C>, <C>border</C>),
          listed on the <A href="/docs/colors">Colors</A> page.
        </LI>
        <LI>
          <strong>Colors:</strong> the Tailwind palette tokens (<C>blue-500</C>) are gone. Use theme
          keys, which follow light and dark mode.
        </LI>
        <LI>
          <strong>Sub-themes:</strong> <C>theme="blue"</C> and <C>theme="accent"</C> do not exist.
          Adv UI has <C>primary</C> and <C>inverse</C>. For status colors, use a component's{' '}
          <C>variant</C> or <C>tone</C>.
        </LI>
      </UL>
      <H2 id="styled">Your own styled components</H2>
      <P>
        <C>styled()</C> on <C>View</C> and <C>Text</C> keeps working, with Adv UI's tokens and theme
        keys. A <C>styled(Button)</C> built on Tamagui's skin needs a new approach: Adv UI's Button
        is not a styled component, so passing it to <C>styled()</C> breaks its label. It takes style
        props instead, so a small wrapper does the same job:
      </P>
      <Code
        title="primary-action.tsx"
        code={`import { Button, type ButtonProps } from '@advui/core'

export function PrimaryAction(props: ButtonProps) {
  return <Button size="lg" width="100%" {...props} />
}`}
      />
      <P>
        Once no styled controls are left, import <C>View</C>, <C>Text</C>, <C>XStack</C>,{' '}
        <C>YStack</C> and <C>styled</C> from <C>tamagui/unstyled</C> instead of <C>tamagui</C>, so
        Tamagui's skin stays out of your bundle.
      </P>
      <H2 id="limits">Limits</H2>
      <UL>
        <LI>
          <C>createUniversalConfig</C> takes no custom tokens, shorthands or media queries. For
          color, <C>colors.overrides</C> sets any theme value per mode, and <C>themes</C> replaces
          the themes whole.
        </LI>
        <LI>
          Tamagui's compiler is untested: neither the Adv UI docs nor its Expo playground use it.
        </LI>
      </UL>
    </>
  )
}

export const fromShadcnToc: TocItem[] = [
  { id: 'what-changes', title: 'What changes' },
  { id: 'side-by-side', title: 'Run both while you move' },
  { id: 'theme', title: 'Bring your theme' },
  { id: 'components', title: 'Component names' },
  { id: 'props', title: 'Props and events' },
  { id: 'classes', title: 'From classes to props' },
  { id: 'example', title: 'A screen, before and after' },
  { id: 'source', title: 'Own the source' },
]

export async function FromShadcn() {
  return (
    <>
      <H2 id="what-changes">What changes</H2>
      <P>
        shadcn/ui copies React components styled with Tailwind into a web app. Adv UI has a similar
        set, and its CLI can copy source too, but the same code also renders natively on iOS and
        Android. A phone has no DOM and no CSS, and that explains most of what changes:
      </P>
      <UL>
        <LI>
          <strong>Parts</strong> are properties: <C>DialogContent</C> → <C>Dialog.Content</C>,{' '}
          <C>CardHeader</C> → <C>Card.Header</C>.
        </LI>
        <LI>
          <strong>Styles</strong> are props, not class names: <C>className="p-4"</C> →{' '}
          <C>padding="4"</C>.
        </LI>
        <LI>
          <strong>Events</strong> are React Native's: <C>onClick</C> → <C>onPress</C>.
        </LI>
        <LI>
          <strong>Elements</strong> are components: <C>{'<div>'}</C> → <C>{'<VStack>'}</C>,{' '}
          <C>{'<p>'}</C> → <C>{'<Text>'}</C>.
        </LI>
      </UL>
      <H2 id="side-by-side">Run both while you move</H2>
      <P>
        Both can run in one Next.js app, so you can move a screen at a time. <C>init</C> writes{' '}
        <C>tamagui.config.ts</C>, installs the packages and adds what Next.js needs to{' '}
        <C>next.config</C>, next to what is already there. It also turns off Cache Components,{' '}
        <A href="/docs/installation#nextjs">which stops the build</A>, unless your code uses it:
      </P>
      <Code
        lang="bash"
        code={`npx advui init
pnpm add react-native-web`}
      />
      <P>
        Then wrap the app in <C>UniversalProvider</C>, as on the{' '}
        <A href="/docs/installation#nextjs">installation page</A>, and leave Tailwind where it is.
        Components you have not moved keep working. Where one file needs both, rename one import (
        <C>{"import { Button as AdvButton } from '@advui/core'"}</C>).
      </P>
      <P>
        The two keep separate color modes: shadcn/ui follows a <C>dark</C> class and Adv UI follows
        its provider. If your app has a theme switch, pass the same choice to the provider's{' '}
        <C>colorMode</C>.
      </P>
      <H2 id="theme">Bring your theme</H2>
      <P>
        Adv UI's <C>neutral</C> preset is close to shadcn/ui's default theme, with the same
        near-black buttons on gray surfaces. Its default <C>--radius</C> of <C>0.625rem</C> is 10px,
        and <C>radius</C> takes a base in pixels.
      </P>
      <Code
        title="tamagui.config.ts"
        code={`import { createUniversalConfig } from '@advui/theme'

export const config = createUniversalConfig({ preset: 'neutral', radius: 10 })
export default config`}
      />
      <P>
        For a brand color, paste your <C>--primary</C> into <C>colors</C> as it is, in{' '}
        <C>oklch()</C>, and leave the preset out, because <C>neutral</C> ignores <C>primary</C>. You
        set one value rather than one each for <C>:root</C> and <C>.dark</C>: Adv UI builds both
        palettes from it and checks their contrast.
      </P>
      <Code
        title="tamagui.config.ts"
        code={`export const config = createUniversalConfig({
  colors: { primary: 'oklch(0.546 0.245 262.881)', neutral: 'gray' },
  radius: 10,
})`}
      />
      <P>
        The variables have the same roles under camelCase names: <C>--muted-foreground</C> →{' '}
        <C>mutedForeground</C>. The one to watch is <C>text-primary</C>, which becomes{' '}
        <C>primaryText</C>: in Adv UI <C>primary</C> is only a fill, and <C>primaryText</C> keeps
        4.5:1 contrast on the page. To pin an exact value in one mode, use <C>colors.overrides</C>,
        which takes <C>oklch()</C> too, alpha included (<C>oklch(1 0 0 / 10%)</C>). The{' '}
        <A href="/docs/colors">Colors</A> page lists every key.
      </P>
      <H2 id="components">Component names</H2>
      <P>
        These keep their names: Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge,
        Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Checkbox, Code Block,
        Collapsible, Combobox, Context Menu, Date Picker, Dialog, Dropdown Menu, Field, Hover Card,
        Input, Kbd, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group,
        Scroll Area, Select, Separator, Sidebar, Skeleton, Slider, Spinner, Switch, Tabs, Textarea,
        Toast, Toggle, Toggle Group and Tooltip. Table and Data Table are in <C>@advui/data</C>.
      </P>
      <Callout variant="warning" title="Sheet and Drawer are swapped">
        shadcn/ui's Sheet is a side panel and its Drawer slides up from the bottom. In Adv UI,{' '}
        <A href="/docs/components/drawer">Drawer</A> is the side panel and{' '}
        <A href="/docs/components/sheet">Sheet</A> is the bottom sheet.{' '}
        <C>{'<SheetContent side="right">'}</C> → <C>{'<Drawer.Content side="right">'}</C>.
      </Callout>
      <P>These have another name or shape:</P>
      <UL>
        <LI>
          Command → <A href="/docs/components/command-palette">Command Palette</A>, which takes a{' '}
          <C>commands</C> list instead of parts.
        </LI>
        <LI>
          Input Group → <A href="/docs/components/input">Input</A> with <C>leading</C>,{' '}
          <C>trailing</C>, <C>leadingAddon</C> and <C>trailingAddon</C>.
        </LI>
        <LI>
          Input OTP → <A href="/docs/components/otp-input">OTP Input</A>.
        </LI>
        <LI>
          Resizable → <A href="/docs/components/resizable-panel">Resizable Panel</A>.
        </LI>
        <LI>
          Empty → <A href="/docs/components/empty-state">Empty State</A>.
        </LI>
        <LI>
          Item → <A href="/docs/components/list-item">List Item</A>.
        </LI>
        <LI>Native Select → Select, which already opens a bottom sheet on touch devices.</LI>
        <LI>Typography → Text and Heading.</LI>
        <LI>
          Chart → <C>@advui/charts</C>, with Bar, Line, Area, Pie and other chart components that
          draw on every platform.
        </LI>
      </UL>
      <P>The chat parts (Message, Bubble, Attachment and others) have no Adv UI component yet.</P>
      <H2 id="props">Props and events</H2>
      <UL>
        <LI>
          <C>onClick</C> → <C>onPress</C>.
        </LI>
        <LI>
          <C>{'onChange={(e) => setValue(e.target.value)}'}</C> → <C>{'onChangeText={setValue}'}</C>
          .
        </LI>
        <LI>
          <C>onCheckedChange</C>, <C>onValueChange</C> and <C>onOpenChange</C> keep their names.
        </LI>
        <LI>
          <C>Button</C> has the same variants (<C>default</C>, <C>secondary</C>, <C>outline</C>,{' '}
          <C>ghost</C>, <C>destructive</C>, <C>link</C>). <C>size="default"</C> → <C>size="md"</C>,
          and <C>size="icon"</C> → <A href="/docs/components/icon-button">Icon Button</A> with an{' '}
          <C>aria-label</C>.
        </LI>
        <LI>
          A trigger around your own button: on Radix <C>{'<DialogTrigger asChild>'}</C>, and on Base
          UI <C>{'<DialogTrigger render={<Button />}>'}</C>, both →{' '}
          <C>{'<Dialog.Trigger asChild>'}</C> around the Button.
        </LI>
        <LI>
          <C>{'<Button asChild><Link href="/" /></Button>'}</C> →{' '}
          <C>{'<Button render={<Link href="/" />}>'}</C>. See{' '}
          <A href="/docs/navigation#nextjs">Navigation</A>.
        </LI>
        <LI>
          <C>Select</C>: drop <C>SelectTrigger</C>, <C>SelectValue</C> and <C>SelectContent</C>.
          Pass <C>placeholder</C> to <C>Select</C> and put <C>Select.Item</C> inside it.
        </LI>
        <LI>
          <C>Tooltip</C>: <C>{'<Tooltip content="Delete">'}</C> around the trigger.
        </LI>
        <LI>
          <C>Alert</C>: <C>AlertTitle</C> and <C>AlertDescription</C> → the <C>title</C> and{' '}
          <C>description</C> props.
        </LI>
        <LI>
          <C>Avatar</C>: <C>{'<Avatar src={url} alt="Ada" fallback="AL" />'}</C>.
        </LI>
        <LI>
          <C>DropdownMenuItem</C>: <C>onClick</C> → <C>onSelect</C>, and{' '}
          <C>variant="destructive"</C> → <C>destructive</C>.
        </LI>
        <LI>
          Toasts: <C>toast.success('Saved')</C>, and drop <C>{'<Toaster />'}</C>, which{' '}
          <C>UniversalProvider</C> renders.
        </LI>
        <LI>
          Icons: <C>lucide-react</C> does not render on iOS and Android. <C>@advui/icons</C> has a
          Lucide-based set under <C>…Icon</C> names (<C>SearchIcon</C>).
        </LI>
        <LI>
          Forms: <C>Field</C> and <C>Form</C> wire up labels and errors for you, on every platform.
          See <A href="/docs/forms">Forms and the keyboard</A>.
        </LI>
      </UL>
      <H2 id="classes">From classes to props</H2>
      <P>
        Layout components and every Adv UI component take style props, with the same 4px scale as
        Tailwind:
      </P>
      <UL>
        <LI>
          <C>flex flex-col gap-4</C> → <C>{'<VStack gap="4">'}</C>
        </LI>
        <LI>
          <C>flex items-center justify-between</C> →{' '}
          <C>{'<HStack justifyContent="space-between">'}</C>
        </LI>
        <LI>
          <C>grid grid-cols-3 gap-4</C> → <C>{'<Grid columns={3} gap="4">'}</C>
        </LI>
        <LI>
          <C>p-4 px-6</C> → <C>padding="4" paddingHorizontal="6"</C> (or <C>p</C> and <C>px</C>)
        </LI>
        <LI>
          <C>w-full max-w-md</C> → <C>width="100%" maxWidth={'{448}'}</C>
        </LI>
        <LI>
          <C>rounded-lg bg-muted</C> → <C>borderRadius="lg" backgroundColor="muted"</C>
        </LI>
        <LI>
          <C>text-sm font-medium text-muted-foreground</C> →{' '}
          <C>{'<Text size="sm" weight="medium" tone="muted">'}</C>
        </LI>
        <LI>
          <C>hover:bg-accent</C> → <C>backgroundColor="hover:accent"</C>
        </LI>
        <LI>
          <C>flex-col md:flex-row</C> → <C>flexDirection="column md:row"</C>
        </LI>
        <LI>
          <C>hidden md:block</C> → <C>{'<Show above="md">'}</C>
        </LI>
        <LI>
          <C>shadow-md</C> → <C>{'{...shadows.md}'}</C> from <C>@advui/theme</C>
        </LI>
        <LI>
          <C>dark:</C> → nothing: theme keys follow light and dark mode.
        </LI>
      </UL>
      <P>
        <C>cn()</C> and <C>cva</C> have no equivalent: pick a component's <C>variant</C>, and pass a
        conditional value to a prop. To keep writing classes for layout, see{' '}
        <A href="/docs/tailwind">Tailwind</A>, which covers Tamagui's <C>@tamagui/tailwind</C>.
      </P>
      <H2 id="example">A screen, before and after</H2>
      <Code
        title="profile.tsx (before)"
        code={`import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Profile({ name, setName, save }: ProfileProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How others see you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button className="w-full" onClick={save}>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}`}
      />
      <Code
        title="profile.tsx (after)"
        code={`import { Button, Card, Field, Input } from '@advui/core'

export function Profile({ name, setName, save }: ProfileProps) {
  return (
    <Card width="100%" maxWidth={448}>
      <Card.Header>
        <Card.Title>Profile</Card.Title>
        <Card.Description>How others see you.</Card.Description>
      </Card.Header>
      <Card.Content gap="4">
        <Field label="Name">
          <Input value={name} onChangeText={setName} />
        </Field>
        <Button fullWidth onPress={save}>
          Save
        </Button>
      </Card.Content>
    </Card>
  )
}`}
      />
      <P>The second one also runs on iOS and Android as it is.</P>
      <H2 id="source">Own the source</H2>
      <P>
        To keep editing components in your repo, as you do with shadcn/ui, copy them in with the CLI
        instead of importing the package:
      </P>
      <Code lang="bash" code="npx advui add button dialog" />
      <P>
        <C>advui.json</C> plays the part of <C>components.json</C>. Unlike <C>shadcn add</C>, the
        CLI records what it copied, so <C>advui diff</C> shows what changed on each side and{' '}
        <C>advui update</C> merges upstream's fixes into your edits. See the{' '}
        <A href="/docs/cli">CLI</A> page.
      </P>
    </>
  )
}
