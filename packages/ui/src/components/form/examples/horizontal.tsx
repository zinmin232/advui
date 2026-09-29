import { Form, Input } from '@advui/core'
import { SearchIcon } from '@advui/icons'

export default function FormHorizontal() {
  return (
    // A search form: the fields and the button share one wrapping row.
    <Form direction="horizontal" gap="$2" width="100%" maxWidth={480} aria-label="Search townships">
      <Input
        flex={1}
        minWidth={180}
        placeholder="Township or Pcode"
        aria-label="Township or Pcode"
      />
      <Form.Submit variant="secondary" icon={<SearchIcon />}>
        Search
      </Form.Submit>
    </Form>
  )
}
