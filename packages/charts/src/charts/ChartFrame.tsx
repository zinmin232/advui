import { useIconColor } from '@advui/icons'
import { type ReactNode, useId, useRef, useState } from 'react'
import { type GetProps, View, VisuallyHidden, XStack, isWeb } from 'tamagui'
import { Button, Text } from '@advui/core'
import { Table } from '@advui/data'

/** One series (a line, a set of bars): the data field it reads and its name. */
export interface ChartSeries<Key extends string = string> {
  key: Key
  label: string
}

export interface ChartLabels {
  showTable: string
  hideTable: string
  /** Ends the plot's name on web. Native has no arrow keys, so it is left out there. */
  keyboardHint: string
}

export const defaultChartLabels: ChartLabels = {
  showTable: 'Show table',
  hideTable: 'Hide table',
  keyboardHint: 'Use the arrow keys to read each value.',
}

/** The chart palette, in its fixed order, as resolved colors. */
export function useChartColors(): string[] {
  // Hooks in a fixed order: one per slot.
  return [
    useIconColor('$chart1'),
    useIconColor('$chart2'),
    useIconColor('$chart3'),
    useIconColor('$chart4'),
    useIconColor('$chart5'),
    useIconColor('$chart6'),
    useIconColor('$chart7'),
    useIconColor('$chart8'),
  ].map((color) => color ?? 'currentColor')
}

/** Axis text, gridlines and the surface, as resolved colors. */
export function useChartInk(surface: string) {
  return {
    text: useIconColor('$mutedForeground') ?? 'currentColor',
    grid: useIconColor('$border') ?? 'currentColor',
    axis: useIconColor('$borderStrong') ?? 'currentColor',
    surface: useIconColor(surface) ?? 'transparent',
  }
}

export interface LegendItem {
  label: string
  color: string
  /** Mirrors the mark: a line for line charts, a square for bars, areas and slices. */
  shape: 'line' | 'square'
  /** Extra text after the label, e.g. a slice's share. */
  detail?: string
}

export interface TooltipContent {
  title: string
  rows: { label: string; value: string; color: string; shape: LegendItem['shape'] }[]
}

export interface ChartFrameProps {
  /** Names the chart (its accessible name and heading). */
  title: string
  description?: string
  legend: LegendItem[]
  /** Plot height in pixels, including the axes. */
  height: number
  /** Fixed plot width; by default the chart fills its container. */
  width?: number
  /** Number of positions the arrow keys step through. */
  count: number
  /** The position under a point in the plot, or null. */
  hitTest: (x: number, y: number, width: number) => number | null
  tooltip: (index: number) => TooltipContent | null
  /** Where the tooltip points, in plot coordinates. */
  anchor: (index: number, width: number) => { x: number; y: number }
  /** Draws the plot at the measured width; `active` is the hovered position. */
  children: (width: number, active: number | null) => ReactNode
  table: { columns: string[]; rows: string[][]; numeric: boolean[] }
  labels?: Partial<ChartLabels>
  frameProps?: GetProps<typeof View>
}

/**
 * The frame every chart shares: title, legend, a measured plot with a
 * tooltip (hover, tap or arrow keys), and a table view of the same data.
 */
