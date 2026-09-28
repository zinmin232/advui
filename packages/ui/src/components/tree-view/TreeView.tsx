import { ChevronRightIcon, IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { Text } from '../typography/Text'

export interface TreeNode {
  id: string
  /** Text of the item; also its accessible name and the type-ahead key. */
  label: string
  /** Icon before the label, e.g. a folder or file. */
  icon?: ReactNode
  children?: TreeNode[]
  disabled?: boolean
}

interface VisibleNode {
  node: TreeNode
  level: number
  parentId: string | null
  posInSet: number
  setSize: number
}

/** The nodes a user can see, in order: roots, plus the children of expanded nodes. */
export function flattenTree(nodes: TreeNode[], expanded: ReadonlySet<string>): VisibleNode[] {
  const out: VisibleNode[] = []
  const walk = (list: TreeNode[], level: number, parentId: string | null) => {
    list.forEach((node, index) => {
      out.push({ node, level, parentId, posInSet: index + 1, setSize: list.length })
      if (node.children?.length && expanded.has(node.id)) walk(node.children, level + 1, node.id)
    })
  }
  walk(nodes, 1, null)
  return out
}

const TreeFrame = styled(View, {
  name: 'TreeView',
  role: 'tree',
  flexDirection: 'column',
  gap: '$0.5',
})

const TreeItemFrame = styled(View, {
  name: 'TreeItem',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1.5',
  minHeight: '$9',
  // 44pt touch targets on phones and tablets.
  $touchable: { minHeight: '$11' },
  paddingHorizontal: '$2',
  borderRadius: '$md',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: -2,
  },

  variants: {
    selected: {
      true: {
        backgroundColor: '$primarySoft',
        hoverStyle: { backgroundColor: '$primarySoftHover' },
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        hoverStyle: { backgroundColor: 'transparent' },
      },
    },
  } as const,
})

export interface TreeViewProps extends Omit<GetProps<typeof TreeFrame>, 'children' | 'onPress'> {
  data: TreeNode[]
  /** Names the tree. Required unless `aria-labelledby` is set. */
  'aria-label'?: string
  /** Ids of open branches (controlled). */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Id of the selected item (controlled). */
  selected?: string | null
  defaultSelected?: string | null
  onSelectedChange?: (id: string | null) => void
  /** Called when an item is activated (press, Enter or Space). */
  onNodePress?: (node: TreeNode) => void
}

/**
 * A hierarchy of items that open and close, such as folders, a sitemap or
 * an organization chart. Follows the WAI-ARIA tree pattern: one Tab stop,
 * arrow keys to move, open and close.
 */
