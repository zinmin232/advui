import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useFormStatus } from '../../hooks/useFormStatus'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { Button } from '../button/Button'
import { Field } from '../field/Field'
import { Input } from '../input/Input'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'
import { Form } from './Form'

/** The content row: the element that directly holds the fields. */
const contentOf = (field: HTMLElement) => field.closest('form > *') as HTMLElement

describe('Form', () => {
  it('renders a <form> with its children, stacked vertically by default', () => {
    renderWithProvider(
      <Form testID="form">
        <Input aria-label="Name" />
        <Input aria-label="Email" />
      </Form>,
    )
    const form = screen.getByTestId('form')
    expect(form.tagName).toBe('FORM')
    const name = screen.getByRole('textbox', { name: 'Name' })
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
    const content = contentOf(name)
    expect(getComputedStyle(content).flexDirection).toBe('column')
    expect(getComputedStyle(content).gap).toBe('16px')
  })

  it('puts the fields in a wrapping row when horizontal', () => {
    renderWithProvider(
      <Form direction="horizontal" gap="$2">
        <Input aria-label="Search" />
      </Form>,
    )
    const content = contentOf(screen.getByRole('textbox', { name: 'Search' }))
    const style = getComputedStyle(content)
    expect(style.flexDirection).toBe('row')
    expect(style.flexWrap).toBe('wrap')
    expect(style.alignItems).toBe('flex-end')
    expect(style.gap).toBe('8px')
  })

  it('names and describes the form with its title and description', () => {
    renderWithProvider(
      <Form title="Create account" description="Enter your details.">
        <Input aria-label="Name" />
      </Form>,
    )
    const form = screen.getByRole('form', { name: 'Create account' })
    expect(form).toHaveAccessibleDescription('Enter your details.')
    expect(within(form).getByRole('heading', { level: 2, name: 'Create account' })).toBeVisible()
  })

  it('keeps an element title as it is', () => {
    renderWithProvider(
      <Form title={<Heading level={1}>Sign in</Heading>}>
        <Input aria-label="Email" />
      </Form>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders no header and no form landmark name without a title', () => {
    renderWithProvider(
      <Form testID="form">
        <Input aria-label="Name" />
      </Form>,
    )
    const form = screen.getByTestId('form')
    expect(form).not.toHaveAttribute('aria-labelledby')
    expect(form).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders the footer after the fields', () => {
    renderWithProvider(
      <Form footer={<Button variant="outline">Cancel</Button>}>
        <Input aria-label="Name" />
      </Form>,
    )
    const name = screen.getByRole('textbox', { name: 'Name' })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    expect(name.compareDocumentPosition(cancel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const footer = cancel.parentElement!
    expect(getComputedStyle(footer).flexDirection).toBe('row')
    expect(getComputedStyle(footer).justifyContent).toBe('flex-end')
  })

  it('fills the width and stacks the footer actions when fullWidth', () => {
    renderWithProvider(
      <Form testID="form" fullWidth footer={<Form.Submit>Save</Form.Submit>}>
        <Input aria-label="Name" />
      </Form>,
    )
    expect(getComputedStyle(screen.getByTestId('form')).width).toBe('100%')
    const footer = screen.getByRole('button', { name: 'Save' }).parentElement!
    expect(getComputedStyle(footer).flexDirection).toBe('column')
    expect(getComputedStyle(footer).alignItems).toBe('stretch')
  })

  it('accepts style props and a theme like any view', () => {
    renderWithProvider(
      <>
        <Form testID="light" padding="$4" borderRadius="$lg" maxWidth={400} bg="$background">
          <Input aria-label="Name" />
        </Form>
        <Form testID="dark" theme="dark" bg="$background">
          <Input aria-label="Name" />
        </Form>
      </>,
    )
    const light = getComputedStyle(screen.getByTestId('light'))
    expect(light.padding).toBe('16px')
    expect(light.borderTopLeftRadius).toBe('8px')
    expect(light.maxWidth).toBe('400px')
    expect(getComputedStyle(screen.getByTestId('dark')).backgroundColor).not.toBe(
      light.backgroundColor,
    )
  })

  it('submits from Form.Submit and from Enter in a field, without a page load', async () => {
    const onSubmit = vi.fn()
    const { user } = renderWithProvider(
      <Form onSubmit={onSubmit} footer={<Form.Submit>Save</Form.Submit>}>
        <Input aria-label="Name" />
      </Form>,
    )
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toHaveAttribute('type', 'submit')
    await user.click(save)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith()
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada{Enter}')
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })

  it('leaves other buttons and controlled fields alone', async () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    function Controlled() {
      const [name, setName] = useState('')
      return (
        <Form
          onSubmit={onSubmit}
          footer={
            <Button variant="outline" onPress={onCancel}>
              Cancel
            </Button>
          }
        >
          <Input aria-label="Name" value={name} onChangeText={setName} />
          <Text>Hello {name}</Text>
        </Form>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada')
    expect(screen.getByText('Hello Ada')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not wait for or catch the Promise onSubmit returns', async () => {
    let resolve = () => {}
    const onSubmit = vi.fn(() => new Promise<void>((done) => (resolve = done)))
    const { user } = renderWithProvider(
      <Form onSubmit={onSubmit} footer={<Form.Submit>Save</Form.Submit>}>
        <Input aria-label="Name" />
      </Form>,
    )
    const save = screen.getByRole('button', { name: 'Save' })
    await user.click(save)
    // No loading state of its own: the app decides with `loading`.
    expect(save).not.toHaveAttribute('aria-busy')
    expect(save).not.toBeDisabled()
    resolve()
  })

  it('while loading, shows it on Form.Submit, announces loadingText and blocks submits', async () => {
    const onSubmit = vi.fn()
    function Saving() {
      const [loading, setLoading] = useState(false)
      return (
        <>
          <Button onPress={() => setLoading(true)}>Start</Button>
          <Form
            onSubmit={onSubmit}
            loading={loading}
            loadingText="Saving…"
            footer={<Form.Submit>Save</Form.Submit>}
          >
            <Input aria-label="Name" />
          </Form>
        </>
      )
    }
    const { user } = renderWithProvider(<Saving />)
    // The live region exists before loading, so filling it is announced.
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    await user.click(screen.getByRole('button', { name: 'Start' }))
    const save = screen.getByRole('button', { name: 'Saving…' })
    expect(save).toHaveAttribute('aria-busy', 'true')
    expect(save).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Saving…')
    // Fields stay editable; only submitting is blocked.
    const name = screen.getByRole('textbox', { name: 'Name' })
    expect(name).not.toBeDisabled()
    await user.click(save)
    await user.type(name, 'Ada{Enter}')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders no status region without loadingText', () => {
    renderWithProvider(
      <Form loading footer={<Form.Submit>Save</Form.Submit>}>
        <Input aria-label="Name" />
      </Form>,
    )
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true')
  })

  it('when disabled, disables Field controls and Form.Submit and blocks submits', async () => {
    const onSubmit = vi.fn()
    const { user } = renderWithProvider(
      <Form disabled onSubmit={onSubmit} footer={<Form.Submit>Save</Form.Submit>}>
        <Field label="Email">
          <Input />
        </Field>
      </Form>,
    )
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).toBeDisabled()
    const save = screen.getByRole('button', { name: 'Save' })
    expect(save).toBeDisabled()
    await user.click(save)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not clone or change children that are not form-aware', () => {
    renderWithProvider(
      <Form disabled>
        <Input aria-label="Plain" />
        <Button>Other</Button>
      </Form>,
    )
    expect(screen.getByRole('textbox', { name: 'Plain' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Other' })).not.toBeDisabled()
  })

  it('shares its status with custom controls through useFormStatus', async () => {
    const onSubmit = vi.fn()
    function CustomSubmit() {
      const { disabled, loading, submit } = useFormStatus()
      return (
        <Button onPress={submit} disabled={disabled || loading}>
          {loading ? 'Busy' : 'Send'}
        </Button>
      )
    }
    const { user } = renderWithProvider(
      <Form onSubmit={onSubmit}>
        <CustomSubmit />
      </Form>,
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('works as the UI layer for a form library', async () => {
    // A minimal stand-in for React Hook Form: the library owns values and
    // validation, and hands Form a submit handler.
    const onValid = vi.fn()
    function LibraryForm() {
      const [values, setValues] = useState({ email: '' })
      const [error, setError] = useState<string>()
      const handleSubmit = (valid: (data: typeof values) => void) => async () => {
        if (!values.email.includes('@')) return setError('Enter an email.')
        setError(undefined)
        valid(values)
      }
      return (
        <Form onSubmit={handleSubmit(onValid)} footer={<Form.Submit>Save</Form.Submit>}>
          <Field label="Email" error={error}>
            <Input
              value={values.email}
              onChangeText={(email) => setValues((v) => ({ ...v, email }))}
            />
          </Field>
        </Form>
      )
    }
    const { user } = renderWithProvider(<LibraryForm />)
    const save = screen.getByRole('button', { name: 'Save' })
    await user.click(save)
    expect(onValid).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.org')
    await user.click(save)
    expect(onValid).toHaveBeenCalledWith({ email: 'ada@example.org' })
  })

  it('turns off browser validation, so the app decides', () => {
    renderWithProvider(
      <Form testID="form">
        <Input aria-label="Name" />
      </Form>,
    )
    expect(screen.getByTestId('form')).toHaveAttribute('novalidate')
  })
})
