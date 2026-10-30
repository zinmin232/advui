import { ChevronLeftIcon, ChevronRightIcon } from '@advui/icons'
import { forwardRef, useState } from 'react'
import { AccessibilityInfo } from 'react-native'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { ariaState } from '../../utils/ariaState'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { CheckboxGroup } from '../checkbox-group/CheckboxGroup'
import { IconButton } from '../icon-button/IconButton'
import { ScrollArea } from '../scroll-area/ScrollArea'
import { Text } from '../typography/Text'

export interface TransferListItem {
  value: string
  label: string
  /** Smaller text under the label. */
  description?: string
  /** Stays in its list. */
  disabled?: boolean
}

export interface TransferListLabels {
  /** The source list's name. */
  source: string
  /** The target list's name. */
  target: string
  selectAll: string
  empty: string
  /** Name of the button that moves the checked items into `list`. */
  moveTo: (list: string) => string
  /** Announced after a move. */
  moved: (count: number, list: string) => string
}

const defaultLabels: TransferListLabels = {
  source: 'Available',
  target: 'Selected',
  selectAll: 'Select all',
  empty: 'No items',
  moveTo: (list) => `Move to ${list}`,
  moved: (count, list) => `${count} moved to ${list}`,
}

const TransferListFrame = styled(View, {
  displayName: 'TransferList',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '3',
})

const Panel = styled(View, {
  displayName: 'TransferListPanel',
  flex: 1,
  minWidth: 0,
  alignSelf: 'stretch',
  backgroundColor: 'card',
  borderWidth: 1,
  borderColor: 'border',
  borderRadius: 'lg',
  overflow: 'hidden',
})

// `items` is also Tamagui's shorthand for alignItems.
export interface TransferListProps extends Omit<
  GetProps<typeof TransferListFrame>,
  'children' | 'items' | 'defaultValue'
> {
  /** Every item, in the order both lists show them. */
  items: TransferListItem[]
  /** The values in the target list. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Height of each list: a size token or pixels. Longer lists scroll. */
  listHeight?: GetProps<typeof View>['height']
  disabled?: boolean
  labels?: Partial<TransferListLabels>
}

/**
 * Two lists side by side: check items in one and move them to the other,
 * such as the columns of a table or the members of a team. `value` is what
 * is in the target list.
 */
export const TransferList = forwardRef<TamaguiElement, TransferListProps>(function TransferList(
  {
    items,
    value: valueProp,
    defaultValue = [],
    onValueChange,
    listHeight = '56',
    disabled = false,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // What is checked in each list, waiting to move.
  const [checked, setChecked] = useState<{ source: string[]; target: string[] }>({
    source: [],
    target: [],
  })
  const [message, setMessage] = useState({ text: '', count: 0 })
  const inTarget = new Set(value)
  const lists = {
    source: items.filter((item) => !inTarget.has(item.value)),
    target: items.filter((item) => inTarget.has(item.value)),
  }
  // Checked values that are still in their list: an outside change of
  // `value` can take some away.
  const pending = {
    source: checked.source.filter((v) => lists.source.some((item) => item.value === v)),
    target: checked.target.filter((v) => lists.target.some((item) => item.value === v)),
  }

  const move = (from: 'source' | 'target') => {
    const moving = new Set(pending[from])
    if (disabled || !moving.size) return
    // The target list keeps the order of `items`.
    setValue(
      items
        .filter((item) =>
          from === 'source'
            ? inTarget.has(item.value) || moving.has(item.value)
            : inTarget.has(item.value) && !moving.has(item.value),
        )
        .map((item) => item.value),
    )
    setChecked((current) => ({ ...current, [from]: [] }))
    const text = labels.moved(moving.size, from === 'source' ? labels.target : labels.source)
    if (isWeb) setMessage((current) => ({ text, count: current.count + 1 }))
    else AccessibilityInfo.announceForAccessibility(text)
  }

  const panel = (side: 'source' | 'target') => {
    const list = lists[side]
    const name = labels[side]
    return (
      <Panel>
        <View
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          gap="2"
          paddingHorizontal="3"
          paddingVertical="2"
          borderBottomWidth={1}
          borderColor="border"
        >
          {/* Yoga does not shrink flex items by default: a long name wraps
              instead of pushing the count out of a narrow panel. */}
          <Text size="sm" weight="semibold" flexShrink={1}>
            {name}
          </Text>
          <Text size="xs" tone="muted" flexShrink={0}>
            {pending[side].length}/{list.length}
          </Text>
        </View>
        <ScrollArea
          height={listHeight}
          // The checkboxes are the stops; the browser scrolls to the focused one.
          {...(isWeb && { tabIndex: -1 })}
        >
          <View padding="3">
            {list.length ? (
              <CheckboxGroup
                aria-label={name}
                size="sm"
                gap="2"
                disabled={disabled}
                value={pending[side]}
                onValueChange={(next) => setChecked((current) => ({ ...current, [side]: next }))}
              >
                <CheckboxGroup.SelectAll label={labels.selectAll} />
                {list.map((item) => (
                  <CheckboxGroup.Item
                    key={item.value}
                    value={item.value}
                    label={item.label}
                    description={item.description}
                    disabled={item.disabled}
                  />
                ))}
              </CheckboxGroup>
            ) : (
              <Text size="sm" tone="muted">
                {labels.empty}
              </Text>
            )}
          </View>
        </ScrollArea>
      </Panel>
    )
  }

  const button = (from: 'source' | 'target') => {
    const off = disabled || !pending[from].length
    return (
      <IconButton
        variant="outline"
        size="sm"
        icon={from === 'source' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        aria-label={labels.moveTo(from === 'source' ? labels.target : labels.source)}
        // Not `disabled`: a disabled button drops focus, and it turns off as
        // soon as it has moved the items.
        aria-disabled={ariaState(off)}
        opacity={off ? 0.5 : 1}
        onPress={() => move(from)}
      />
    )
  }

  return (
    <TransferListFrame ref={ref} {...props}>
      {panel('source')}
      <View gap="2">
        {button('source')}
        {button('target')}
      </View>
      {panel('target')}
      {isWeb ? (
        <View role="status" aria-live="polite" {...visuallyHidden}>
          {message.text ? <Text key={message.count}>{message.text}</Text> : null}
        </View>
      ) : null}
    </TransferListFrame>
  )
})
