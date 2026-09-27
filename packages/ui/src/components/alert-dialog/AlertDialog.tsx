import { type ReactNode, forwardRef } from 'react'
import {
  AlertDialog as TamaguiAlertDialog,
  type AlertDialogContentProps as TamaguiAlertDialogContentProps,
  type AlertDialogProps as TamaguiAlertDialogProps,
  type GetProps,
  type TamaguiElement,
  View,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import {
  contentSizes,
  contentStyle,
  descriptionStyle,
  footerStyle,
  headerStyle,
  overlayStyle,
  titleStyle,
} from '../dialog/styles'

const Overlay = styled(TamaguiAlertDialog.Overlay, { name: 'AlertDialogOverlay', ...overlayStyle })

const Header = styled(View, { name: 'AlertDialogHeader', ...headerStyle })

const Footer = styled(View, { name: 'AlertDialogFooter', ...footerStyle })

const Title = styled(TamaguiAlertDialog.Title, { name: 'AlertDialogTitle', ...titleStyle })

const Description = styled(TamaguiAlertDialog.Description, {
  name: 'AlertDialogDescription',
  ...descriptionStyle,
})

export type AlertDialogProps = Omit<TamaguiAlertDialogProps, 'native'>

export interface AlertDialogContentProps extends Omit<TamaguiAlertDialogContentProps, 'size'> {
  size?: keyof typeof contentSizes
  children?: ReactNode
}

const Content = forwardRef<TamaguiElement, AlertDialogContentProps>(function AlertDialogContent(
  { children, size = 'sm', ...props },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? null : 'quick'
  return (
    <TamaguiAlertDialog.Portal>
      <Overlay key="overlay" transition={transition} />
      {/* Not wrapped in styled(): Tamagui's AlertDialog.Content is a plain
          component, and a styled wrapper keeps it mounted after it closes. */}
      <TamaguiAlertDialog.Content
        key="content"
        ref={ref}
        {...contentStyle}
        {...contentSizes[size]}
        transition={transition}
        animateOnly={['transform', 'opacity']}
        {...props}
      >
        {children}
      </TamaguiAlertDialog.Content>
    </TamaguiAlertDialog.Portal>
  )
})

// Tamagui's Cancel and Action set `aria-label="Dialog Close"`, which would hide
// visible labels such as "Delete"; clearing it keeps the child's text as the name.

export type AlertDialogCancelProps = GetProps<typeof TamaguiAlertDialog.Cancel>

const Cancel = forwardRef<TamaguiElement, AlertDialogCancelProps>(
  function AlertDialogCancel(props, ref) {
    return <TamaguiAlertDialog.Cancel ref={ref} aria-label={undefined} {...props} />
  },
)

export type AlertDialogActionProps = GetProps<typeof TamaguiAlertDialog.Action>

const Action = forwardRef<TamaguiElement, AlertDialogActionProps>(
  function AlertDialogAction(props, ref) {
    return <TamaguiAlertDialog.Action ref={ref} aria-label={undefined} {...props} />
  },
)

function AlertDialogRoot(props: AlertDialogProps) {
  return <TamaguiAlertDialog {...props} />
}

/**
 * Interrupts the user to confirm an important or destructive action. Unlike
 * Dialog it has no close button and ignores presses outside: the user answers
 * with Cancel or the Action (Escape cancels). Focus starts on Cancel.
 */
export const AlertDialog = withStaticProperties(AlertDialogRoot, {
  Trigger: TamaguiAlertDialog.Trigger,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Cancel,
  Action,
})