export function ChartFrame({
  title,
  description,
  legend,
  height,
  width: fixedWidth,
  count,
  hitTest,
  tooltip,
  anchor,
  children,
  table,
  labels: labelsProp,
  frameProps,
}: ChartFrameProps) {
  const labels = { ...defaultChartLabels, ...labelsProp }
  const [measured, setMeasured] = useState(0)
  const width = fixedWidth ?? measured
  const [active, setActive] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const titleId = useId()
  const tableId = useId()
  const plotRef = useRef<HTMLElement | null>(null)
  const content = active != null ? tooltip(active) : null

  const pointAt = (clientX: number, clientY: number) => {
    const rect = plotRef.current?.getBoundingClientRect()
    if (!rect) return
    setActive(hitTest(clientX - rect.left, clientY - rect.top, width))
  }

  const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
    const last = count - 1
    const moves: Record<string, number> = {
      ArrowRight: Math.min(last, (active ?? -1) + 1),
      ArrowDown: Math.min(last, (active ?? -1) + 1),
      ArrowLeft: Math.max(0, (active ?? count) - 1),
      ArrowUp: Math.max(0, (active ?? count) - 1),
      Home: 0,
      End: last,
    }
    if (event.key in moves && count > 0) {
      event.preventDefault()
      setActive(moves[event.key]!)
    } else if (event.key === 'Escape') setActive(null)
  }

  const point = active != null && width > 0 ? anchor(active, width) : null
  const summary = content
    ? `${content.title}: ${content.rows.map((r) => `${r.label} ${r.value}`).join(', ')}`
    : ''

  return (
    <View
      render="figure"
      margin={0}
      gap="$3"
      width="100%"
      aria-labelledby={titleId}
      {...frameProps}
    >
      <View gap="$1">
        <Text id={titleId} size="sm" weight="semibold">
          {title}
        </Text>
        {description ? (
          <Text size="xs" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>

      {legend.length > 0 ? (
        <XStack flexWrap="wrap" columnGap="$4" rowGap="$1.5">
          {legend.map((item) => (
            <XStack key={item.label} alignItems="center" gap="$1.5">
              <View
                aria-hidden
                backgroundColor={item.color as never}
                width={item.shape === 'line' ? '$3' : '$2.5'}
                height={item.shape === 'line' ? 2 : '$2.5'}
                borderRadius={item.shape === 'line' ? '$full' : '$xs'}
              />
              <Text size="xs" tone="muted">
                {item.label}
                {item.detail ? ` · ${item.detail}` : ''}
              </Text>
            </XStack>
          ))}
        </XStack>
      ) : null}

      <View
        ref={plotRef as never}
        position="relative"
        height={height}
        width={fixedWidth ?? '100%'}
        onLayout={(event: { nativeEvent: { layout: { width: number } } }) =>
          setMeasured(Math.floor(event.nativeEvent.layout.width))
        }
        // The plot is one focusable image; the arrow keys read it point by point.
        role="img"
        aria-label={`${title}.${description ? ` ${description}.` : ''}${isWeb ? ` ${labels.keyboardHint}` : ''}`}
        {...(isWeb
          ? {
              tabIndex: 0,
              onKeyDown,
              onBlur: () => setActive(null),
              onMouseMove: (event: { clientX: number; clientY: number }) =>
                pointAt(event.clientX, event.clientY),
              onMouseLeave: () => setActive(null),
            }
          : {
              accessible: true,
              // Native has no live region here: the reading becomes the plot's value.
              ...(summary && { accessibilityValue: { text: summary } }),
              onPress: (event: { nativeEvent: { locationX: number; locationY: number } }) =>
                setActive(hitTest(event.nativeEvent.locationX, event.nativeEvent.locationY, width)),
            })}
        borderRadius="$sm"
        focusVisibleStyle={{
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 4,
        }}
      >
        {width > 0 ? children(width, active) : null}
        {content && point ? (
          <View
            aria-hidden
            pointerEvents="none"
            position="absolute"
            top={0}
            {...(point.x < width / 2 ? { left: point.x + 12 } : { right: width - point.x + 12 })}
            backgroundColor="$popover"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$md"
            paddingHorizontal="$2.5"
            paddingVertical="$2"
            gap="$1"
            minWidth="$32"
            zIndex={1}
          >
            <Text size="xs" tone="muted">
              {content.title}
            </Text>
            {content.rows.map((row) => (
              <XStack key={row.label} alignItems="center" gap="$2">
                <View
                  backgroundColor={row.color as never}
                  width="$2.5"
                  height={row.shape === 'line' ? 2 : '$2.5'}
                  borderRadius={row.shape === 'line' ? '$full' : '$xs'}
                />
                <Text size="sm" weight="semibold">
                  {row.value}
                </Text>
                <Text size="xs" tone="muted" flexShrink={1}>
                  {row.label}
                </Text>
              </XStack>
            ))}
          </View>
        ) : null}
      </View>
      {/* Outside the plot: an img's contents are hidden from assistive technology. */}
      {isWeb ? <VisuallyHidden aria-live="polite">{summary}</VisuallyHidden> : null}

      <View alignItems="flex-start" gap="$2">
        <Button
          size="sm"
          variant="ghost"
          // Lines the label up with the title above.
          marginLeft="$-3"
          aria-expanded={showTable}
          {...(isWeb && { 'aria-controls': tableId })}
          onPress={() => setShowTable(!showTable)}
        >
          {showTable ? labels.hideTable : labels.showTable}
        </Button>
        {showTable ? (
          <View id={tableId} width="100%">
            <Table aria-label={title} size="sm" minWidth={Math.max(320, table.columns.length * 96)}>
              <Table.Header>
                <Table.Row>
                  {table.columns.map((column, i) => (
                    <Table.Head key={column} align={table.numeric[i] ? 'end' : 'start'}>
                      {column}
                    </Table.Head>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {table.rows.map((row, r) => (
                  <Table.Row key={r}>
                    {row.map((cell, i) => (
                      <Table.Cell key={i} align={table.numeric[i] ? 'end' : 'start'}>
                        {cell}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </View>
        ) : null}
      </View>
    </View>
  )
}
