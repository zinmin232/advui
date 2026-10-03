import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { Button } from '../button/Button'
import { Checkbox } from '../checkbox/Checkbox'
import { Form } from '../form/Form'
import { Input } from '../input/Input'
import { HStack } from '../layout/Stack'
import { PasswordInput } from '../password-input/PasswordInput'
import { RadioGroup } from '../radio-group/RadioGroup'
import { Select } from '../select/Select'
import { Switch } from '../switch/Switch'
import { Textarea } from '../textarea/Textarea'
import { TimePicker } from '../time-picker/TimePicker'
import { Text } from '../typography/Text'
import { Field, FormField } from './Field'

describe('Field', () => {
  it('labels the control and describes it with help text', () => {
    renderWithProvider(
      <Field label="Username" description="3–20 letters.">
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Username' })
    expect(input).toHaveAccessibleDescription('3–20 letters.')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-required')
  })

  it('marks the control invalid and required, error first', () => {
    renderWithProvider(
      <Field label="Email" description="Work email." error="Enter an email." required>
        <Input id="email" />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    // The child's own id is kept, and the label targets it.
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAccessibleDescription('Enter an email. Work email.')
    expect(screen.getByText('Enter an email.')).toBeVisible()
  })

  it('gives its id to the control', () => {
    renderWithProvider(
      <Field id="email" label="Email">
        <Input />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('id', 'email')
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'email')
  })

  it.each([undefined, null, false, ''])('treats error=%j as no error', (error) => {
    renderWithProvider(
      <Field label="Email" error={error}>
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it("keeps the control's own invalid when the error is shown elsewhere", () => {
    renderWithProvider(
      <Field label="Confirm password">
        <Input invalid />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Confirm password' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('adds "(optional)" to the label, unless the field is required', () => {
    const { unmount } = renderWithProvider(
      <Field label="Nickname" optional>
        <Input />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Nickname (optional)' })).toBeInTheDocument()
    unmount()

    renderWithProvider(
      <Field label="Email" required optional>
        <Input />
      </Field>,
    )
    // The asterisk is hidden from screen readers; aria-required says it instead.
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-required', 'true')
    expect(screen.queryByText('(optional)')).toBeNull()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('disables the control', () => {
    renderWithProvider(
      <Field label="Notes" disabled>
        <Textarea />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled()
  })

  it('takes elements as label, help and error', () => {
    renderWithProvider(
      <Field
        label={
          <>
            API <Text weight="bold">key</Text>
          </>
        }
        description={<Text>Starts with sk_.</Text>}
        error={
          <>
            Revoked. <Text weight="semibold">Create a new one.</Text>
          </>
        }
      >
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'API key' })
    expect(input).toHaveAccessibleDescription('Revoked. Create a new one. Starts with sk_.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('wires a control inside a layout and leaves the other children alone', () => {
    renderWithProvider(
      <Field label="Invite code" description="From your email." error="Expired." disabled>
        <HStack>
          <Input />
          <Button>Send code</Button>
        </HStack>
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Invite code' })
    expect(input).toHaveAccessibleDescription('Expired. From your email.')
    expect(input).toBeDisabled()
    const button = screen.getByRole('button', { name: 'Send code' })
    expect(button).not.toHaveAttribute('aria-describedby')
    expect(button).not.toBeDisabled()
  })

  it.each([
    ['checkbox', <Checkbox key="c" />],
    ['switch', <Switch key="s" />],
  ] as const)('wires a %s', (role, control) => {
    renderWithProvider(
      <Field label="Accept" description="Required to continue." error="Please accept." required>
        {control}
      </Field>,
    )
    const box = screen.getByRole(role, { name: 'Accept' })
    expect(box).toHaveAccessibleDescription('Please accept. Required to continue.')
    expect(box).toHaveAttribute('aria-invalid', 'true')
    expect(box).toHaveAttribute('aria-required', 'true')
  })

  it('labels and describes a Select', async () => {
    renderWithProvider(
      <Field label="Plan" description="Change it any time." error="Pick a plan." required>
        <Select>
          <Select.Item value="free">Free</Select.Item>
        </Select>
      </Field>,
    )
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Plan' })).toBeEnabled())
    const select = screen.getByRole('combobox', { name: 'Plan' })
    expect(select).toHaveAccessibleDescription('Pick a plan. Change it any time.')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAttribute('aria-required', 'true')
  })

  it('names a radio group with its label', () => {
    renderWithProvider(
      <Field label="Plan" error="Pick a plan.">
        <RadioGroup>
          <RadioGroup.Item value="free" aria-label="Free" />
          <RadioGroup.Item value="team" aria-label="Team" />
        </RadioGroup>
      </Field>,
    )
    const group = screen.getByRole('radiogroup', { name: 'Plan' })
    expect(group).toHaveAccessibleDescription('Pick a plan.')
    expect(group).toHaveAttribute('aria-invalid', 'true')
  })

  it('links each text once when a control passes the props on (Password Input)', () => {
    renderWithProvider(
      <Field id="pw" label="Password" description="8 or more." error="Too short.">
        <PasswordInput />
      </Field>,
    )
    const input = screen.getByLabelText('Password', { selector: 'input' })
    expect(input).toHaveAttribute('aria-describedby', 'pw-error pw-description')
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-controls',
      'pw',
    )
  })

  it('gives its id to one control only when a control holds several (Time Picker)', () => {
    const { container } = renderWithProvider(
      <Field id="start" label="Start" required>
        <TimePicker />
      </Field>,
    )
    expect(container.querySelectorAll('#start')).toHaveLength(1)
    expect(screen.getByRole('group')).toHaveAttribute('aria-required', 'true')
  })

  it('wires custom controls through useFieldControl', () => {
    function CustomInput(props: FieldControlProps) {
      const { invalid, disabled, ...rest } = useFieldControl(props)
      return <input {...rest} aria-invalid={invalid || undefined} disabled={disabled} />
    }
    renderWithProvider(
      <Field label="Code" description="Six digits." error="Wrong code." required disabled>
        <CustomInput />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Code' })
    expect(input).toHaveAccessibleDescription('Wrong code. Six digits.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toBeDisabled()
  })

  it('leaves controls outside a field unchanged', () => {
    renderWithProvider(<Input aria-label="Plain" />)
    const input = screen.getByRole('textbox', { name: 'Plain' })
    expect(input).not.toHaveAttribute('id')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('stacks the label, control and messages, with a token gap and full width', () => {
    renderWithProvider(
      <Field testID="field" label="Email" gap="$4" fullWidth padding="$2">
        <Input />
      </Field>,
    )
    const style = getComputedStyle(screen.getByTestId('field'))
    expect(style.flexDirection).toBe('column')
    expect(style.gap).toBe('16px')
    expect(style.width).toBe('100%')
    expect(style.padding).toBe('8px')
  })

  it('puts the label beside the control when horizontal, with the messages under the control', () => {
    renderWithProvider(
      <Field label="Username" description="Shown on your profile." orientation="horizontal">
        <Input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Username' })
    expect(input).toHaveAccessibleDescription('Shown on your profile.')
    const labelColumn = screen.getByText('Username').closest('label')!.parentElement!
    const row = labelColumn.parentElement!
    expect(getComputedStyle(row).flexDirection).toBe('row')
    expect(getComputedStyle(labelColumn).width).toBe('33%')
    expect(row.contains(input)).toBe(true)
    // The help text sits in a second row, in the control's column.
    const description = screen.getByText('Shown on your profile.')
    expect(row.contains(description)).toBe(false)
    expect(getComputedStyle(description.parentElement!.parentElement!).flexDirection).toBe('row')
  })

  it('follows a disabled Form and shows the state the app passes in', async () => {
    function Signup() {
      const [email, setEmail] = useState('')
      const error = email.includes('@') ? undefined : 'Enter an email.'
      return (
        <Form>
          <Field label="Email" required error={error}>
            <Input value={email} onChangeText={setEmail} />
          </Field>
          <Field label="Name">
            <Input />
          </Field>
        </Form>
      )
    }
    const { user, unmount } = renderWithProvider(<Signup />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).toHaveAttribute('aria-invalid', 'true')
    await user.type(email, 'ada@example.org')
    expect(email).toHaveValue('ada@example.org')
    expect(email).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Enter an email.')).toBeNull()
    unmount()

    renderWithProvider(
      <Form disabled>
        <Field label="Name">
          <Input />
        </Field>
      </Form>,
    )
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled()
  })

  it('keeps FormField as an alias', () => {
    expect(FormField).toBe(Field)
  })
})
