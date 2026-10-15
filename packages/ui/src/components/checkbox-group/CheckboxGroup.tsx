import {
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { FieldContext, type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { sentences } from '../../utils/plainText'
import { Checkbox, type CheckboxProps, type CheckedState } from '../checkbox/Checkbox'
import {
  type ChoiceText,
  ChoiceRow,
  choiceControlStyle,
  choiceProps,
  hasChoiceText,
} from '../label/ChoiceRow'

export type CheckboxGroupOrientation = 'vertical' | 'horizontal'

type ItemEntry = { value: string; disabled: boolean; id: string }

interface GroupState {
  value: string[]
  setValue: (next: string[]) => void
  /** Every Item, in the order they mounted, so Select All knows what "all" is. */
  items: ReadonlyMap<string, ItemEntry>
  register: (key: string, entry: ItemEntry) => void
  unregister: (key: string) => void
  size: 'sm' | 'md'
  disabled: boolean
  invalid: boolean
  name?: string
  /** Native: the group's name and help text, read as each item's hint. */
  hint?: string
}

const GroupContext = createContext<GroupState | null>(null)

function useGroup(part: string) {
  const group = useContext(GroupContext)
  if (!group) throw new Error(`CheckboxGroup.${part} must be rendered inside <CheckboxGroup>.`)
  return group
}

const CheckboxGroupFrame = styled(View, {
  name: 'CheckboxGroup',
  role: 'group',

  variants: {
    orientation: {
      vertical: { flexDirection: 'column' },
      horizontal: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
    },
  } as const,

  defaultVariants: { orientation: 'vertical' },
})

type FrameProps = GetProps<typeof CheckboxGroupFrame>

export interface CheckboxGroupProps
  extends Omit<FrameProps, 'children' | 'defaultValue' | 'orientation' | 'id'>, FieldControlProps {
  /** The checked items' values, when you control it. */
  value?: string[]
  /** Starting `value` when uncontrolled. */
  defaultValue?: string[]
  /** Called with the new list when an item, or Select All, is toggled. */
  onValueChange?: (value: string[]) => void
  /** `horizontal` lays the items out in a row that wraps. */
  orientation?: CheckboxGroupOrientation
  /** Checkbox size for every item. */
  size?: 'sm' | 'md'
  /** Disables every item. */
  disabled?: boolean
  /** Error styling and `aria-invalid` on every item. */
  invalid?: boolean
  /** Web: the field name each checked item submits its value under. */
  name?: string
  children?: ReactNode
}

const CheckboxGroupRoot = forwardRef<TamaguiElement, CheckboxGroupProps>(
  function CheckboxGroup(groupProps, ref) {
    const field = useContext(FieldContext)
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      orientation = 'vertical',
      size = 'md',
      disabled = false,
      invalid = false,
      name,
      gap,
      children,
      // aria-required is not allowed on a group. The Field's label still shows
      // the marker; say what is required in the help or error text.
      'aria-required': _ariaRequired,
      accessibilityHint,
      ...props
    } = useFieldControl(groupProps)
    const [value, setValue] = useControllableState<string[]>({
      value: valueProp,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
    })
    const [items, setItems] = useState<ReadonlyMap<string, ItemEntry>>(() => new Map())
    // Setting an existing key keeps its place, so items stay in mount order.
    const register = useCallback(
      (key: string, entry: ItemEntry) => setItems((prev) => new Map(prev).set(key, entry)),
      [],
    )
    const unregister = useCallback(
      (key: string) =>
        setItems((prev) => {
          const next = new Map(prev)
          next.delete(key)
          return next
        }),
      [],
    )
    const groupLabel = props['aria-label']
    const state = useMemo<GroupState>(
      () => ({
        value,
        setValue,
        items,
        register,
        unregister,
        size,
        disabled,
        invalid,
        name,
        // Native has no group names: VoiceOver and TalkBack skip a view that is
        // not an element, and a Field hides its label once it names the control.
        hint: isWeb ? undefined : sentences(groupLabel, accessibilityHint),
      }),
      [
        value,
        setValue,
        items,
        register,
        unregister,
        size,
        disabled,
        invalid,
        name,
        groupLabel,
        accessibilityHint,
      ],
    )

    return (
      <GroupContext.Provider value={state}>
        <CheckboxGroupFrame
          ref={ref}
          orientation={orientation}
          // A row keeps items further apart than the lines it wraps onto.
          {...(gap !== undefined
            ? { gap }
            : orientation === 'horizontal'
              ? { columnGap: '$5', rowGap: '$3' }
              : { gap: '$3' })}
          // A <label for> cannot name a group, so a Field's label is linked by id.
          {...(isWeb &&
            field?.labelId &&
            props['aria-label'] === undefined &&
            props['aria-labelledby'] === undefined && { 'aria-labelledby': field.labelId })}
          {...props}
        >
          {/* The field's id and texts are on this group; its checkboxes get their own. */}
          <FieldContext.Provider value={null}>{children}</FieldContext.Provider>
        </CheckboxGroupFrame>
      </GroupContext.Provider>
    )
  },
)

interface ChoiceProps extends Omit<CheckboxProps, 'invalid' | 'size'>, ChoiceText {
  id: string
  'aria-describedby'?: string
  size?: 'sm' | 'md'
  // Not `group`: Tamagui views take a `group` prop of their own.
  groupState: GroupState
}

// A checkbox of the group, with its label and description beside it when given.
const Choice = forwardRef<TamaguiElement, ChoiceProps>(function Choice(
  { id, size, label, description, groupState: group, disabled: disabledProp, ...props },
  ref,
) {
  const checkboxSize = size ?? group.size
  const disabled = group.disabled || Boolean(disabledProp)
  const text = { label, description }
  const withText = hasChoiceText(text)
  const checkbox = (
    <Checkbox
      ref={ref}
      id={id}
      size={checkboxSize}
      disabled={disabled}
      invalid={group.invalid}
      {...(withText && choiceControlStyle(checkboxSize))}
      {...props}
      {...choiceProps(id, text, props, group.hint)}
    />
  )
  if (!withText) return checkbox
  return (
    <ChoiceRow id={id} {...text} disabled={disabled}>
      {checkbox}
    </ChoiceRow>
  )
})

type ChoiceOwnProps = Omit<
  CheckboxProps,
  'checked' | 'defaultChecked' | 'onCheckedChange' | 'invalid' | 'name' | 'value'
> & { 'aria-describedby'?: string }

export interface CheckboxGroupItemProps extends ChoiceOwnProps {
  /** Added to the group's value while checked. */
  value: string
  /** Text beside the checkbox. Pressing it toggles the checkbox. */
  label?: ReactNode
  /** Smaller text under the label. */
  description?: ReactNode
}

const CheckboxGroupItem = forwardRef<TamaguiElement, CheckboxGroupItemProps>(
  function CheckboxGroupItem({ value, id: idProp, disabled = false, ...props }, ref) {
    const group = useGroup('Item')
    const key = useId()
    const id = idProp ?? key
    const off = group.disabled || disabled
    const { register, unregister } = group
    useLayoutEffect(() => {
      register(key, { value, disabled: off, id })
    }, [register, key, value, off, id])
    useLayoutEffect(() => () => unregister(key), [unregister, key])

    const checked = group.value.includes(value)
    return (
      <Choice
        ref={ref}
        {...props}
        id={id}
        groupState={group}
        disabled={disabled}
        name={group.name}
        value={value}
        checked={checked}
        onCheckedChange={(next) =>
          group.setValue(
            next === true
              ? [...group.value.filter((v) => v !== value), value]
              : group.value.filter((v) => v !== value),
          )
        }
      />
    )
  },
)

export interface CheckboxGroupSelectAllProps extends ChoiceOwnProps {
  /** Text beside the checkbox, such as "All notifications". */
  label?: ReactNode
  /** Smaller text under the label. */
  description?: ReactNode
}

const CheckboxGroupSelectAll = forwardRef<TamaguiElement, CheckboxGroupSelectAllProps>(
  function CheckboxGroupSelectAll({ id: idProp, disabled = false, ...props }, ref) {
    const group = useGroup('SelectAll')
    const generatedId = useId()
    const items = [...group.items.values()]
    const enabled = items.filter((item) => !item.disabled).map((item) => item.value)
    const checkedCount = items.filter((item) => group.value.includes(item.value)).length
    const checked: CheckedState =
      checkedCount === 0 ? false : checkedCount === items.length ? true : 'indeterminate'

    // Disabled items keep their state: "all" means every item that can change.
    const toggleAll = () => {
      const allOn = enabled.every((v) => group.value.includes(v))
      group.setValue(
        allOn
          ? group.value.filter((v) => !enabled.includes(v))
          : [...group.value, ...enabled.filter((v) => !group.value.includes(v))],
      )
    }

    return (
      <Choice
        ref={ref}
        {...(isWeb && items.length > 0 && { 'aria-controls': items.map((i) => i.id).join(' ') })}
        {...props}
        id={idProp ?? generatedId}
        groupState={group}
        // Items register after the first render, so an empty list is not "none enabled".
        disabled={disabled || (items.length > 0 && enabled.length === 0)}
        checked={checked}
        onCheckedChange={toggleAll}
      />
    )
  },
)

/**
 * A set of checkboxes that share one value: the list of checked items. Inside a
 * Field it takes the field's label as its name. `CheckboxGroup.SelectAll` checks
 * or clears every item and shows a mixed state when only some are checked.
 */
export const CheckboxGroup = withStaticProperties(CheckboxGroupRoot, {
  Item: CheckboxGroupItem,
  SelectAll: CheckboxGroupSelectAll,
})
