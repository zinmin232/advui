import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  HStack,
  IconButton,
  Input,
  Label,
  Select,
  Separator,
  Switch,
  Tabs,
  Text,
  Tooltip,
  VStack,
  toast,
} from '@adv-ui/core'
import { EditIcon, PlusIcon, SearchIcon, TrashIcon } from '@adv-ui/icons'
import { useMemo, useState } from 'react'
import { InputIcon, SectionTitle, avatarUrl, people } from './shared'

const roleVariant = {
  Owner: 'default',
  Admin: 'info',
  Member: 'secondary',
  Viewer: 'outline',
} as const

export function AdminScreen() {
  const [users, setUsers] = useState(people)
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')
  const filtered = useMemo(
    () => users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())),
    [users, query],
  )

  return (
    <VStack gap="$6" padding="$4" width="100%" $md={{ padding: '$8' }}>
      <HStack justifyContent="space-between" flexWrap="wrap" gap="$3">
        <VStack>
          <Text size="3xl" weight="bold">
            Team
          </Text>
          <Text tone="muted">Manage members, roles and security.</Text>
        </VStack>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <Dialog.Trigger asChild>
            <Button icon={<PlusIcon />}>Invite member</Button>
          </Dialog.Trigger>
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Invite a teammate</Dialog.Title>
              <Dialog.Description>
                They will receive an email with a sign-up link.
              </Dialog.Description>
            </Dialog.Header>
            <VStack gap="$2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                placeholder="name@company.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
              />
            </VStack>
            <VStack gap="$2">
              <Label htmlFor="invite-role">Role</Label>
              <Select id="invite-role" value={inviteRole} onValueChange={setInviteRole}>
                <Select.Item value="Admin">Admin</Select.Item>
                <Select.Item value="Member">Member</Select.Item>
                <Select.Item value="Viewer">Viewer</Select.Item>
              </Select>
            </VStack>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button
                disabled={!inviteEmail.includes('@')}
                onPress={() => {
                  setUsers((prev) => [
                    ...prev,
                    {
                      name: inviteEmail.split('@')[0] ?? inviteEmail,
                      email: inviteEmail,
                      amount: '',
                      role: inviteRole,
                      img: 60,
                    },
                  ])
                  setInviteOpen(false)
                  setInviteEmail('')
                  toast.success('Invitation sent', { description: inviteEmail })
                }}
              >
                Send invite
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </HStack>

      <Tabs defaultValue="members" variant="underline">
        <Tabs.List aria-label="Team settings">
          <Tabs.Trigger value="members">Members</Tabs.Trigger>
          <Tabs.Trigger value="security">Security</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="members" gap="$4" paddingTop="$2">
          <HStack position="relative" maxWidth="$96">
            <Input
              aria-label="Search members"
              placeholder="Search members…"
              flex={1}
              value={query}
              onChangeText={setQuery}
              paddingLeft="$9"
            />
            <InputIcon>
              <SearchIcon size={16} color="$mutedForeground" />
            </InputIcon>
          </HStack>
          <Card>
            {filtered.map((user, index) => (
              <VStack key={user.email}>
                {index > 0 ? <Separator /> : null}
                <HStack gap="$3" padding="$4" flexWrap="wrap">
                  <Avatar alt={user.name} src={avatarUrl(user.img)} />
                  <VStack flex={1} minWidth="$40">
                    <Text weight="medium">{user.name}</Text>
                    <Text size="sm" tone="muted">
                      {user.email}
                    </Text>
                  </VStack>
                  <Badge
                    variant={roleVariant[user.role as keyof typeof roleVariant] ?? 'secondary'}
                    size="sm"
                  >
                    {user.role}
                  </Badge>
                  <HStack gap="$1">
                    <Tooltip content={`Edit ${user.name}`}>
                      <IconButton
                        aria-label={`Edit ${user.name}`}
                        size="sm"
                        icon={<EditIcon />}
                        onPress={() => toast(`Editing ${user.name}`)}
                      />
                    </Tooltip>
                    <Tooltip content={`Remove ${user.name}`}>
                      <IconButton
                        aria-label={`Remove ${user.name}`}
                        size="sm"
                        icon={<TrashIcon />}
                        disabled={user.role === 'Owner'}
                        onPress={() => {
                          setUsers((prev) => prev.filter((u) => u.email !== user.email))
                          toast('Member removed', {
                            action: {
                              label: 'Undo',
                              onClick: () => setUsers((prev) => [...prev, user]),
                            },
                          })
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </VStack>
            ))}
            {filtered.length === 0 ? (
              <Text tone="muted" padding="$6" textAlign="center">
                No members match “{query}”.
              </Text>
            ) : null}
          </Card>
        </Tabs.Content>
        <Tabs.Content value="security" paddingTop="$2">
          <Card>
            <Card.Header>
              <SectionTitle title="Security" description="Policies that apply to every member." />
            </Card.Header>
            <Card.Content gap="$4">
              {[
                {
                  id: 'sec-2fa',
                  label: 'Require two-factor authentication',
                  hint: 'Members must enable 2FA to access the workspace.',
                  on: true,
                },
                {
                  id: 'sec-sso',
                  label: 'Enforce single sign-on',
                  hint: 'Only allow sign in through your identity provider.',
                  on: false,
                },
                {
                  id: 'sec-audit',
                  label: 'Audit log',
                  hint: 'Record sign-ins and permission changes.',
                  on: true,
                },
              ].map((policy) => (
                <HStack key={policy.id} justifyContent="space-between" gap="$4">
                  <VStack flex={1}>
                    <Label htmlFor={policy.id}>{policy.label}</Label>
                    <Text size="sm" tone="muted">
                      {policy.hint}
                    </Text>
                  </VStack>
                  <Switch id={policy.id} defaultChecked={policy.on} />
                </HStack>
              ))}
            </Card.Content>
          </Card>
        </Tabs.Content>
      </Tabs>
    </VStack>
  )
}
