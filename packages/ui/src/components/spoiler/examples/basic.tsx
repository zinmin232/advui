import { Spoiler, Text, VStack } from '@advui/core'

export default function SpoilerBasic() {
  return (
    <Spoiler width="100%" maxWidth="96">
      <VStack gap="3">
        <Text size="sm">
          The north trail climbs through pine forest for the first two kilometres, then opens onto a
          ridge with views over both valleys. Most walkers stop at the stone shelter, where there is
          water from April to October.
        </Text>
        <Text size="sm">
          Past the shelter the path narrows and crosses two scree slopes. Keep to the cairns: the
          old path below them washed out in the spring and is closed. The summit is another forty
          minutes from the second slope.
        </Text>
        <Text size="sm">
          Come down the same way, or take the forest road from the shelter, which is longer but
          gentler on the knees and passes the lake.
        </Text>
      </VStack>
    </Spoiler>
  )
}
