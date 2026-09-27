import { ChevronDownIcon } from '@advui/icons'
import { type ReactNode, createContext, forwardRef, useContext, useId } from 'react'
import {
  type AccordionContentProps as TamaguiAccordionContentProps,
  type AccordionItemProps as TamaguiAccordionItemProps,
  type AccordionMultipleProps,
  type AccordionSingleProps,
  type AccordionTriggerProps as TamaguiAccordionTriggerProps,
  Accordion as TamaguiAccordion,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  withStaticProperties,
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
import { Text } from '../typography/Text'
import { isTextContent } from '../../utils/isTextContent'

export type AccordionVariant = 'default' | 'card'

const AccordionStyleContext = createStyledContext<{ variant: AccordionVariant }>({
  variant: 'default',
})

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  /** `default`: divided list. `card`: bordered surface. */
  variant?: AccordionVariant
}

const AccordionRoot = forwardRef<TamaguiElement, AccordionProps>(function Accordion(
  { variant = 'default', ...props },
  ref,
) {
  return (
    <AccordionStyleContext.Provider variant={variant}>
      <TamaguiAccordion
        ref={ref as never}
        width="100%"
        {...(variant === 'card'
          ? {
              borderWidth: 1,
              borderColor: '$border',
              borderRadius: '$lg',
              backgroundColor: '$card',
              overflow: 'hidden',
            }
          : null)}
        {...props}
      />
    </AccordionStyleContext.Provider>
  )
})

export type AccordionItemProps = TamaguiAccordionItemProps

// Tamagui disables the trigger button of a disabled item but does not dim it.
// It also points the trigger's aria-controls at an id its content never renders,
// so each item owns the id and hands it to both parts.
const ItemContext = createContext({ disabled: false, contentId: '' })

const AccordionItem = forwardRef<TamaguiElement, AccordionItemProps>(
  function AccordionItem(props, ref) {
    const { variant } = AccordionStyleContext.useStyledContext()
    const contentId = useId()
    return (
      <ItemContext.Provider value={{ disabled: !!props.disabled, contentId }}>
        <TamaguiAccordion.Item
          ref={ref as never}
          // Card items draw a top divider; the first one is clipped by the frame.
          {...(variant === 'card'
            ? { borderTopWidth: 1, marginTop: -1 }
            : { borderBottomWidth: 1 })}
          borderColor="$border"
          {...props}
        />
      </ItemContext.Provider>
    )
  },
)

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface AccordionTriggerProps extends Omit<TamaguiAccordionTriggerProps, 'children'> {
  children: ReactNode
  /** Heading level wrapping the trigger on web (document outline). Default 3. */
  level?: HeadingLevel
}

const AccordionTrigger = forwardRef<TamaguiElement, AccordionTriggerProps>(
  function AccordionTrigger({ children, level = 3, onPressIn, onPressOut, ...props }, ref) {
    const { variant } = AccordionStyleContext.useStyledContext()
    const reducedMotion = useReducedMotion()
    const { disabled, contentId } = useContext(ItemContext)
    const ripple = useRipple({ color: '$foreground', disabled, onPressIn, onPressOut })

    const trigger = (
      <TamaguiAccordion.Trigger
        ref={ref as never}
        aria-controls={contentId}
        unstyled
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="$3"
        width="100%"
        minHeight="$11"
        paddingVertical="$3"
        paddingHorizontal={variant === 'card' ? '$4' : '$1'}
        borderWidth={0}
        borderRadius={variant === 'card' ? 0 : '$sm'}
        backgroundColor="transparent"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.5 : 1}
        hoverStyle={disabled ? undefined : { backgroundColor: '$muted' }}
        pressStyle={disabled || ripple.active ? undefined : { backgroundColor: '$accent' }}
        focusVisibleStyle={{
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: -2,
        }}
        // On web the trigger renders a <button>; native needs the role spelled out.
        {...(!isWeb && { role: 'button', accessible: true })}
        {...props}
        {...ripple.props}
      >
        {({ open }: { open: boolean }) => (
          <>
            {ripple.element}
            {isTextContent(children) ? (
              <Text size="sm" weight="medium" flex={1} textAlign="left">
                {children}
              </Text>
            ) : (
              <View flex={1}>{children}</View>
            )}
            <View
              aria-hidden
              rotate={open ? '180deg' : '0deg'}
              transition={reducedMotion ? undefined : 'quick'}
            >
              <ChevronDownIcon size={16} color="$mutedForeground" />
            </View>
          </>
        )}
      </TamaguiAccordion.Trigger>
    )

    // WAI-ARIA accordion: each trigger button sits in a heading so screen-reader
    // users can jump between sections. Native screen readers use the button role.
    if (!isWeb) return trigger
    return (
      <TamaguiAccordion.Header
        render={`h${level}` as 'h3'}
        margin={0}
        padding={0}
        fontSize="$2"
        lineHeight="$2"
        fontWeight="normal"
      >
        {trigger}
      </TamaguiAccordion.Header>
    )
  },
)

export type AccordionContentProps = TamaguiAccordionContentProps

const AccordionContent = forwardRef<TamaguiElement, AccordionContentProps>(
  function AccordionContent({ children, ...props }, ref) {
    const { variant } = AccordionStyleContext.useStyledContext()
    const reducedMotion = useReducedMotion()
    const { contentId } = useContext(ItemContext)
    return (
      <TamaguiAccordion.HeightAnimator transition={reducedMotion ? undefined : 'medium'}>
        <TamaguiAccordion.Content
          ref={ref as never}
          id={contentId}
          unstyled
          paddingBottom="$4"
          paddingHorizontal={variant === 'card' ? '$4' : '$1'}
          exitStyle={{ opacity: 0 }}
          transition={reducedMotion ? undefined : 'medium'}
          {...props}
        >
          {isTextContent(children) ? <Text size="sm">{children}</Text> : children}
        </TamaguiAccordion.Content>
      </TamaguiAccordion.HeightAnimator>
    )
  },
)

/**
 * Vertically stacked sections that expand to reveal their content. Use
 * `type="single"` (one open at a time) or `type="multiple"`.
 */
export const Accordion = withStaticProperties(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})
