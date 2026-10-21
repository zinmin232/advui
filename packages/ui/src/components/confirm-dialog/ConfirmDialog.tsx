import { type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react'
import { type TamaguiElement, isWeb } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { AlertDialog } from '../alert-dialog/AlertDialog'
import { Button } from '../button/Button'
import { LoadingButton } from '../loading-button/LoadingButton'

export type ConfirmDialogTone = 'default' | 'destructive'

export interface ConfirmDialogProps {
  /** Open state, when you control it. */
  open?: boolean
  /** Open at first, when the dialog manages its state. */
  defaultOpen?: boolean
  /** Called when the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Opens the dialog, such as a Button. Leave it out and open the dialog with `open`. */
  trigger?: ReactElement
  /** The question, e.g. "Delete this project?". Names the dialog. */
  title: ReactNode
  /** The consequences. Announced with the title. */
  description?: ReactNode
  /** Label of the confirm button. Name the action, e.g. "Delete". */
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode
  /** `destructive` gives the confirm button the destructive fill. */
  tone?: ConfirmDialogTone
  /**
   * Called when the user confirms. Return a Promise to keep the dialog open
   * and busy until it settles: it closes when the Promise resolves and stays
   * open when it rejects, so the user can try again or cancel. The dialog
   * does not report the error; show it (e.g. with a toast) and rethrow.
   */
  onConfirm?: () => void | Promise<unknown>
  /** Called when the user cancels: Cancel, Escape or the Android back button. */
  onCancel?: () => void
}

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function'

/**
 * Asks the user to confirm one action, in one element: AlertDialog with a
 * title, a description, Cancel and a confirm button. An async `onConfirm`
 * keeps it open and busy until it finishes. Compose AlertDialog instead when
 * the dialog needs more content, such as a field.
 */
export function ConfirmDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [pending, setPending] = useState(false)
  // The ref blocks a second press before the busy state renders.
  const pendingRef = useRef(false)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Browsers drop focus from a button when it is disabled. After a failed
  // confirm the dialog stays open, so put focus back on the button: Enter
  // retries and Tab reaches Cancel.
  const confirmRef = useRef<TamaguiElement>(null)
  const wasPending = useRef(false)
  useEffect(() => {
    if (isWeb && wasPending.current && !pending && open) {
      if (document.activeElement === document.body)
        (confirmRef.current as HTMLElement | null)?.focus()
    }
    wasPending.current = pending
  }, [pending, open])

  // Only the user's own changes arrive here (the trigger, Cancel, Escape,
  // back); closing after a confirm sets the state directly.
  const handleOpenChange = (next: boolean) => {
    // While onConfirm runs, Escape and the back button must not close it.
    if (pendingRef.current) return
    setOpen(next)
    if (!next) onCancel?.()
  }

  const confirm = () => {
    if (pendingRef.current) return
    const result = onConfirm?.()
    if (!isPromiseLike(result)) {
      setOpen(false)
      return
    }
    pendingRef.current = true
    setPending(true)
    const settle = (succeeded: boolean) => {
      pendingRef.current = false
      if (!mountedRef.current) return
      setPending(false)
      if (succeeded) setOpen(false)
    }
    // A rejection keeps the dialog open; onConfirm owns reporting the error.
    result.then(
      () => settle(true),
      () => settle(false),
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger> : null}
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          {description ? <AlertDialog.Description>{description}</AlertDialog.Description> : null}
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button variant="outline" disabled={pending}>
              {cancelLabel}
            </Button>
          </AlertDialog.Cancel>
          {/* Not AlertDialog.Action: that closes at once, before an async onConfirm finishes. */}
          <LoadingButton
            ref={confirmRef}
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            loading={pending}
            onPress={confirm}
          >
            {confirmLabel}
          </LoadingButton>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  )
}
