import type { Metadata } from 'next'
import { ProfileSettingsScreen } from '../../screens/settings'

export const metadata: Metadata = { title: 'Settings' }

export default function Settings() {
  return <ProfileSettingsScreen />
}
