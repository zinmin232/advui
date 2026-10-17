import { useEffect, useSyncExternalStore } from 'react'

// Native only. A Label's `htmlFor` only moves focus on iOS and Android, so the
// Label publishes its text for the id it targets, and the control with that id
// takes it as its name (through useFieldControl), as a Field's label does.
// While a control uses the text, the Label is hidden from screen readers so the
// name is not read twice. Labels and controls are often siblings, so they meet
// here by id rather than through context.

interface Entry {
  text?: string
  owner?: object
  users: number
}

const entries = new Map<string, Entry>()
const listeners = new Set<() => void>()

const emit = () => {
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const entryFor = (id: string) => {
  let entry = entries.get(id)
  if (!entry) {
    entry = { users: 0 }
    entries.set(id, entry)
  }
  return entry
}

const release = (id: string, entry: Entry) => {
  if (entry.text === undefined && entry.users === 0) entries.delete(id)
  emit()
}

/**
 * Label side: offers `text` as the name of the control whose id is `htmlFor`.
 * Returns true while a control uses it. Pass `undefined` on web.
 */
export function usePublishLabel(htmlFor: string | undefined, text: string | undefined): boolean {
  useEffect(() => {
    if (!htmlFor || !text) return
    const owner = {}
    const entry = entryFor(htmlFor)
    entry.text = text
    entry.owner = owner
    emit()
    return () => {
      // Another Label may have taken the id since.
      if (entry.owner !== owner) return
      entry.text = undefined
      entry.owner = undefined
      release(htmlFor, entry)
    }
  }, [htmlFor, text])
  const used = () => Boolean(htmlFor && text && (entries.get(htmlFor)?.users ?? 0) > 0)
  return useSyncExternalStore(subscribe, used, () => false)
}

/**
 * Control side: the text of a Label that targets `id`, for a control without a
 * name of its own. Pass `undefined` on web or when the control is named.
 */
export function useLabelFor(id: string | undefined): string | undefined {
  useEffect(() => {
    if (!id) return
    const entry = entryFor(id)
    entry.users += 1
    emit()
    return () => {
      entry.users -= 1
      release(id, entry)
    }
  }, [id])
  const text = () => (id ? entries.get(id)?.text : undefined)
  return useSyncExternalStore(subscribe, text, () => undefined)
}
