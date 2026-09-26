import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@adv-ui/icons'
import { shadows, zIndex } from '@adv-ui/theme'
import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
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
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { fieldBoxStyle } from '../input/Input'

const Trigger = styled(TamaguiSelect.Trigger, {
  name: 'SelectTrigger',
  unstyled: true,
  ...fieldBoxStyle,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  cursor: 'pointer',

  variants: {
    size: {
      sm: { height: '$8', paddingHorizontal: '$2.5' },
      md: { height: '$10', paddingHorizontal: '$3' },
      lg: { height: '$12', paddingHorizontal: '$4' },
    },
    invalid: {
      true: { borderColor: '$error', hoverStyle: { borderColor: '$error' } },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,
})

const ValueText = styled(TamaguiSelect.Value, {
  name: 'SelectValue',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$foreground',
  numberOfLines: 1,
  flexShrink: 1,
})

const Viewport = styled(TamaguiSelect.Viewport, {
  name: 'SelectViewport',
  unstyled: true,
  backgroundColor: '$popover',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$lg',
  padding: '$1',
  minWidth: '$48',
  ...shadows.md,
})

const ItemFrame = styled(TamaguiSelect.Item, {
  name: 'SelectItem',
  unstyled: true,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  minHeight: '$9',
  paddingHorizontal: '$2.5',
  borderRadius: '$md',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  focusStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  $touchable: { minHeight: '$11' },

  variants: {
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none' },
    },
  } as const,
})

const ItemText = styled(TamaguiSelect.ItemText, {
  name: 'SelectItemText',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$popoverForeground',
})

const GroupLabel = styled(TamaguiSelect.Label, {
  name: 'SelectLabel',
  unstyled: true,
  paddingHorizontal: '$2.5',
  paddingVertical: '$1.5',
  fontFamily: '$body',
  fontSize: '$1',
  fontWeight: '600',
  color: '$mutedForeground',
})

export interface SelectItemProps extends Omit<GetProps<typeof ItemFrame>, 'index' | 'value'> {
  value: string
  children: ReactNode
  /** Set automatically from the item order. */
  index?: number
}

function SelectItem({ value, children, index = 0, ...props }: SelectItemProps) {
  return (
    <ItemFrame value={value} index={index} {...props}>
      <ItemText>{children}</ItemText>
      <TamaguiSelect.ItemIndicator>
        <CheckIcon size={16} color="$primary" />
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

/** Assigns sequential `index` props (required for keyboard navigation) across groups. */
function indexItems(children: ReactNode) {
  let index = 0
  const walk = (nodes: ReactNode): ReactNode =>
    Children.map(nodes, (child) => {
      if (!isValidElement(child)) return child
      const element = child as ReactElement<{ children?: ReactNode; index?: number }>
      if (element.type === SelectItem) return cloneElement(element, { index: index++ })
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
  name: 'SelectTrigger',
  ...fieldBoxStyle,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  variants: {
    size: {
      sm: { height: '$8', paddingHorizontal: '$2.5' },
      md: { height: '$10', paddingHorizontal: '$3' },
      lg: { height: '$12', paddingHorizontal: '$4' },
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
  name?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  invalid?: boolean
  /** Trigger width. Defaults to 100%. */
  width?: GetProps<typeof Trigger>['width']
  children: ReactNode
}

function SelectRoot({
  placeholder = 'Select…',
  size = 'md',
  disabled,
  invalid,
  width = '100%',
  children,
  id,
  'aria-label': ariaLabel,
  ...props
}: SelectProps) {
  const reducedMotion = useReducedMotion()
  const hydrated = useDidFinishSSR()
  const items = useMemo(() => indexItems(children), [children])

  if (!hydrated) {
    const label = findLabel(children, props.value ?? props.defaultValue)
    return (
      <StaticTrigger
        size={size}
        width={width}
        role="combobox"
        aria-expanded={false}
        aria-label={ariaLabel}
        id={id}
        opacity={disabled ? 0.5 : 1}
        {...(invalid ? { borderColor: '$error' as const } : null)}
      >
        <Text
          fontFamily="$body"
          fontSize="$2"
          color={label ? '$foreground' : '$placeholderColor'}
          numberOfLines={1}
        >
          {label ?? placeholder}
        </Text>
        <ChevronDownIcon size={16} color="$mutedForeground" />
      </StaticTrigger>
    )
  }

  return (
    <TamaguiSelect id={id} zIndex={zIndex.popover} disablePreventBodyScroll {...props}>
      <Trigger
        size={size}
        width={width}
        disabled={disabled}
        invalid={invalid}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        iconAfter={<ChevronDownIcon size={16} color="$mutedForeground" />}
      >
        <ValueText placeholder={placeholder} />
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
            backgroundColor="$overlay"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            transition={reducedMotion ? undefined : 'quick'}
          />
          <Sheet.Handle backgroundColor="$borderStrong" />
          <Sheet.Frame backgroundColor="$popover" padding="$2" paddingBottom="$6">
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <TamaguiSelect.Content>
        <TamaguiSelect.ScrollUpButton alignItems="center" justifyContent="center" height="$6">
          <ChevronUpIcon size={16} />
        </TamaguiSelect.ScrollUpButton>
        <Viewport>{items}</Viewport>
        <TamaguiSelect.ScrollDownButton alignItems="center" justifyContent="center" height="$6">
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
  Item: SelectItem,
  Group: SelectGroup,
  Separator: styled(View, {
    name: 'SelectSeparator',
    height: 1,
    backgroundColor: '$border',
    marginVertical: '$1',
  }),
  Text,
})
