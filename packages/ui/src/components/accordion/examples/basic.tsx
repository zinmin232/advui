import { Accordion } from '@advui/core'

export default function AccordionBasic() {
  return (
    <Accordion type="single" collapsible defaultValue="accessible" maxWidth="$128">
      <Accordion.Item value="accessible">
        <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        <Accordion.Content>
          Yes. It follows the WAI-ARIA accordion pattern: headings, buttons and regions, with
          arrow-key navigation between sections.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="native">
        <Accordion.Trigger>Does it work on iOS and Android?</Accordion.Trigger>
        <Accordion.Content>
          The same component renders native views in Expo and React Native.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="animated">
        <Accordion.Trigger>Is it animated?</Accordion.Trigger>
        <Accordion.Content>
          Sections grow and shrink smoothly, and skip the animation when the device asks for reduced
          motion.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  )
}
