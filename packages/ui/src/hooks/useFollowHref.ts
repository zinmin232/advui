import { useSyncExternalStore } from 'react'
import { Linking } from 'react-native'
import { isWeb } from 'tamagui/unstyled'

/** What Adv UI needs of the app's router. */
export interface AppRouter {
  /** Opens a path in the app, e.g. `router.push` from Expo Router. */
  push: (href: string) => void
}

// A module value, not context, so links inside native portals (sheets,
// toasts), which drop React context, reach it too. Components subscribe, so a
// router registered from an effect after the first render still turns them
// into links.
let appRouter: AppRouter | undefined
const listeners = new Set<() => void>()

/**
 * Registers the app's router, so a path in `href` (Link, Breadcrumb, Sidebar,
 * Navigation Menu, Menu and List Item) navigates on iOS and Android, e.g.
 * `setRouter(router)` with Expo Router's `router`. Call it at app start, or
 * in an effect for a router that comes from a hook. Web follows the `<a>` (or
 * your `render`) and ignores it.
 */
export function setRouter(router: AppRouter | undefined) {
  appRouter = router
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getRouter = () => appRouter

/** A scheme such as `https:`, `mailto:` or `tel:`: iOS and Android can open it themselves. */
const ABSOLUTE_URL = /^[a-z][a-z\d+.-]*:/i

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

// Warn once per path, not on every render.
const warnedPaths = new Set<string>()

const noFollow = () => {}

export interface FollowHref {
  /**
   * Whether a press follows `href`. On iOS and Android: an absolute URL, or a
   * path once a router is registered. On web: whenever there is an `href`.
   */
  navigable: boolean
  /**
   * iOS / Android: follows `href` unless the press's default was prevented.
   * Call it after the component's own `onPress`, as a browser follows an `<a>`
   * after its click handlers. Web: does nothing; the `<a>` follows it.
   */
  follow: (event?: { isDefaultPrevented?: () => boolean }) => void
}

/**
 * How a component follows its `href` on iOS and Android, which have no `<a>`:
 * an absolute URL opens with the system (`Linking`), and a path goes to the
 * router registered with `setRouter`. A fragment (`#plans`) has no page to
 * scroll to there, so it is never followed. `handled` says the component
 * navigates some other way (its `onPress`), so a path without a router is not
 * worth a warning.
 */
export function useFollowHref(
  href: string | undefined,
  component: string,
  handled = false,
): FollowHref {
  const router = useSyncExternalStore(subscribe, getRouter, getRouter)
  if (isWeb || href === undefined) return { navigable: href !== undefined, follow: noFollow }

  const opensUrl = ABSOLUTE_URL.test(href)
  const isPath = !opensUrl && !href.startsWith('#')
  const navigable = opensUrl || (isPath && router !== undefined)

  if (
    process.env.NODE_ENV !== 'production' &&
    isPath &&
    !navigable &&
    !handled &&
    !warnedPaths.has(href)
  ) {
    warnedPaths.add(href)
    console.warn(
      `${component}: "${href}" needs a router on iOS and Android. Call setRouter() at app start (e.g. setRouter(router) with Expo Router), or navigate in onPress.`,
    )
  }

  return {
    navigable,
    follow: (event) => {
      if (!navigable || event?.isDefaultPrevented?.()) return
      // No app may handle the scheme (tel: on a tablet); there is nothing to show then.
      if (opensUrl) Linking.openURL(href).catch(() => {})
      // The router at press time, in case the app has swapped it since this render.
      else appRouter?.push(href)
    },
  }
}
