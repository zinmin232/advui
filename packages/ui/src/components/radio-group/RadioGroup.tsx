import { createContext, forwardRef, useContext, useId, useMemo } from 'react'
import {
  RadioGroup as TamaguiRadioGroup,
  type RadioGroupItemProps as TamaguiItemProps,
  type RadioGroupProps as TamaguiRadioGroupProps,
  type TamaguiElement,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { FieldContext, type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { ariaState } from '../../utils/ariaState'
import { sentences } from '../../utils/plainText'
import {
  type ChoiceText,
  ChoiceRow,
  choiceControlStyle,
  choiceProps,
  hasChoiceText,
} from '../label/ChoiceRow'

interface GroupState {
  value: string
  disabled: boolean
  /** Native: the group's name and help text, read as each item's hint. */
  hint?: string
}

const GroupContext = createContext<GroupState>({ value: '', disabled: false })

// Tamagui 3's RadioGroup parts are styled HOCs: styling them keeps their
// behavior. The gap is a prop default (see RadioGroupRoot).
const Frame = styled(TamaguiRadioGroup, {
  displayName: 'RadioGroup',
})

const Item = styled(TamaguiRadioGroup.Item, {
  displayName: 'RadioGroupItem',
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: 'full',
  borderWidth: 1,
  borderColor: 'input hover:borderStrong',
  backgroundColor: 'background',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:2px',

  variants: {
    size: {
      sm: {
        width: '4',
        height: '4',
        minHeight: '4',
        padding: 0,
      },
      md: {
        width: '5',
        height: '5',
        minHeight: '5',
        padding: 0,
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Indicator = styled(TamaguiRadioGroup.Indicator, {
  displayName: 'RadioGroupIndicator',
  width: '50%',
  height: '50%',
  borderRadius: 'full',
  backgroundColor: 'primary',
})

export type RadioGroupProps = TamaguiRadioGroupProps

export interface RadioGroupItemProps extends Omit<TamaguiItemProps, 'size'>, ChoiceText {
  size?: 'sm' | 'md'
  'aria-describedby'?: string
}

const RadioGroupItem = forwardRef<TamaguiElement, RadioGroupItemProps>(function RadioGroupItem(
  { size = 'md', label, description, id: idProp, ...props },
  ref,
) {
  const group = useContext(GroupContext)
  const generatedId = useId()
  const id = idProp ?? generatedId
  const text = { label, description }
  const withText = hasChoiceText(text)
  const disabled = group.disabled || Boolean(props.disabled)
  const item = (
    <Item
      ref={ref}
      id={id}
      size={size as never}
      // Tamagui sets `disabled` on web only, so native gets it as a state here.
      {...(isWeb ? null : { accessible: true, 'aria-disabled': ariaState(disabled) })}
      {...(group.value === props.value ? { borderColor: 'primary' as const } : null)}
      {...(withText && choiceControlStyle(size))}
      {...props}
      {...choiceProps(id, text, props, group.hint)}
    >
      <Indicator />
    </Item>
  )
  if (!withText) return item
  return (
    <ChoiceRow id={id} {...text} disabled={disabled}>
      {item}
    </ChoiceRow>
  )
})

const RadioGroupRoot = forwardRef<TamaguiElement, RadioGroupProps>(
  function RadioGroup(groupProps, ref) {
    const field = useContext(FieldContext)
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      invalid,
      gap = '3',
      ...props
    } = useFieldControl<RadioGroupProps & FieldControlProps>(groupProps)
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    })
    const disabled = Boolean(props.disabled)
    const groupLabel = props['aria-label']
    const groupHint = props.accessibilityHint
    const state = useMemo<GroupState>(
      () => ({
        value,
        disabled,
        // Native has no group names: VoiceOver and TalkBack skip a view that is
        // not an element, and a Field hides its label once it names the control.
        hint: isWeb ? undefined : sentences(groupLabel, groupHint),
      }),
      [value, disabled, groupLabel, groupHint],
    )
    return (
      <GroupContext.Provider value={state}>
        <Frame
          ref={ref}
          value={value}
          onValueChange={setValue}
          gap={gap}
          aria-invalid={invalid || undefined}
          // A <label for> cannot name a group, so a Field's label is linked by id.
          {...(isWeb &&
            field?.labelId &&
            props['aria-label'] === undefined && { 'aria-labelledby': field.labelId })}
          {...props}
        />
      </GroupContext.Provider>
    )
  },
)

/**
 * A set of mutually exclusive options. Arrow keys move between items (roving
 * focus) on web. Each `RadioGroup.Item` needs a `value`, and a `label` or an
 * `aria-label` (or an `id` for your own Label).
 */
export const RadioGroup = withStaticProperties(RadioGroupRoot, {
  Item: RadioGroupItem,
})
