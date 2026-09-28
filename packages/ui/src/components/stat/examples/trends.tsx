import { Grid, Stat } from '@advui/core'

export default function StatTrends() {
  return (
    <Grid columns={{ base: 1, sm: 3 }} gap="$6" width="100%">
      <Stat>
        <Stat.Label>Revenue</Stat.Label>
        <Stat.Value>$48,210</Stat.Value>
        <Stat.Delta trend="up" variant="badge">
          12.5%
        </Stat.Delta>
      </Stat>
      <Stat>
        <Stat.Label>Refunds</Stat.Label>
        <Stat.Value>$1,092</Stat.Value>
        {/* Fewer refunds is good news: keep the down arrow, color it positive. */}
        <Stat.Delta trend="down" tone="positive" variant="badge">
          3.1%
        </Stat.Delta>
      </Stat>
      <Stat>
        <Stat.Label>Open tickets</Stat.Label>
        <Stat.Value>37</Stat.Value>
        <Stat.Delta trend="neutral" variant="badge">
          0%
        </Stat.Delta>
      </Stat>
    </Grid>
  )
}
