import { isWeb, useDialogContext } from 'tamagui/unstyled'

/**
 * Native: a press on the overlay closes the dialog. Tamagui closes a dialog
 * from outside presses on web only (its Dismissable), and its native overlay
 * has no press handler. Call it in the dialog's Content, not inside the
 * portal. Alert dialogs do not use it: they close only from their buttons.
 */
export function useOverlayPress() {
  const context = useDialogContext()
  return isWeb ? null : { onPress: () => context.onOpenChange?.(false) }
}
