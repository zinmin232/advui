import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Form',
  slug: 'form',
  category: 'forms',
  description:
    'Lays out a form, with an optional title, description and footer, and wires up submit, loading and disabled states. Field state and validation stay with your app or form library.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Form',
    'FormProps',
    'FormSubmitProps',
    'FormDirection',
    'useParentForm',
    'FormContextValue',
    'useFormStatus',
    'FormStatus',
  ],
  files: ['components/form/Form.tsx', 'components/form/index.ts'],
  keywords: [
    'form',
    'submit',
    'fields',
    'loading',
    'react hook form',
    'formik',
    'search form',
    'filters',
  ],
  usage: `import { Button, Form, Field, Input } from '@advui/core'

const [saving, setSaving] = useState(false)

const save = async () => {
  setSaving(true)
  try {
    await saveUser()
  } finally {
    setSaving(false)
  }
}

<Form
  title="Create account"
  description="Enter your details."
  onSubmit={save}
  loading={saving}
  loadingText="Saving…"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Form.Submit>Save</Form.Submit>
    </>
  }
>
  <Field label="Name">
    <Input />
  </Field>
  <Field label="Email">
    <Input inputMode="email" />
  </Field>
</Form>`,
  parts: [
    {
      name: 'Form',
      description:
        'A `<form>` on web and a View on native, built on Tamagui’s Form. It takes every view prop (`padding`, `backgroundColor`, `borderRadius`, `width`, `theme`, media props, `testID`, `aria-*`…). It never clones or changes its children.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'The fields: Field, inputs, checkboxes, your own components…',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: "'$4'",
          description: 'Space between the fields.',
        },
        {
          name: 'title',
          type: 'ReactNode',
          description:
            'Text becomes a level-2 heading that names the form. Pass an element (e.g. `<Heading level={1}>`) for another level.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Muted text under the title; describes the form.',
        },
        {
          name: 'footer',
          type: 'ReactNode',
          description:
            'Actions under the fields, right-aligned. Put anything here: Cancel, `Form.Submit`, links. No submit button is assumed.',
        },
        {
          name: 'onSubmit',
          type: '() => void | Promise<unknown>',
          description:
            'Called by `Form.Submit` and, on web, by Enter in a field. Not called while `disabled` or `loading`. A returned Promise is not awaited: set `loading` yourself.',
        },
        {
          name: 'loading',
          type: 'boolean',
          default: 'false',
          description:
            'The app is submitting. `Form.Submit` shows a spinner and is busy, and `onSubmit` is blocked. Fields stay editable.',
        },
        {
          name: 'loadingText',
          type: 'ReactNode',
          description:
            'Replaces the `Form.Submit` label while loading, e.g. "Saving…", and is announced once on web.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Disables every form control inside, in a Field or not (Input, Textarea, Select, Checkbox, Switch, Radio Group, pickers…), and `Form.Submit`, and blocks `onSubmit`. Other buttons, such as Cancel, stay enabled.',
        },
        {
          name: 'direction',
          type: "'vertical' | 'horizontal'",
          options: ['vertical', 'horizontal'],
          default: "'vertical'",
          description:
            '`horizontal` puts the fields in a wrapping, bottom-aligned row: for search bars and filters.',
        },
        {
          name: 'fullWidth',
          type: 'boolean',
          default: 'false',
          description:
            'The form fills its container, and footer actions stack at full width. Fields fill the width in either case.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Form.Submit',
      description:
        'A Loading Button that submits the form: a submit button on web (so Enter in a field submits too), and a press that calls `onSubmit` on native. Takes every Loading Button prop.',
      props: [
        {
          name: 'loading',
          type: 'boolean',
          default: "the form's `loading`",
          description: 'Spinner, `aria-busy` and blocked presses.',
        },
        {
          name: 'loadingText',
          type: 'ReactNode',
          default: "the form's `loadingText`",
          description: 'Label while loading.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Also disabled while the form is.',
        },
      ],
      children: { accepts: 'text' },
      within: 'Form',
    },
    {
      name: 'useParentForm',
      kind: 'hook',
      description:
        'Reads the surrounding Form, for your own fields and actions; returns a `FormContextValue`. Outside a Form it returns the defaults, and `submit` does nothing. It was called `useFormStatus` (still exported, deprecated), which is also the name of a React DOM hook for Server Actions.',
      props: [
        { name: 'disabled', type: 'boolean', description: "The form's `disabled`." },
        { name: 'loading', type: 'boolean', description: "The form's `loading`." },
        { name: 'loadingText', type: 'ReactNode', description: "The form's `loadingText`." },
        {
          name: 'submit',
          type: '() => void',
          description:
            'Calls `onSubmit` unless disabled or loading, e.g. from a custom button or `onSubmitEditing` on native.',
        },
      ],
    },
  ],
  playground: {
    component: 'Form',
    controls: [
      { prop: 'title', type: 'text', default: 'Create account' },
      { prop: 'description', type: 'text', default: 'Enter your details.' },
      {
        prop: 'direction',
        type: 'select',
        options: ['vertical', 'horizontal'],
        default: 'vertical',
      },
      { prop: 'gap', type: 'select', options: ['$2', '$4', '$6'], default: '$4' },
      { prop: 'loading', type: 'boolean', default: false },
      { prop: 'loadingText', type: 'text', default: 'Saving…' },
      { prop: 'disabled', type: 'boolean', default: false },
      { prop: 'fullWidth', type: 'boolean', default: false },
    ],
  },
  examples: [
    { name: 'basic', title: 'Basic', description: 'Fields stacked with a consistent gap.' },
    { name: 'title-description', title: 'Title and description' },
    {
      name: 'footer',
      title: 'Footer',
      description: 'Actions under the fields. The footer holds anything you pass.',
    },
    {
      name: 'loading',
      title: 'Loading',
      description:
        'The app sets `loading` around the request. Press Save several times: presses while saving are ignored.',
    },
    {
      name: 'horizontal',
      title: 'Horizontal',
      description: 'A compact search form in one row. Give the input `flex` to share the row.',
    },
    { name: 'disabled', title: 'Disabled' },
    {
      name: 'validation',
      title: 'With your own validation',
      description:
        'The app (or React Hook Form, Formik…) owns values and errors; Field shows them.',
    },
    {
      name: 'custom-styling',
      title: 'Custom styling',
      description: 'Style props and themes work as on any view.',
    },
  ],
  accessibility: [
    'On web it is a `<form>`. With a `title` it is named by it (`aria-labelledby`) and described by `description`, so screen-reader users can jump to it as a form landmark. Without a title, pass `aria-label` if it should be a landmark.',
    'A text `title` is a heading (level 2, `header` role on iOS and Android); pass your own Heading for another level.',
    'Enter in a field submits on web, as in any HTML form with a submit button. On native, call `submit` from `useParentForm()` in `onSubmitEditing` if Return should submit.',
    'While loading, `Form.Submit` is busy (`aria-busy`) and disabled, and `loadingText` is read once from a polite status region on web. The form itself is not marked busy, so its fields stay readable.',
    'While disabled, every form control inside is disabled (`aria-disabled` and not editable), and Field labels are dimmed. Form never clones its children: the core controls read the form through context, and your own controls can call `useFieldControl(props)` or `useParentForm()`. Buttons other than `Form.Submit` stay enabled, so Cancel still works.',
    'Browser validation is off (`noValidate`) so errors come from your app, the same on every platform: show them with a Field’s `error`.',
  ],
  keyboard: [
    { keys: 'Enter', action: 'In a field: submits the form (web).' },
    {
      keys: 'Enter / Space',
      action: 'On Form.Submit: submits; ignored while loading or disabled.',
    },
    { keys: 'Tab', action: 'Moves through the fields and actions in order.' },
  ],
  responsive:
    'Vertical forms fill their container and stack fields. Horizontal forms wrap fields to the next line when they run out of room; give fields `flex` and `minWidth`. Use media props (`$sm={{ padding: "$6" }}`) for per-breakpoint styles.',
  platformNotes: {
    web: 'Renders `<form noValidate>`; `Form.Submit` is `<button type="submit">`.',
    ios: 'No form element: `Form.Submit` calls `onSubmit` on press. The loading status is read from the busy button.',
    android: 'Same as iOS.',
  },
  related: ['field', 'loading-button', 'input', 'button'],
})
