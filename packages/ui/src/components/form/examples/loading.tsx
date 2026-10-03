import { Form, Field, Input, Text } from '@advui/core'
import { useState } from 'react'

// Stands in for a real request, e.g. saving a 5W activity.
const saveActivity = () => new Promise((resolve) => setTimeout(resolve, 1500))

export default function FormLoading() {
  // The app owns the loading state; Form only shows it.
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await saveActivity()
      setSaved(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      width="100%"
      maxWidth={400}
      onSubmit={handleSubmit}
      loading={loading}
      loadingText="Saving…"
      footer={<Form.Submit>Save activity</Form.Submit>}
    >
      <Field label="Activity">
        <Input defaultValue="Hygiene kit distribution" />
      </Field>
      <Field label="Township">
        <Input defaultValue="Hlaingthaya" />
      </Field>
      <Text size="sm" tone="muted" aria-live="polite">
        {saved ? 'Activity saved.' : 'Not saved yet.'}
      </Text>
    </Form>
  )
}
