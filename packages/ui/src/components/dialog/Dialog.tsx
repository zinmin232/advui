import { XIcon } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import {
  Dialog as TamaguiDialog,
  type DialogContentProps as TamaguiDialogContentProps,
  type DialogProps as TamaguiDialogProps,
  type GetProps,
  type TamaguiElement,
  View,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import {
  contentSizes,
  contentStyle,
  descriptionStyle,
  footerStyle,
  headerStyle,
  overlayStyle,
  titleStyle,
} from './styles'

const Overlay = styled(TamaguiDialog.Overlay, { name: 'DialogOverlay', ...overlayStyle })

const ContentFrame = styled(TamaguiDialog.Content, {
  name: 'DialogContent',
  ...contentStyle,
  variants: { size: contentSizes } as const,
})

const Header = styled(View, { name: 'DialogHeader', ...headerStyle, paddingRight: '$6' })

const Footer = styled(View, { name: 'DialogFooter', ...footerStyle })

const Title = styled(TamaguiDialog.Title, { name: 'DialogTitle', ...titleStyle })

const Description = styled(TamaguiDialog.Description, {
  name: 'DialogDescription',
  ...descriptionStyle,
})

export type DialogProps = TamaguiDialogProps

export interface DialogContentProps extends Omit<TamaguiDialogContentProps, 'size'> {
  size?: GetProps<typeof ContentFrame>['size']
  /** Hide the top-right close button (keep another way to close!). */
  hideCloseButton?: boolean
  children?: ReactNode
}

const Content = forwardRef<TamaguiElement, DialogContentProps>(function DialogContent(
  { children, hideCloseButton, size = 'md', ...props },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? null : 'quick'
  return (
    <TamaguiDialog.Portal>
      <Overlay key="overlay" transition={transition} />
      <ContentFrame
        key="content"
        ref={ref}
        size={size}
        transition={transition}
        animateOnly={['transform', 'opacity']}
        {...props}
      >
        {children}
        {hideCloseButton ? null : (
          <Close asChild>
            <IconButton
              aria-label="Close"
              icon={<XIcon />}
              size="sm"
              position="absolute"
              top="$3"
              right="$3"
            />
          </Close>
        )}
      </ContentFrame>
    </TamaguiDialog.Portal>
  )
})

export type DialogCloseProps = GetProps<typeof TamaguiDialog.Close>

/**
 * Closes the dialog. Tamagui's Close sets `aria-label="Dialog Close"`, which
 * would override visible labels such as "Cancel"; we clear it so the child's
 * text stays the accessible name (pass `aria-label` for icon-only closers).
 */
const Close = forwardRef<TamaguiElement, DialogCloseProps>(function DialogClose(props, ref) {
  return <TamaguiDialog.Close ref={ref} aria-label={undefined} {...props} />
})

function DialogRoot(props: DialogProps) {
  return <TamaguiDialog modal {...props} />
}

/**
 * Modal window for focused tasks. Focus is trapped inside while open, Escape
 * closes it, and focus returns to the trigger on close. Title and Description
 * are wired to `aria-labelledby` / `aria-describedby`.
 */
export const Dialog = withStaticProperties(DialogRoot, {
  Trigger: TamaguiDialog.Trigger,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Close,
  Body: styled(View, { name: 'DialogBody', gap: '$3' }),
  Text,
})
