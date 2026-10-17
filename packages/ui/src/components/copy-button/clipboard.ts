import { useCallback, useEffect, useRef, useState } from 'react'
import { isWeb } from 'tamagui'

/** Writes text to the clipboard; throws (or rejects) when it cannot. */
export type WriteClipboard = (text: string) => Promise<unknown> | void

// Set once at app start; a module value (not context) so it also reaches
// buttons inside native portals (sheets, dialogs), which drop React context.
let appClipboard: WriteClipboard | undefined

/**
 * Registers the app's clipboard for every Copy Button and Code Block, e.g.
 * `setClipboard(Clipboard.setStringAsync)` with `expo-clipboard`. iOS and
 * Android need one; web uses the browser's clipboard unless one is set.
 */
export function setClipboard(write: WriteClipboard | undefined) {
  appClipboard = write
}

/** The fallback for pages the Clipboard API refuses, such as `http:` ones. */
function copyWithSelection(text: string) {
  const active = document.activeElement as HTMLElement | null
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  Object.assign(area.style, { position: 'fixed', top: '0', left: '0', opacity: '0' })
  document.body.append(area)
  area.focus({ preventScroll: true })
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  active?.focus({ preventScroll: true })
  if (!copied) throw new Error('The browser refused to copy.')
}

/** Copies text with the app's clipboard, or the browser's on web. */
export async function writeClipboard(text: string) {
  if (appClipboard) {
    await appClipboard(text)
    return
  }
  if (!isWeb) {
    throw new Error('No clipboard. Call setClipboard() at app start (e.g. with expo-clipboard).')
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Refused (no permission, or the page is not focused); try the old way.
    }
  }
  copyWithSelection(text)
}

export type ClipboardStatus = 'idle' | 'copied' | 'failed'

export interface UseClipboardOptions {
  /** How long `status` stays `copied` or `failed`, in ms. Default 2000. */
  timeout?: number
  onCopy?: (text: string) => void
  onError?: (error: unknown) => void
}

let warned = false

/**
 * Copies text and reports how it went, for your own copy controls. `copy`
 * resolves to whether it worked; `status` is `copied` or `failed` for
 * `timeout` ms after.
 */
export function useClipboard({ timeout = 2000, onCopy, onError }: UseClipboardOptions = {}) {
  const [status, setStatus] = useState<ClipboardStatus>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(true)
  // The latest callbacks, so `copy` keeps its identity across renders.
  const callbacks = useRef({ onCopy, onError })
  useEffect(() => {
    callbacks.current = { onCopy, onError }
  })

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      clearTimeout(timer.current)
      let copied = true
      try {
        await writeClipboard(text)
        callbacks.current.onCopy?.(text)
      } catch (error) {
        copied = false
        // A missing native clipboard is a setup mistake; say so once.
        if (!isWeb && !appClipboard && !warned) {
          warned = true
          console.warn((error as Error).message)
        }
        callbacks.current.onError?.(error)
      }
      if (!mounted.current) return copied
      setStatus(copied ? 'copied' : 'failed')
      timer.current = setTimeout(() => setStatus('idle'), timeout)
      return copied
    },
    [timeout],
  )

  return { copy, status }
}
