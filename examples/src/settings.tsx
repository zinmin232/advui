import {
  Alert,
  Avatar,
  Button,
  Card,
  Dialog,
  Grid,
  HStack,
  Input,
  Label,
  RadioGroup,
  Select,
  Switch,
  Text,
  Textarea,
  VStack,
  toast,
} from '@adv-ui/core'
import { useState } from 'react'
import { SectionTitle, avatarUrl } from './shared'

export function ProfileSettingsScreen() {
  const [name, setName] = useState('Isabella Nguyen')
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const save = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile updated')
    }, 900)
  }

  return (
    <VStack
      gap="$6"
      padding="$4"
      width="100%"
      maxWidth="$224"
      marginHorizontal="auto"
      $md={{ padding: '$8' }}
    >
      <VStack>
        <Text size="3xl" weight="bold">
          Settings
        </Text>
        <Text tone="muted">Manage your profile and preferences.</Text>
      </VStack>

      <Card>
        <Card.Header>
          <SectionTitle title="Profile" description="This is how others see you." />
        </Card.Header>
        <Card.Content gap="$5">
          <HStack gap="$4">
            <Avatar size="xl" alt={name} src={avatarUrl(47)} />
            <VStack gap="$2">
              <Button
                size="sm"
                variant="outline"
                onPress={() => toast('Photo picker would open here')}
              >
                Change photo
              </Button>
              <Text size="xs" tone="muted">
                JPG or PNG, max 2 MB.
              </Text>
            </VStack>
          </HStack>
          <Grid columns={{ base: 1, md: 2 }} gap="$4">
            <VStack gap="$2">
              <Label htmlFor="settings-name">Display name</Label>
              <Input id="settings-name" value={name} onChangeText={setName} />
            </VStack>
            <VStack gap="$2">
              <Label htmlFor="settings-email">Email</Label>
              <Input id="settings-email" defaultValue="isabella@acme.co" inputMode="email" />
            </VStack>
            <VStack gap="$2">
              <Label htmlFor="settings-language">Language</Label>
              <Select id="settings-language" defaultValue="en">
                <Select.Item value="en">English</Select.Item>
                <Select.Item value="my">Burmese</Select.Item>
                <Select.Item value="th">Thai</Select.Item>
                <Select.Item value="ja">Japanese</Select.Item>
              </Select>
            </VStack>
            <VStack gap="$2">
              <Label htmlFor="settings-timezone">Timezone</Label>
              <Select id="settings-timezone" defaultValue="yangon">
                <Select.Item value="yangon">Asia/Yangon</Select.Item>
                <Select.Item value="bangkok">Asia/Bangkok</Select.Item>
                <Select.Item value="london">Europe/London</Select.Item>
              </Select>
            </VStack>
          </Grid>
          <VStack gap="$2">
            <Label htmlFor="settings-bio">Bio</Label>
            <Textarea id="settings-bio" defaultValue="Product designer. Coffee enthusiast." />
          </VStack>
        </Card.Content>
        <Card.Footer justifyContent="flex-end">
          <Button loading={saving} onPress={save}>
            Save changes
          </Button>
        </Card.Footer>
      </Card>

      <Card>
        <Card.Header>
          <SectionTitle title="Notifications" description="Choose what you want to hear about." />
        </Card.Header>
        <Card.Content gap="$4">
          <RadioGroup defaultValue="mentions" aria-label="Notify me about">
            {[
              ['all', 'All new messages'],
              ['mentions', 'Direct messages and mentions'],
              ['none', 'Nothing'],
            ].map(([value, label]) => (
              <HStack key={value} gap="$2">
                <RadioGroup.Item value={value!} id={`notify-${value}`} />
                <Label htmlFor={`notify-${value}`}>{label}</Label>
              </HStack>
            ))}
          </RadioGroup>
          <HStack justifyContent="space-between" gap="$4">
            <VStack flex={1}>
              <Label htmlFor="settings-digest">Weekly digest</Label>
              <Text size="sm" tone="muted">
                A summary of activity every Monday.
              </Text>
            </VStack>
            <Switch id="settings-digest" defaultChecked />
          </HStack>
        </Card.Content>
      </Card>

      <Card borderColor="$errorBorder">
        <Card.Header>
          <SectionTitle title="Danger zone" />
        </Card.Header>
        <Card.Content gap="$3">
          <Alert variant="error" icon={null}>
            <Alert.Description>
              Deleting your account removes all projects and cannot be undone.
            </Alert.Description>
          </Alert>
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Dialog.Trigger asChild>
              <Button variant="destructive" alignSelf="flex-start">
                Delete account
              </Button>
            </Dialog.Trigger>
            <Dialog.Content size="sm" hideCloseButton>
              <Dialog.Header>
                <Dialog.Title>Delete your account?</Dialog.Title>
                <Dialog.Description>
                  All of your data will be permanently removed.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.Close>
                <Button
                  variant="destructive"
                  onPress={() => {
                    setConfirmOpen(false)
                    toast.error('Account deletion is disabled in this demo')
                  }}
                >
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog>
        </Card.Content>
      </Card>
    </VStack>
  )
}
