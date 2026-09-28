import { IconDefaults, SearchIcon } from '@advui/icons'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Input as TamaguiInput, ScrollView, View, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { Dialog } from '../dialog/Dialog'
import { Kbd } from '../typography/Kbd'
import { Text } from '../typography/Text'

export interface Command {
  id: string
  label: string
  /** Heading the command is listed under. */
  group?: string
  icon?: ReactNode
  /** Shortcut hint shown on the right, e.g. "⌘S". Display only. */
  shortcut?: string
  /** Extra words that should find it, e.g. `['preferences']` for Settings. */
  keywords?: string[]
  disabled?: boolean
  onSelect: () => void
}

export interface CommandPaletteLabels {
  title: string
  placeholder: string
  empty: string
}

const defaultLabels: CommandPaletteLabels = {
  title: 'Command palette',
  placeholder: 'Type a command or search…',
  empty: 'No results.',
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

/**
 * 0 when the label starts with the query, 1 when a word in it does, 2 when
 * the label or a keyword contains it, -1 for no match. Lower ranks first.
 */
export function rankCommand(command: Command, query: string): number {
  const q = normalize(query)
  if (!q) return 0
  const label = normalize(command.label)
  if (label.startsWith(q)) return 0
  if (label.split(/\s+/).some((word) => word.startsWith(q))) return 1
  const haystack = [
    label,
    ...(command.keywords ?? []).map(normalize),
    normalize(command.group ?? ''),
  ]
  return haystack.some((text) => text.includes(q)) ? 2 : -1
}

const SearchInput = styled(TamaguiInput, {
  name: 'CommandPaletteInput',
  unstyled: true,
  flex: 1,
  height: '$12',
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  fontFamily: '$body',
  fontSize: '$3',
  color: '$foreground',
  placeholderTextColor: '$placeholderColor',
  // The dialog is the focus context; the row has no ring of its own.
  outlineStyle: 'none',
})

const OptionRow = styled(View, {
  name: 'CommandPaletteOption',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$3',
  minHeight: '$10',
  $touchable: { minHeight: '$11' },
  paddingHorizontal: '$3',
  borderRadius: '$md',
  cursor: 'pointer',

  variants: {
    active: {
      true: { backgroundColor: '$accent' },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  } as const,
})

export interface CommandPaletteProps {
  commands: Command[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Web: ⌘ (Mac) or Ctrl plus this key toggles the palette anywhere on the
   * page. Default: "k". `null` turns the shortcut off.
   */
  hotkey?: string | null
  /** Title (read by screen readers), placeholder and empty text, for translation. */
  labels?: Partial<CommandPaletteLabels>
}

type KeyEvent = { key: string; preventDefault: () => void }

/**
 * A searchable list of actions in a dialog, opened with ⌘K / Ctrl+K on web.
 * Type to filter, arrow keys to move, Enter to run.
 */
export function CommandPalette({
  commands,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  hotkey = 'k',
  labels: labelsProp,
}: CommandPaletteProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const optionId = (index: number) => `${listId}-${index}`

  // ⌘K / Ctrl+K from anywhere on the page.
  const openRef = useRef(open)
  openRef.current = open
  useEffect(() => {
    if (!isWeb || !hotkey) return
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === hotkey.toLowerCase()) {
        event.preventDefault()
        setOpen(!openRef.current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hotkey, setOpen])

  // Every opening starts from an empty search.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
  }, [open])

  const matches = commands
    .map((command, index) => ({ command, index, rank: rankCommand(command, query) }))
    .filter((m) => m.rank >= 0)
    // Best matches first; ties keep your order (and so your groups).
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((m) => m.command)

  // Group in order of first appearance, so headings follow the ranking.
  const groups: { name: string | undefined; items: { command: Command; index: number }[] }[] = []
  matches.forEach((command, index) => {
    const group = groups.find((g) => g.name === command.group)
    if (group) group.items.push({ command, index })
    else groups.push({ name: command.group, items: [{ command, index }] })
  })
  // Options render group by group, so number them in that order.
  const ordered = groups.flatMap((g) => g.items.map((item) => item.command))
  const activeIndex = Math.min(active, ordered.length - 1)

  useEffect(() => {
    if (!isWeb || activeIndex < 0) return
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, listId])

  const run = (command: Command | undefined) => {
    if (!command || command.disabled) return
    setOpen(false)
    command.onSelect()
  }

  const move = (step: 1 | -1) => {
    if (ordered.length === 0) return
    let next = activeIndex
    for (let i = 0; i < ordered.length; i++) {
      next = (next + step + ordered.length) % ordered.length
      if (!ordered[next]!.disabled) break
    }
    setActive(next)
  }

  const onKeyDown = (event: KeyEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(ordered[activeIndex])
    }
  }

  let position = -1
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content hideCloseButton padding={0} gap={0} size="md">
        {/* Names the dialog; the search box says the rest visually. */}
        <Dialog.Title
          position="absolute"
          width={1}
          height={1}
          overflow="hidden"
          opacity={0.00000001}
        >
          {labels.title}
        </Dialog.Title>
        <View
          flexDirection="row"
          alignItems="center"
          gap="$2"
          paddingHorizontal="$4"
          borderBottomWidth={1}
          borderColor="$border"
        >
          <View aria-hidden>
            <SearchIcon size={18} color="$mutedForeground" />
          </View>
          <SearchInput
            autoFocus
            aria-label={labels.title}
            placeholder={labels.placeholder}
            autoCorrect={false}
            autoCapitalize="none"
            value={query}
            onChangeText={(text: string) => {
              setQuery(text)
              setActive(0)
            }}
            {...(isWeb && {
              role: 'combobox',
              'aria-expanded': true,
              'aria-controls': listId,
              'aria-autocomplete': 'list',
              'aria-activedescendant': activeIndex >= 0 ? optionId(activeIndex) : undefined,
              onKeyDown,
            })}
            // Web runs it from onKeyDown; this is the keyboard's return key on native.
            {...(!isWeb && { onSubmitEditing: () => run(ordered[activeIndex]) })}
          />
        </View>
        <ScrollView
          maxHeight="$80"
          keyboardShouldPersistTaps="handled"
          // The arrow keys in the text box scroll it too, but a long list must
          // also be reachable as a scroll area on its own (axe scrollable-region-focusable).
          {...(isWeb && { tabIndex: 0, role: 'region' as never, 'aria-label': labels.title })}
        >
          <View
            id={listId}
            {...(isWeb && { role: 'listbox' as never, 'aria-label': labels.title })}
            padding="$2"
            gap="$1"
            // Keep focus in the text box when an option is clicked.
            {...(isWeb && {
              onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
            })}
          >
            {ordered.length === 0 ? (
              <Text
                size="sm"
                tone="muted"
                textAlign="center"
                paddingVertical="$6"
                aria-live="polite"
              >
                {labels.empty}
              </Text>
            ) : (
              groups.map((group, groupIndex) => {
                const headingId = `${listId}-group-${groupIndex}`
                return (
                  <View
                    key={group.name ?? ''}
                    {...(isWeb && group.name && { role: 'group', 'aria-labelledby': headingId })}
                  >
                    {group.name ? (
                      <Text
                        id={headingId}
                        size="xs"
                        weight="medium"
                        tone="muted"
                        paddingHorizontal="$3"
                        paddingVertical="$1.5"
                      >
                        {group.name}
                      </Text>
                    ) : null}
                    {group.items.map(({ command }) => {
                      position += 1
                      const index = position
                      return (
                        <OptionRow
                          key={command.id}
                          id={optionId(index)}
                          active={index === activeIndex}
                          disabled={command.disabled}
                          {...(isWeb
                            ? {
                                role: 'option',
                                'aria-selected': index === activeIndex,
                                'aria-disabled': command.disabled || undefined,
                                onMouseEnter: () => !command.disabled && setActive(index),
                              }
                            : {
                                accessible: true,
                                role: 'button',
                                'aria-disabled': command.disabled || undefined,
                              })}
                          onPress={() => run(command)}
                        >
                          {command.icon ? (
                            <View aria-hidden>
                              <IconDefaults size={16} color="$mutedForeground">
                                {command.icon}
                              </IconDefaults>
                            </View>
                          ) : null}
                          <Text size="sm" flex={1} color="$popoverForeground">
                            {command.label}
                          </Text>
                          {command.shortcut && isWeb ? (
                            <View aria-hidden>
                              <Kbd>{command.shortcut}</Kbd>
                            </View>
                          ) : null}
                        </OptionRow>
                      )
                    })}
                  </View>
                )
              })
            )}
          </View>
        </ScrollView>
      </Dialog.Content>
    </Dialog>
  )
}
