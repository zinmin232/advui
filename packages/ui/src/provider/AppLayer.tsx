import type { ReactNode } from 'react'

/** Web: nothing to add. Dialogs keep focus inside themselves (see AppLayer.native.tsx). */
export function AppLayer({ children }: { children: ReactNode }) {
  return <>{children}</>
}
