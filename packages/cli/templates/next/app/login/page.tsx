import type { Metadata } from 'next'
import { LoginScreen } from '../../screens/login'

export const metadata: Metadata = { title: 'Sign in' }

export default function Login() {
  return <LoginScreen />
}
