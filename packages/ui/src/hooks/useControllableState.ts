import { useCallback, useState } from 'react'

/**
 * State that can be either controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). Every stateful component uses this so both styles work.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (next: T) => void
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
      if (Object.is(resolved, current)) return
      if (!isControlled) setInternal(resolved)
      onChange?.(resolved)
    },
    [current, isControlled, onChange],
  )

  return [current, setValue]
}
