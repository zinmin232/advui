import { describe, expect, it } from 'vitest'
import { createUniversalConfig, getUniversalSettings } from './config'

describe('createUniversalConfig', () => {
  it('creates light and dark themes plus tokens, fonts and media', () => {
    const config = createUniversalConfig({ preset: 'violet', radius: 'lg', fontScale: 'large' })
    expect(Object.keys(config.themes)).toEqual(expect.arrayContaining(['light', 'dark']))
    expect(config.tokens.radius.lg.val).toBe(12)
    expect(config.fonts.body?.size['3']).toBe(18)
    expect(config.media.md).toEqual({ minWidth: 768 })
  })

  it('lets explicit colors win over the preset', () => {
    const config = createUniversalConfig({
      preset: 'slate',
      colors: { primary: '#e11d48', monochrome: false },
    })
    const light = config.themes.light as unknown as Record<string, { val: string }>
    expect(light.primary?.val).not.toBe(light.foreground?.val)
  })

  it('keeps Adv UI settings on the config, with the ripple off by default', () => {
    expect(getUniversalSettings(createUniversalConfig()).androidRipple).toBe(false)
    const config = createUniversalConfig({ androidRipple: true })
    expect(getUniversalSettings(config)).toEqual({ androidRipple: true })
    // A config made without createUniversalConfig gets the defaults.
    expect(getUniversalSettings({}).androidRipple).toBe(false)
  })
})
