import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useContext,
  useMemo,
} from 'react'
import {
  Adapt,
  type GetProps,
  Select as TamaguiSelect,
  Sheet,
  Text,
  View,
  isWeb,
  styled,
  useDidFinishSSR,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { FieldContext, useFieldControl, type ControlStateProps } from '../../hooks/useFieldControl'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
import { useSheetMaxHeight } from '../../hooks/useSheetMaxHeight'
import { SheetHandle } from '../sheet/SheetHandle'
import { ariaState } from '../../utils/ariaState'
import { plainText } from '../../utils/plainText'
import { transformOpacity } from '../../utils/transition'
import { fieldBoxStyle } from '../input/Input'

const Trigger = styled(TamaguiSelect.Trigger, {
  displayName: 'SelectTrigger',
  ...fieldBoxStyle,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
  cursor: 'pointer',
  // The size variants set the height.
  minHeight: 0,
  paddingVertical: 0,
  variants: {
    size: {
      sm: {
        height: '8',
        paddingHorizontal: '2-5',
      },
      md: {
        height: '10',
        paddingHorizontal: '3',
      },
      lg: {
        height: '12',
        paddingHorizontal: '4',
      },
    },
    invalid: {
      true: {
        borderColor: 'error hover:error',
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: isWeb ? 'none' : 'auto' },
    },
  } as const,
})

const ValueText = styled(TamaguiSelect.Value, {
  displayName: 'SelectValue',
  fontFamily: 'body',
  fontSize: '2',
  color: 'foreground',
  numberOfLines: 1,
  flexShrink: 1,
})

// The dropdown panel. On native Select is always a sheet, and Tamagui 3 keeps
// the viewport's styles there (web drops them when adapted), which drew this
// panel's border and shadow as a box inside the sheet.
const Viewport = styled(TamaguiSelect.Viewport, {
  displayName: 'SelectViewport',
  ...(isWeb && {
    backgroundColor: 'popover',
    borderWidth: 1,
    borderColor: 'border',
    borderRadius: 'lg',
    padding: '1',
    minWidth: '48',
    ...shadows.md,
  }),
})

const ItemFrame = styled(TamaguiSelect.Item, {
  displayName: 'SelectItem',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
  minHeight: '9 touchable:11',
  paddingHorizontal: '2-5',
  borderRadius: 'md',
  cursor: 'pointer',
  backgroundColor: 'hover:accent press:accentHover focus:accent',
  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: isWeb ? 'none' : 'auto' },
    },
  } as const,
})

const ItemText = styled(TamaguiSelect.ItemText, {
  displayName: 'SelectItemText',
  fontFamily: 'body',
  fontSize: '2',
  color: 'popoverForeground',
})

const GroupLabel = styled(TamaguiSelect.Label, {
  displayName: 'SelectLabel',
  paddingHorizontal: '2-5',
  paddingVertical: '1-5',
  fontFamily: 'body',
  fontSize: '1',
  fontWeight: '600',
  color: 'mutedForeground',
})

export interface SelectItemProps
  extends
    Omit<GetProps<typeof ItemFrame>, 'value' | 'disabled'>,
    Pick<ControlStateProps, 'disabled'> {
  value: string
  children: ReactNode
}

// Native screen readers activate a view through an action, not a touch.
type ActionEvent = { nativeEvent: { actionName: string } }

interface SelectItemInternalProps extends SelectItemProps {
  /** Set by Select: picks this item when a screen reader activates it (native). */
  pick?: () => void
}

