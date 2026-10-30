import { forwardRef, useEffect, useRef } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { Link } from '../link/Link'
import { Text } from '../typography/Text'

export interface TableOfContentsItem {
  /** The id of the section's heading; the link goes to `#id` on web. */
  id: string
  label: string
  /** Heading level, such as 2 for an h2. Deeper levels are indented. */
  level?: number
}

// `items` is also Tamagui's shorthand for alignItems.
export interface TableOfContentsProps extends Omit<GetProps<typeof View>, 'children' | 'items'> {
  items: TableOfContentsItem[]
  /** The current section. On web, leave it out to follow the scroll. */
  activeId?: string
  /** Called as the scroll reaches another section (web) or an item is pressed. */
  onActiveIdChange?: (id: string) => void
  /** Called when an item is pressed. On iOS and Android, scroll to the section here. */
  onItemPress?: (item: TableOfContentsItem) => void
  /** Accessible name of the navigation. */
  label?: string
  /** Visible heading above the links, such as "On this page". */
  title?: string
  /** Web: a heading counts as reached this many pixels below the top of the window. */
  headingOffset?: number
  /** Added to the current item's name on iOS and Android, which read no `aria-current`. */
  currentLabel?: string
}

// Deeper levels step in by 12px.
const indents = ['3', '6', '9', '12'] as const

/**
 * The sections of a page as links, with the current one marked. On web it
 * follows the scroll by itself; on iOS and Android, give it `activeId` and
 * scroll in `onItemPress`.
 */
export const TableOfContents = forwardRef<TamaguiElement, TableOfContentsProps>(
  function TableOfContents(
    {
      items,
      activeId: activeIdProp,
      onActiveIdChange,
      onItemPress,
      label = 'On this page',
      title,
      headingOffset = 80,
      currentLabel = 'current',
      ...props
    },
    ref,
  ) {
    const [activeId, setActiveId] = useControllableState({
      value: activeIdProp,
      defaultValue: items[0]?.id ?? '',
      onChange: onActiveIdChange,
    })
    const setActive = useRef(setActiveId)
    setActive.current = setActiveId
    const ids = items.map((item) => item.id).join(' ')

    // Web: the current section is the last heading above the offset, or the
    // last one once the page is scrolled to the end (a short last section
    // never reaches the top).
    useEffect(() => {
      if (!isWeb) return
      let frame = 0
      const update = () => {
        frame = 0
        const headings = ids
          .split(' ')
          .map((id) => document.getElementById(id))
          .filter((heading) => heading !== null)
        const first = headings[0]
        const last = headings[headings.length - 1]
        if (!first || !last) return
        const root = document.documentElement
        const atEnd =
          window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 2
        let current = first.id
        if (atEnd) current = last.id
        else
          for (const heading of headings)
            if (heading.getBoundingClientRect().top <= headingOffset) current = heading.id
        setActive.current(current)
      }
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update)
      }
      update()
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
      return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', schedule)
        window.removeEventListener('resize', schedule)
      }
    }, [ids, headingOffset])

    const top = Math.min(...items.map((item) => item.level ?? 2))
    return (
      <View ref={ref} render="nav" aria-label={label} gap="2" {...props}>
        {title ? (
          <Text size="sm" weight="semibold">
            {title}
          </Text>
        ) : null}
        <View render="ul" margin={0} padding={0}>
          {items.map((item) => {
            const active = item.id === activeId
            const depth = Math.min(Math.max((item.level ?? 2) - top, 0), indents.length - 1)
            return (
              <View
                key={item.id}
                render="li"
                // The line beside the list, darker beside the current item.
                borderLeftWidth={2}
                borderColor={active ? 'primary' : 'border'}
                paddingLeft={indents[depth]}
                paddingVertical="1"
              >
                <Link
                  href={`#${item.id}`}
                  size="sm"
                  tone={active ? 'primary' : 'muted'}
                  underline="hover"
                  weight={active ? 'medium' : 'normal'}
                  {...(isWeb
                    ? { 'aria-current': active ? 'location' : undefined }
                    : // Always a name: a label left out keeps the last one on native,
                      // so the item before kept "current" after a press.
                      { 'aria-label': active ? `${item.label}, ${currentLabel}` : item.label })}
                  onPress={() => {
                    setActiveId(item.id)
                    onItemPress?.(item)
                  }}
                >
                  {item.label}
                </Link>
              </View>
            )
          })}
        </View>
      </View>
    )
  },
)
