'use client'

import { Badge, Dialog, HStack, Input, Text, VStack } from '@advui/core'
import {
  ArrowRightIcon,
  CodeIcon,
  FileIcon,
  MonitorIcon,
  MoonIcon,
  PackageIcon,
  PaletteIcon,
  SearchIcon,
  SmartphoneIcon,
  SunIcon,
} from '@advui/icons'
import { themePresetNames, themePresets } from '@advui/theme'
import { useRouter } from 'next/navigation'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { View } from 'tamagui'
import { useColorModeSetting } from '../lib/color-mode'
import { type SearchEntry, searchEntries } from '../lib/search'
import { siteConfig } from '../lib/site'
import { useThemeStore } from '../lib/theme-store'

const PaletteContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(
  null,
)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
      if (event.key === '/' && !isTyping(event.target)) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  const value = useMemo(() => ({ open, setOpen }), [open])
  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
}

export function useCommandPalette() {
  const context = useContext(PaletteContext)
  if (!context) throw new Error('useCommandPalette must be used inside CommandPaletteProvider')
  return context
}

interface Action {
  id: string
  title: string
  subtitle?: string
  icon: ReactNode
  keywords: string
  run: () => void
}

type Result = { type: 'entry'; entry: SearchEntry } | { type: 'action'; action: Action }

const kindLabel: Record<SearchEntry['kind'], string> = {
  component: 'Component',
  guide: 'Docs',
  example: 'Example',
  prop: 'Prop',
  planned: 'Planned',
  'app-example': 'App example',
}

const kindIcon: Record<SearchEntry['kind'], ReactNode> = {
  component: <PackageIcon />,
  guide: <FileIcon />,
  example: <CodeIcon />,
  prop: <CodeIcon />,
  planned: <PackageIcon />,
  'app-example': <SmartphoneIcon />,
}

export function CommandPalette({ entries }: { entries: SearchEntry[] }) {
  const { open, setOpen } = useCommandPalette()
  const router = useRouter()
  const setting = useColorModeSetting()
  const { setTheme } = useThemeStore()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()

  const actions = useMemo<Action[]>(
    () => [
      {
        id: 'light',
        title: 'Switch to light mode',
        icon: <SunIcon />,
        keywords: 'theme light mode',
        run: () => setting.setSetting('light'),
      },
      {
        id: 'dark',
        title: 'Switch to dark mode',
        icon: <MoonIcon />,
        keywords: 'theme dark mode toggle',
        run: () => setting.setSetting('dark'),
      },
      {
        id: 'system',
        title: 'Use system color mode',
        icon: <MonitorIcon />,
        keywords: 'theme system auto',
        run: () => setting.setSetting('system'),
      },
      ...themePresetNames.map((name) => ({
        id: `preset-${name}`,
        title: `Theme preset: ${themePresets[name].label}`,
        icon: <PaletteIcon />,
        keywords: `change theme color preset ${name}`,
        run: () => setTheme({ style: 'advui', preset: name, primary: undefined }),
      })),
      {
        id: 'preset-material',
        title: 'Theme preset: Material 3',
        icon: <PaletteIcon />,
        keywords: 'change theme google material design m3 android',
        run: () => setTheme({ style: 'material', primary: undefined }),
      },
      {
        id: 'playground',
        title: 'Open playground',
        icon: <CodeIcon />,
        keywords: 'playground props',
        run: () => router.push('/playground'),
      },
      {
        id: 'github',
        title: 'Open GitHub repository',
        icon: <ArrowRightIcon />,
        keywords: 'github source repo',
        run: () => window.open(siteConfig.github, '_blank', 'noopener'),
      },
    ],
    [router, setTheme, setting],
  )

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const found = searchEntries(entries, query, 24).map((entry) => ({
      type: 'entry' as const,
      entry,
    }))
    const matchedActions = actions
      .filter(
        (a) =>
          !q || q.split(/\s+/).every((t) => `${a.title} ${a.keywords}`.toLowerCase().includes(t)),
      )
      .slice(0, q ? 6 : 3)
      .map((action) => ({ type: 'action' as const, action }))
    return [...found, ...matchedActions]
  }, [actions, entries, query])

  useEffect(() => setActive(0), [query])
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const select = useCallback(
    (result: Result | undefined) => {
      if (!result) return
      setOpen(false)
      if (result.type === 'entry') router.push(result.entry.href)
      else result.action.run()
    },
    [router, setOpen],
  )

  const optionId = (index: number) => `${listId}-option-${index}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content
        size="lg"
        padding="$0"
        gap="$0"
        hideCloseButton
        top="10%"
        $sm={{ top: '15%' }}
      >
        <Dialog.Title className="sr-only">Search documentation</Dialog.Title>
        <HStack gap="$2" paddingHorizontal="$4" borderBottomWidth={1} borderColor="$border">
          <SearchIcon size={18} color="$mutedForeground" />
          <Input
            flex={1}
            size="lg"
            borderWidth={0}
            paddingHorizontal="$0"
            backgroundColor="transparent"
            focusVisibleStyle={{ outlineWidth: 0 }}
            placeholder="Search components, docs, props…"
            value={query}
            onChangeText={setQuery}
            autoFocus
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? optionId(active) : undefined}
            aria-label="Search"
            onKeyDown={(event) => {
              const e = event as unknown as KeyboardEvent
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => Math.min(results.length - 1, i + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => Math.max(0, i - 1))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                select(results[active])
              }
            }}
          />
          <Badge variant="outline" size="sm">
            Esc
          </Badge>
        </HStack>
        <div
          id={listId}
          role="listbox"
          aria-label="Results"
          style={{ maxHeight: 384, overflowY: 'auto', padding: 8 }}
        >
          {results.length === 0 ? (
            <Text tone="muted" size="sm" padding="$6" textAlign="center">
              No results for “{query}”.
            </Text>
          ) : (
            results.map((result, index) => {
              const isActive = index === active
              const title = result.type === 'entry' ? result.entry.title : result.action.title
              const subtitle =
                result.type === 'entry' ? result.entry.subtitle : result.action.subtitle
              const icon =
                result.type === 'entry' ? kindIcon[result.entry.kind] : result.action.icon
              const label = result.type === 'entry' ? kindLabel[result.entry.kind] : 'Action'
              return (
                <HStack
                  key={result.type === 'entry' ? result.entry.id : result.action.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isActive}
                  gap="$3"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$md"
                  cursor="pointer"
                  backgroundColor={isActive ? '$accent' : 'transparent'}
                  onMouseEnter={() => setActive(index)}
                  onPress={() => select(result)}
                >
                  <View opacity={0.7}>{icon}</View>
                  <VStack flex={1} minWidth={0}>
                    <Text size="sm" weight="medium" truncate>
                      {title}
                    </Text>
                    {subtitle ? (
                      <Text size="xs" tone="muted" truncate>
                        {subtitle}
                      </Text>
                    ) : null}
                  </VStack>
                  <Text size="xs" tone="muted">
                    {label}
                  </Text>
                </HStack>
              )
            })
          )}
        </div>
        <HStack
          gap="$4"
          paddingHorizontal="$4"
          paddingVertical="$2"
          borderTopWidth={1}
          borderColor="$border"
          display="none"
          $sm={{ display: 'flex' }}
        >
          <Text size="xs" tone="muted">
            ↑↓ to navigate
          </Text>
          <Text size="xs" tone="muted">
            ↵ to open
          </Text>
          <Text size="xs" tone="muted">
            Ctrl/⌘ K to toggle
          </Text>
        </HStack>
      </Dialog.Content>
    </Dialog>
  )
}