function SelectItem({
  value,
  children,
  onPressIn,
  onPressOut,
  pick,
  ...props
}: SelectItemInternalProps) {
  const ripple = useRipple({
    color: 'popoverForeground',
    radius: { borderRadius: 'md', ...props },
    disabled: props.disabled ?? false,
    onPressIn,
    onPressOut,
  })
  return (
    <ItemFrame
      value={value}
      {...(ripple.active && { backgroundColor: 'press:transparent' })}
      // Native: Tamagui's item reacts to touches only, so TalkBack could not
      // reach or pick it. The sheet renders in a portal without our context,
      // so Select hands each item its own `pick`.
      {...(!isWeb && {
        accessible: true,
        // Tamagui 3 makes native items buttons; `role` wins on Android, so
        // screen readers still hear options in a list.
        role: 'option' as const,
        accessibilityActions: [{ name: 'activate' }],
        onAccessibilityAction: (event: ActionEvent) => {
          if (!props.disabled && event.nativeEvent.actionName === 'activate') pick?.()
        },
      })}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <ItemText>{children}</ItemText>
      <TamaguiSelect.ItemIndicator>
        <CheckIcon size={16} color="primary" />
      </TamaguiSelect.ItemIndicator>
    </ItemFrame>
  )
}

export interface SelectGroupProps {
  label?: string
  children: ReactNode
}

function SelectGroup({ label, children }: SelectGroupProps) {
  return (
    <TamaguiSelect.Group>
      {label ? <GroupLabel>{label}</GroupLabel> : null}
      {children}
    </TamaguiSelect.Group>
  )
}

/**
 * Gives each item, inside groups too, its `pick`. Tamagui 3 tracks the item
 * order for keyboard navigation itself.
 */
function indexItems(children: ReactNode, pick: (value: string) => void) {
  const walk = (nodes: ReactNode): ReactNode =>
    Children.map(nodes, (child) => {
      if (!isValidElement(child)) return child
      const element = child as ReactElement<SelectItemInternalProps>
      if (element.type === SelectItem) {
        const { value } = element.props
        return cloneElement(element, { pick: () => pick(value) })
      }
      if (element.type === SelectGroup || element.type === Fragment) {
        return cloneElement(element, { children: walk(element.props.children) })
      }
      return child
    })
  return walk(children)
}

/** Finds the label of the item whose value matches (used before hydration). */
function findLabel(children: ReactNode, value: string | undefined): ReactNode {
  let found: ReactNode = null
  const walk = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      if (found !== null || !isValidElement(child)) return
      const element = child as ReactElement<{ value?: string; children?: ReactNode }>
      if (element.type === SelectItem && element.props.value === value)
        found = element.props.children
      else if (element.type === SelectGroup || element.type === Fragment)
        walk(element.props.children)
    })
  if (value !== undefined) walk(children)
  return found
}

// Server-render stand-in with identical box styles. Tamagui's Select trigger
// renders different inline styles during SSR and hydration, so we mount the
// interactive Select only after hydration.
const StaticTrigger = styled(View, {
  displayName: 'SelectTrigger',
  ...fieldBoxStyle,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2',
  variants: {
    size: {
      sm: {
        height: '8',
        paddingHorizontal: '2-5',
      },
      md: {
        height: '10',
        paddingHorizontal: '3',
      },
      lg: {
        height: '12',
        paddingHorizontal: '4',
      },
    },
  } as const,
})

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** Links to `<Label htmlFor>`. */
  id?: string
  /** Accessible name when there is no visible label. */
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  /** Read after the name on native (a Field puts its help and error text here). */
  accessibilityHint?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  /** Trigger width. Defaults to 100%. */
  width?: GetProps<typeof Trigger>['width']
  children: ReactNode
}

