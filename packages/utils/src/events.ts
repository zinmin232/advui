/**
 * Calls the consumer's handler first, then ours — unless the consumer called
 * `event.preventDefault()`. Mirrors the Radix/React Aria convention.
 */
export function composeEventHandlers<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
  { checkDefaultPrevented = true }: { checkDefaultPrevented?: boolean } = {},
) {
  return (event: E) => {
    theirs?.(event)
    const prevented =
      typeof event === 'object' &&
      event !== null &&
      'defaultPrevented' in event &&
      (event as { defaultPrevented?: boolean }).defaultPrevented === true
    if (!checkDefaultPrevented || !prevented) ours(event)
  }
}