export const TreeView = forwardRef<TamaguiElement, TreeViewProps>(function TreeView(
  {
    data,
    expanded: expandedProp,
    defaultExpanded = [],
    onExpandedChange,
    selected: selectedProp,
    defaultSelected = null,
    onSelectedChange,
    onNodePress,
    ...props
  },
  ref,
) {
  const [expandedIds, setExpandedIds] = useControllableState({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  })
  const [selected, setSelected] = useControllableState<string | null>({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
  })
  const expanded = new Set(expandedIds)
  const visible = flattenTree(data, expanded)

  const [focusedId, setFocusedId] = useState<string | null>(null)
  const pendingFocus = useRef(false)
  const itemRefs = useRef(new Map<string, HTMLElement>())
  // The one item in the Tab order: the focused one, else the selected, else the first.
  const tabId =
    [focusedId, selected].find((id) => id && visible.some((v) => v.node.id === id)) ??
    visible[0]?.node.id

  useEffect(() => {
    if (!pendingFocus.current || !focusedId) return
    pendingFocus.current = false
    itemRefs.current.get(focusedId)?.focus()
  }, [focusedId, expandedIds])

  const setOpen = (id: string, open: boolean) => {
    if (open === expanded.has(id)) return
    setExpandedIds(open ? [...expandedIds, id] : expandedIds.filter((e) => e !== id))
  }

  const activate = (node: TreeNode) => {
    if (node.disabled) return
    setSelected(node.id)
    onNodePress?.(node)
  }

  const moveFocus = (id: string | undefined) => {
    if (!id) return
    pendingFocus.current = true
    setFocusedId(id)
  }

  type ItemKeyEvent = {
    key: string
    preventDefault: () => void
    ctrlKey?: boolean
    metaKey?: boolean
  }
  const onItemKeyDown = (index: number, event: ItemKeyEvent) => {
    const item = visible[index]!
    const { node } = item
    const hasChildren = !!node.children?.length
    const open = expanded.has(node.id)
    const handled = () => event.preventDefault()
    switch (event.key) {
      case 'ArrowDown':
        handled()
        return moveFocus(visible[index + 1]?.node.id)
      case 'ArrowUp':
        handled()
        return moveFocus(visible[index - 1]?.node.id)
      case 'Home':
        handled()
        return moveFocus(visible[0]?.node.id)
      case 'End':
        handled()
        return moveFocus(visible.at(-1)?.node.id)
      case 'ArrowRight':
        handled()
        if (!hasChildren) return
        if (!open) return setOpen(node.id, true)
        return moveFocus(visible[index + 1]?.node.id)
      case 'ArrowLeft':
        handled()
        if (hasChildren && open) return setOpen(node.id, false)
        return moveFocus(item.parentId ?? undefined)
      case 'Enter':
      case ' ':
        handled()
        return activate(node)
      default: {
        // Type-ahead: jump to the next item whose label starts with the letter.
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey) return
        const letter = event.key.toLowerCase()
        const order = [...visible.slice(index + 1), ...visible.slice(0, index)]
        const match = order.find((v) => v.node.label.toLowerCase().startsWith(letter))
        if (match) {
          handled()
          moveFocus(match.node.id)
        }
      }
    }
  }

  return (
    <TreeFrame ref={ref} {...props}>
      {visible.map((item, index) => (
        <TreeItem
          key={item.node.id}
          item={item}
          open={expanded.has(item.node.id)}
          selected={selected === item.node.id}
          tabbable={tabId === item.node.id}
          itemRef={(node) => {
            if (node) itemRefs.current.set(item.node.id, node)
            else itemRefs.current.delete(item.node.id)
          }}
          onPress={() => {
            const { node } = item
            if (node.disabled) return
            setFocusedId(node.id)
            if (node.children?.length) setOpen(node.id, !expanded.has(node.id))
            activate(node)
          }}
          onKeyDown={(event) => onItemKeyDown(index, event)}
          onFocus={() => setFocusedId(item.node.id)}
        />
      ))}
    </TreeFrame>
  )
})

function TreeItem({
  item,
  open,
  selected,
  tabbable,
  itemRef,
  onPress,
  onKeyDown,
  onFocus,
}: {
  item: VisibleNode
  open: boolean
  selected: boolean
  tabbable: boolean
  itemRef: (node: HTMLElement | null) => void
  onPress: () => void
  onKeyDown: (event: { key: string; preventDefault: () => void }) => void
  onFocus: () => void
}) {
  const { node, level, posInSet, setSize } = item
  const hasChildren = !!node.children?.length
  const disabled = !!node.disabled
  const ripple = useRipple({ color: '$foreground', disabled })
  return (
    <TreeItemFrame
      ref={itemRef as never}
      selected={selected}
      disabled={disabled}
      {...(isWeb
        ? {
            role: 'treeitem',
            'aria-level': level,
            'aria-posinset': posInSet,
            'aria-setsize': setSize,
            tabIndex: tabbable ? 0 : -1,
            onKeyDown,
            onFocus,
          }
        : // React Native has no tree roles: each item is a button that
          // reports whether it is open and selected.
          { accessible: true, role: 'button', 'aria-label': node.label })}
      {...(hasChildren && { 'aria-expanded': open })}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onPress={onPress}
      {...(ripple.active && { pressStyle: { backgroundColor: 'transparent' } })}
      {...ripple.props}
    >
      {ripple.element}
      {/* One indent per level, from the spacing scale. */}
      {Array.from({ length: level - 1 }, (_, i) => (
        <View key={i} width="$4" aria-hidden />
      ))}
      <View width="$4" alignItems="center" aria-hidden {...(open && { rotate: '90deg' })}>
        {hasChildren ? <ChevronRightIcon size={14} color="$mutedForeground" /> : null}
      </View>
      {node.icon ? (
        <View aria-hidden>
          <IconDefaults size={16} color={selected ? '$primarySoftForeground' : '$mutedForeground'}>
            {node.icon}
          </IconDefaults>
        </View>
      ) : null}
      <Text
        size="sm"
        flexShrink={1}
        numberOfLines={1}
        color={selected ? '$primarySoftForeground' : '$foreground'}
        {...(selected && { weight: 'medium' as const })}
      >
        {node.label}
      </Text>
    </TreeItemFrame>
  )
}
