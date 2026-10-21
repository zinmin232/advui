import { type ReactNode, forwardRef, useEffect, useState } from 'react'
import { type GetProps, type TamaguiElement, View, XStack, isWeb, styled } from 'tamagui/unstyled'
import { useDashedBorder } from '../../hooks/useDashedBorder'
import { Spinner } from '../spinner/Spinner'
import { Text } from '../typography/Text'

// Same layout as Empty State and Error State, so the three can swap in place.
const LoadingStateFrame = styled(View, {
  displayName: 'LoadingState',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3',
  paddingVertical: '10',
  paddingHorizontal: '6',
  variants: {
    bordered: {
      true: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'border',
        borderRadius: 'lg',
      },
    },
  } as const,
})

export interface LoadingStateProps extends Omit<GetProps<typeof LoadingStateFrame>, 'children'> {
  /** What is loading, such as "Loading invoices…". */
  title?: ReactNode
  description?: ReactNode
  /**
   * Milliseconds to wait before showing anything, so loads that finish
   * quickly do not flash a spinner.
   */
  delay?: number
  /** Actions, such as a Cancel button. */
  children?: ReactNode
}

/**
 * Shown in place of content while it loads: a spinner, what is loading and,
 * optionally, a way to cancel. On web the text is a `status`, so it is
 * announced politely.
 */
export const LoadingState = forwardRef<TamaguiElement, LoadingStateProps>(function LoadingState(
  { title = 'Loading…', description, delay = 0, bordered = false, children, style, ...props },
  ref,
) {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    if (delay <= 0) return
    const timer = setTimeout(() => setElapsed(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  const shown = delay <= 0 || elapsed
  const dashed = useDashedBorder(bordered && shown ? 'border' : null, 'lg')

  // Web: the status element is rendered empty during the delay, because
  // screen readers announce text added to a live region more reliably than a
  // new region. Native: one element for the text, so buttons stay reachable.
  const textSemantics = isWeb
    ? { role: 'status' as const }
    : shown
      ? { role: 'status' as const, accessible: true }
      : null

  return (
    <LoadingStateFrame
      ref={ref}
      bordered={bordered && shown}
      style={dashed.frame ? [dashed.frame, style] : style}
      {...props}
    >
      {dashed.overlay}
      {/* The text says what the spinner shows; a second "Loading" is noise. */}
      {shown ? <Spinner size="lg" color="primary" aria-hidden /> : null}
      <View gap="1" alignItems="center" {...textSemantics}>
        {shown ? (
          <>
            <Text weight="medium" textAlign="center">
              {title}
            </Text>
            {description ? (
              <Text size="sm" tone="muted" textAlign="center" maxWidth={420}>
                {description}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
      {shown && children ? (
        <XStack gap="2" marginTop="2" flexWrap="wrap" justifyContent="center">
          {children}
        </XStack>
      ) : null}
    </LoadingStateFrame>
  )
})