function SelectRoot(selectProps: SelectProps) {
  const {
    placeholder = 'Select…',
    size = 'md',
    disabled,
    invalid,
    width = '100%',
    children,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    'aria-required': required,
    accessibilityHint,
    open: openProp,
    onOpenChange,
    value: valueProp,
    defaultValue,
    onValueChange,
    ...props
  } = useFieldControl(selectProps)
  const field = useContext(FieldContext)
  const reducedMotion = useReducedMotion()
  const sheetMaxHeight = useSheetMaxHeight()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  })
  // Held here as well as in Tamagui's Select, so the trigger can tell native
  // screen readers the chosen option. Tamagui's empty value is ''.
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })
  // Android: the back button closes the list instead of leaving the screen.
  useBackToClose(open, () => setOpen(false))
  const hydrated = useDidFinishSSR()
  const items = useMemo(
    () =>
      indexItems(children, (next) => {
        setValue(next)
        setOpen(false)
      }),
    [children, setValue, setOpen],
  )

  if (!hydrated) {
    const label = findLabel(children, value)
    return (
      <StaticTrigger
        size={size}
        width={width}
        role="combobox"
        aria-expanded={false}
        aria-label={ariaLabel}
        // A `<label for>` names the hydrated trigger (a button) but not this
        // div, so until hydration a Field's label names it by id.
        aria-labelledby={ariaLabel ? undefined : field?.labelId}
        aria-describedby={describedBy}
        aria-required={required}
        id={id}
        opacity={disabled ? 0.5 : 1}
        {...(invalid ? { borderColor: 'error' as const } : null)}
      >
        <Text
          fontFamily="body"
          fontSize="2"
          color={label ? 'foreground' : 'placeholder-color'}
          numberOfLines={1}
        >
          {label ?? placeholder}
        </Text>
        <ChevronDownIcon size={16} color="mutedForeground" />
      </StaticTrigger>
    )
  }

  return (
    <TamaguiSelect
      id={id}
      zIndex={zIndex.popover}
      disablePreventBodyScroll
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={setValue}
      {...props}
    >
      <Trigger
        size={size}
        width={width}
        disabled={disabled}
        invalid={invalid}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-required={required}
        // Native only: on web it reaches the button, and React warns even when undefined.
        {...(!isWeb && {
          accessibilityHint,
          // Tamagui's trigger reacts to touches only, so TalkBack could not
          // reach or open it. A named view's text is not read either, so the
          // chosen option is its value.
          accessible: true,
          accessibilityValue: {
            text: plainText(findLabel(children, value)) || placeholder,
          },
          'aria-disabled': ariaState(disabled),
          accessibilityActions: [{ name: 'activate' }],
          onAccessibilityAction: (event: ActionEvent) => {
            if (!disabled && event.nativeEvent.actionName === 'activate') setOpen(!open)
          },
        })}
      >
        <ValueText placeholder={placeholder} />
        {/* Tamagui 3's trigger is a plain View (no ListItem `iconAfter`). */}
        <ChevronDownIcon size={16} color="mutedForeground" />
      </Trigger>

      {/* Touch devices get a native-feeling bottom sheet instead of a dropdown. */}
      <Adapt when={isWeb ? 'max-md' : true} platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
          transition={reducedMotion ? undefined : 'medium'}
        >
          <Sheet.Overlay
            backgroundColor="overlay"
            opacity="enter:0 exit:0"
            transition={transformOpacity(reducedMotion ? undefined : 'quick')}
          />
          <SheetHandle />
          <Sheet.Container
            paddingTop="2"
            paddingRight="2"
            paddingLeft="2"
            paddingBottom="6"
            maxHeight={sheetMaxHeight}
          >
            <Sheet.Background
              backgroundColor="popover"
              borderTopLeftRadius="dialog"
              borderTopRightRadius="dialog"
            />
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Container>
        </Sheet>
      </Adapt>

      <TamaguiSelect.Content>
        <TamaguiSelect.ScrollUpButton alignItems="center" justifyContent="center" height="6">
          <ChevronUpIcon size={16} />
        </TamaguiSelect.ScrollUpButton>
        <Viewport>{items}</Viewport>
        <TamaguiSelect.ScrollDownButton alignItems="center" justifyContent="center" height="6">
          <ChevronDownIcon size={16} />
        </TamaguiSelect.ScrollDownButton>
      </TamaguiSelect.Content>
    </TamaguiSelect>
  )
}

/**
 * Pick one option from a list. Dropdown with typeahead + arrow-key navigation
 * on desktop web; a bottom sheet on touch devices and iOS/Android.
 */
export const Select = withStaticProperties(SelectRoot, {
  // `pick` is set by Select, not by apps.
  Item: SelectItem as (props: SelectItemProps) => ReactElement,
  Group: SelectGroup,
  Separator: styled(View, {
    displayName: 'SelectSeparator',
    height: 1,
    backgroundColor: 'border',
    marginVertical: '1',
  }),
  Text,
})
