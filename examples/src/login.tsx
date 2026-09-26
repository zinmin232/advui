import {
  Button,
  Card,
  Checkbox,
  HStack,
  Input,
  Label,
  Separator,
  Text,
  VStack,
  toast,
} from '@adv-ui/core'
import { LockIcon, MailIcon } from '@adv-ui/icons'
import { useState } from 'react'
import { InputIcon, LogoMark } from './shared'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailError = submitted && !emailPattern.test(email) ? 'Enter a valid email address.' : null
  const passwordError =
    submitted && password.length < 8 ? 'Password must be at least 8 characters.' : null

  const submit = () => {
    setSubmitted(true)
    if (!emailPattern.test(email) || password.length < 8) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Signed in', { description: `Welcome back, ${email}` })
    }, 1200)
  }

  return (
    <VStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$6" width="100%">
      <VStack alignItems="center" gap="$3">
        <LogoMark size={40} />
        <VStack alignItems="center" gap="$1">
          <Text size="2xl" weight="bold">
            Welcome back
          </Text>
          <Text tone="muted" textAlign="center">
            Sign in to continue to your workspace
          </Text>
        </VStack>
      </VStack>

      <Card width="100%" maxWidth="$96">
        <Card.Content gap="$4">
          <Button
            variant="outline"
            fullWidth
            onPress={() => toast('SSO is not configured in this demo')}
          >
            Continue with SSO
          </Button>
          <HStack gap="$3">
            <Separator flex={1} width="auto" />
            <Text size="xs" tone="muted">
              OR
            </Text>
            <Separator flex={1} width="auto" />
          </HStack>
          <VStack gap="$2">
            <Label htmlFor="login-email">Email</Label>
            <HStack position="relative">
              <Input
                id="login-email"
                flex={1}
                placeholder="you@company.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                invalid={!!emailError}
                aria-describedby={emailError ? 'login-email-error' : undefined}
                paddingLeft="$9"
              />
              <InputIcon>
                <MailIcon size={16} color="$mutedForeground" />
              </InputIcon>
            </HStack>
            {emailError ? (
              <Text id="login-email-error" size="sm" tone="error">
                {emailError}
              </Text>
            ) : null}
          </VStack>
          <VStack gap="$2">
            <HStack justifyContent="space-between">
              <Label htmlFor="login-password">Password</Label>
              <Button
                variant="link"
                size="sm"
                height="auto"
                onPress={() => toast('Password reset link sent')}
              >
                Forgot password?
              </Button>
            </HStack>
            <HStack position="relative">
              <Input
                id="login-password"
                flex={1}
                secureTextEntry
                autoComplete="current-password"
                value={password}
                onChangeText={setPassword}
                invalid={!!passwordError}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
                paddingLeft="$9"
                onSubmitEditing={submit}
              />
              <InputIcon>
                <LockIcon size={16} color="$mutedForeground" />
              </InputIcon>
            </HStack>
            {passwordError ? (
              <Text id="login-password-error" size="sm" tone="error">
                {passwordError}
              </Text>
            ) : null}
          </VStack>
          <HStack gap="$2">
            <Checkbox id="login-remember" defaultChecked />
            <Label htmlFor="login-remember">Keep me signed in</Label>
          </HStack>
          <Button size="lg" fullWidth loading={loading} onPress={submit}>
            Sign in
          </Button>
        </Card.Content>
      </Card>
      <Text size="sm" tone="muted">
        No account?{' '}
        <Text size="sm" tone="primary" weight="medium" onPress={() => toast('Sign-up flow')}>
          Create one
        </Text>
      </Text>
    </VStack>
  )
}
