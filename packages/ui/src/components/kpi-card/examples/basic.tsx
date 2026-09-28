import { KpiCard } from '@advui/core'
import { CreditCardIcon } from '@advui/icons'

export default function KpiCardBasic() {
  return (
    <KpiCard
      width="100%"
      maxWidth="$80"
      label="Total revenue"
      value="$45,231.89"
      delta="20.1%"
      trend="up"
      description="from last month"
      icon={<CreditCardIcon />}
    />
  )
}
