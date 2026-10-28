import { TransferList } from '@advui/core'

const columns = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'team', label: 'Team' },
  { value: 'last-active', label: 'Last active' },
  { value: 'created', label: 'Created' },
]

export default function TransferListBasic() {
  return (
    <TransferList
      items={columns}
      defaultValue={['name', 'email', 'role']}
      labels={{ source: 'Hidden columns', target: 'Shown columns' }}
      width="100%"
      maxWidth="128"
    />
  )
}
