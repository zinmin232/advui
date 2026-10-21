import { createContext, forwardRef, useContext, useId, useMemo } from 'react'
import {
  RadioGroupFrame as TamaguiRadioGroupFrame,
  RadioGroupIndicatorFrame as TamaguiIndicatorFrame,
  RadioGroupItemFrame as TamaguiItemFrame,
  type RadioGroupItemProps as TamaguiItemProps,
  type RadioGroupProps as TamaguiRadioGroupProps,
  type TamaguiElement,
  createRadioGroup,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
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

// createRadioGroup renders Tamagui's own frame, so styles set here are dropped;
// the gap is a prop default instead (see RadioGroupRoot).
const Frame = styled(TamaguiRadioGroupFrame, {
  name: 'RadioGroup',
})

// Visual styles live in the `unstyled: false` variant so they override the
// defaults Tamagui's createRadioGroup applies through the same variant.
const Item = styled(TamaguiItemFrame, {
  name: 'RadioGroupItem',
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',

  variants: {
    unstyled: {
      false: {
        borderRadius: "full",
        borderWidth: 1,
        borderColor: "input hover:borderStrong",
        backgroundColor: "background",
        outlineColor: "focus-visible:ring",
        outlineStyle: "focus-visible:solid",
        outlineWidth: "focus-visible:2px",
        outlineOffset: "focus-visible:2px"
      },
    },
    size: {
      sm: {
        width: "4",
        height: "4",
        minHeight: "4",
        padding: 0
      },
      md: {
        width: "5",
        height: "5",
        minHeight: "5",
        padding: 0
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Indicator = styled(TamaguiIndicatorFrame, {
  name: 'RadioGroupIndicator',
  variants: {
    unstyled: {
      false: {
        width: '50%',
        height: '50%',
        borderRadius: "full",
        backgroundColor: "primary"
      },
    },
  } as const,
})

const BaseRadioGroup = createRadioGroup({ Frame, Item, Indicator, disableActiveTheme: true })

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
    <BaseRadioGroup.Item
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
      <BaseRadioGroup.Indicator />
    </BaseRadioGroup.Item>
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
        <BaseRadioGroup
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
