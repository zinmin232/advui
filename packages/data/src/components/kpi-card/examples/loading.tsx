import { KpiCard } from '@advui/data'
import { UsersIcon } from '@advui/icons'

export default function KpiCardLoading() {
  return (
    <KpiCard
      width="100%"
      maxWidth="$80"
      loading
      label="New customers"
      value="1,204"
      delta="6%"
      trend="up"
      description="from last week"
      icon={<UsersIcon />}
    />
  )
}
