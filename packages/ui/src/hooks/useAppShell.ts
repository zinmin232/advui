import { createContext, useContext } from 'react'

export interface AppShellContextValue {
  /** Whether the phone drawer is open. Always false at desktop sizes. */
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const AppShellContext = createContext<AppShellContextValue | null>(null)

/**
 * Where a Sidebar is rendered inside an AppShell: the desktop slot or the
 * phone drawer. The slot is the navigation landmark, so a Sidebar inside it
 * drops its own; in the drawer it also fills the drawer, never collapses, and
 * closes the drawer when an item is pressed. It lives with the hooks, not in
 * AppShell.tsx, so a Sidebar copied with the CLI does not bring the shell along.
 */
export const AppShellSlotContext = createContext<'inline' | 'drawer' | null>(null)

/** The AppShell's drawer state, for your own menu buttons. Outside an AppShell it is always closed. */
export function useAppShell(): AppShellContextValue {
  return useContext(AppShellContext) ?? { sidebarOpen: false, setSidebarOpen: () => {} }
}
