import type { ComponentType } from 'react'
import { AdminScreen } from './admin'
import { DashboardScreen } from './dashboard'
import { LoginScreen } from './login'
import { type AppExampleMeta, appExamples as meta } from './meta'
import { MobileHomeScreen, MobileSettingsScreen } from './mobile'
import { ProductScreen } from './product'
import { ProfileSettingsScreen } from './settings'

export type AppExample = AppExampleMeta & { Component: ComponentType }

const screens: Record<string, ComponentType> = {
  login: LoginScreen,
  dashboard: DashboardScreen,
  admin: AdminScreen,
  settings: ProfileSettingsScreen,
  product: ProductScreen,
  'mobile-home': MobileHomeScreen,
  'mobile-settings': MobileSettingsScreen,
}

export const appExamples: AppExample[] = meta.map((m) => ({ ...m, Component: screens[m.slug]! }))

export const getAppExample = (slug: string) => appExamples.find((example) => example.slug === slug)

export type { AppExampleMeta }
export {
  AdminScreen,
  DashboardScreen,
  LoginScreen,
  MobileHomeScreen,
  MobileSettingsScreen,
  ProductScreen,
  ProfileSettingsScreen,
}
