import { Grid } from '@advui/core'
import { KpiCard } from '@advui/data'
import { BarChartIcon, PackageIcon, ShoppingCartIcon, UsersIcon } from '@advui/icons'

export default function KpiCardGrid() {
  return (
    <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="$4" width="100%">
      <KpiCard
        label="Subscriptions"
        value="2,350"
        delta="180.1%"
        trend="up"
        description="from last month"
        icon={<UsersIcon />}
      />
      <KpiCard
        label="Orders"
        value="12,234"
        delta="4.3%"
        trend="down"
        description="from last month"
        icon={<ShoppingCartIcon />}
      />
      <KpiCard
        label="Returns"
        value="312"
        delta="11%"
        trend="down"
        tone="positive"
        description="fewer than last month"
        icon={<PackageIcon />}
      />
      <KpiCard
        label="Active now"
        value="573"
        delta="0%"
        description="since last hour"
        icon={<BarChartIcon />}
      />
    </Grid>
  )
}
