import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useId,
} from 'react'
import { type GetProps, type TamaguiElement, View, withStaticProperties } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'

type CollapsibleState = {
  open: boolean
  setOpen: (open: boolean) => void
  disabled: boolean
  contentId: string
}

const CollapsibleContext = createContext<CollapsibleState | null>(null)

function useCollapsible(part: string) {
  const context = useContext(CollapsibleContext)
  if (!context) throw new Error(`Collapsible.${part} must be rendered inside <Collapsible>.`)
  return context
}

export interface CollapsibleProps extends Omit<GetProps<typeof View>, 'children'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The trigger does nothing and is announced as unavailable. */
  disabled?: boolean
  children: ReactNode
}

const CollapsibleRoot = forwardRef<TamaguiElement, CollapsibleProps>(function Collapsible(
  { open: openProp, defaultOpen = false, onOpenChange, disabled = false, children, ...props },
  ref,
) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const contentId = useId()
  return (
    <CollapsibleContext.Provider value={{ open, setOpen, disabled, contentId }}>
      <View ref={ref} data-state={open ? 'open' : 'closed'} {...props}>
        {children}
      </View>
    </CollapsibleContext.Provider>
  )
})

type PressableChild = ReactElement<{
  onPress?: (event: unknown) => void
  disabled?: boolean
  'aria-expanded'?: boolean
  'aria-controls'?: string
}>

export interface CollapsibleTriggerProps {
  /** One pressable element, usually a Button. Its label stays its accessible name. */
  children: ReactElement
}

function CollapsibleTrigger({ children }: CollapsibleTriggerProps) {
  const { open, setOpen, disabled, contentId } = useCollapsible('Trigger')
  const child = children as PressableChild
  return cloneElement(child, {
    'aria-expanded': open,
    'aria-controls': contentId,
    ...(disabled && { disabled: true }),
    onPress: (event: unknown) => {
      child.props.onPress?.(event)
      if (!disabled) setOpen(!open)
    },
  })
}

export type CollapsibleContentProps = GetProps<typeof View>

// Stays mounted while closed, so `aria-controls` always points at it and
// anything typed inside survives closing.
const CollapsibleContent = forwardRef<TamaguiElement, CollapsibleContentProps>(
  function CollapsibleContent(props, ref) {
    const { open, contentId } = useCollapsible('Content')
    return (
      <View
        ref={ref}
        id={contentId}
        data-state={open ? 'open' : 'closed'}
        display={open ? 'flex' : 'none'}
        aria-hidden={!open || undefined}
        {...props}
      />
    )
  },
)

/**
 * Shows and hides a section with one trigger, such as "Show 3 more" or
 * "Advanced options". For several sections that open one at a time, use
 * Accordion.
 */
export const Collapsible = withStaticProperties(CollapsibleRoot, {
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
})
