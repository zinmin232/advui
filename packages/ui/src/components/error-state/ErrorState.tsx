import { AlertCircleIcon } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type TamaguiElement, isWeb } from 'tamagui'
import { Button } from '../button/Button'
import { EmptyState, type EmptyStateProps } from '../empty-state/EmptyState'

export interface ErrorStateProps extends Omit<EmptyStateProps, 'tone' | 'title'> {
  title?: ReactNode
  /** Shows a retry button that calls this. */
  onRetry?: () => void
  retryLabel?: string
  /** Shows a spinner on the retry button while retrying. */
  retrying?: boolean
}

/**
 * Empty State's layout for a failed load: an error icon, a title, what went
 * wrong and a retry button. On web it is an `alert`, so it is announced.
 */
export const ErrorState = forwardRef<TamaguiElement, ErrorStateProps>(function ErrorState(
  {
    title = 'Something went wrong',
    icon = <AlertCircleIcon />,
    onRetry,
    retryLabel = 'Try again',
    retrying = false,
    children,
    ...props
  },
  ref,
) {
  return (
    <EmptyState
      ref={ref}
      tone="error"
      title={title}
      icon={icon}
      // Native: a role would need `accessible`, which hides the retry button.
      {...(isWeb && { role: 'alert' })}
      {...props}
    >
      {onRetry || children ? (
        <>
          {onRetry ? (
            <Button variant="outline" loading={retrying} onPress={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {children}
        </>
      ) : null}
    </EmptyState>
  )
})
