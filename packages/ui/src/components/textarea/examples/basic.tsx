import { Label, Text, Textarea, VStack } from '@adv-ui/core'

export default function TextareaBasic() {
  return (
    <VStack gap="$2" width="100%" maxWidth="$96">
      <Label htmlFor="feedback">Feedback</Label>
      <Textarea
        id="feedback"
        placeholder="What could we improve?"
        aria-describedby="feedback-hint"
      />
      <Text id="feedback-hint" size="sm" tone="muted">
        Markdown is supported.
      </Text>
    </VStack>
  )
}
