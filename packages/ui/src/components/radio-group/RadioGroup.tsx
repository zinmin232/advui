import { createContext, forwardRef, useContext } from 'react'
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

const SelectedValueContext = createContext<string | undefined>(undefined)

const Frame = styled(TamaguiRadioGroupFrame, {
  name: 'RadioGroup',
  gap: '$3',
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
        borderRadius: '$full',
        borderWidth: 1,
        borderColor: '$input',
        backgroundColor: '$background',
        hoverStyle: { borderColor: '$borderStrong' },
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      },
    },
    size: {
      sm: { width: '$4', height: '$4', minHeight: '$4', padding: 0 },
      md: { width: '$5', height: '$5', minHeight: '$5', padding: 0 },
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
        borderRadius: '$full',
        backgroundColor: '$primary',
      },
    },
  } as const,
})

const BaseRadioGroup = createRadioGroup({ Frame, Item, Indicator, disableActiveTheme: true })

export type RadioGroupProps = TamaguiRadioGroupProps

export interface RadioGroupItemProps extends Omit<TamaguiItemProps, 'size'> {
  size?: 'sm' | 'md'
}

const RadioGroupItem = forwardRef<TamaguiElement, RadioGroupItemProps>(function RadioGroupItem(
  { size = 'md', ...props },
  ref,
) {
  const checked = useContext(SelectedValueContext) === props.value
  return (
    <BaseRadioGroup.Item
      ref={ref}
      size={size as never}
      {...(isWeb ? null : { accessible: true })}
      {...(checked ? { borderColor: '$primary' as const } : null)}
      {...props}
    >
      <BaseRadioGroup.Indicator />
    </BaseRadioGroup.Item>
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
      ...props
    } = useFieldControl<RadioGroupProps & FieldControlProps>(groupProps)
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    })
    return (
      <SelectedValueContext.Provider value={value}>
        <BaseRadioGroup
          ref={ref}
          value={value}
          onValueChange={setValue}
          aria-invalid={invalid || undefined}
          // A <label for> cannot name a group, so a Field's label is linked by id.
          {...(isWeb &&
            field?.labelId &&
            props['aria-label'] === undefined && { 'aria-labelledby': field.labelId })}
          {...props}
        />
      </SelectedValueContext.Provider>
    )
  },
)

/**
 * A set of mutually exclusive options. Arrow keys move between items (roving
 * focus) on web; each `RadioGroup.Item` needs a `value` and an `id` for its Label.
 */
export const RadioGroup = withStaticProperties(RadioGroupRoot, {
  Item: RadioGroupItem,
})
