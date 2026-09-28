import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from '@advui/icons'
import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { Button } from '../button/Button'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'

export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

const range = (start: number, end: number) =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i)

/**
 * The page numbers and gaps to show for `page` of `count`. The number of
 * items stays the same while paging, so the buttons do not jump around.
 *
 * @example getPaginationItems(6, 10) // [1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 10]
 */
export function getPaginationItems(
  page: number,
  count: number,
  { siblings = 1, boundaries = 1 }: { siblings?: number; boundaries?: number } = {},
): PaginationItem[] {
  const startPages = range(1, Math.min(boundaries, count))
  const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count)
  const siblingsStart = Math.max(
    Math.min(page - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  )
  return [
    ...startPages,
    ...(siblingsStart > boundaries + 2
      ? (['start-ellipsis'] as const)
      : boundaries + 1 < count - boundaries
        ? [boundaries + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaries - 1
      ? (['end-ellipsis'] as const)
      : count - boundaries > boundaries
        ? [count - boundaries]
        : []),
    ...endPages,
  ]
}

const PaginationFrame = styled(View, {
  name: 'Pagination',
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$1',
  '$max-xs': { gap: '$0.5' },
})

export interface PaginationLabels {
  previous: string
  next: string
  /** Name of a page button. Default: "Page 3". */
  page: (page: number) => string
  /** The compact variant's text. Default: "Page 3 of 10". */
  status: (page: number, count: number) => string
}

const defaultLabels: PaginationLabels = {
  previous: 'Previous page',
  next: 'Next page',
  page: (page) => `Page ${page}`,
  status: (page, count) => `Page ${page} of ${count}`,
}

export interface PaginationProps extends Omit<GetProps<typeof PaginationFrame>, 'children'> {
  /** Number of pages. */
  count: number
  /** Current page, from 1 (controlled). */
  page?: number
  /** Initial page when uncontrolled. Default: 1. */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Pages shown on each side of the current one. Default: 1. */
  siblings?: number
  /** Pages always shown at the start and the end. Default: 1. */
  boundaries?: number
  /** `compact` shows "Page 3 of 10" between the arrows instead of page numbers. */
  variant?: 'full' | 'compact'
  size?: 'sm' | 'md'
  disabled?: boolean
  /** Names the navigation landmark. Default: "Pagination". */
  'aria-label'?: string
  /** Button names and the compact text, for translation. */
  labels?: Partial<PaginationLabels>
}

/**
 * Moves between the pages of a long list or table: previous and next
 * buttons around the page numbers, with gaps for skipped ranges.
 */
export const Pagination = forwardRef<TamaguiElement, PaginationProps>(function Pagination(
  {
    count,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    siblings = 1,
    boundaries = 1,
    variant = 'full',
    size = 'md',
    disabled = false,
    'aria-label': ariaLabel = 'Pagination',
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const labels = { ...defaultLabels, ...labelsProp }
  const pages = Math.max(1, count)
  const [rawPage, setPage] = useControllableState({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  })
  const page = Math.min(Math.max(1, rawPage), pages)
  const buttonSize = size === 'sm' ? '$8' : '$10'
  // On narrow phones the default size drops to the small one, so a full
  // pager fits on one line. Media props are CSS on web: safe to server-render.
  const narrow = { '$max-xs': { width: '$8', height: '$8' } } as const
  const narrowPage = { '$max-xs': { minWidth: '$8', height: '$8' } } as const

  return (
    <View ref={ref} render="nav" aria-label={ariaLabel} {...(!isWeb && { role: 'navigation' })}>
      <PaginationFrame render="ul" margin={0} padding={0} {...props}>
        <View render="li">
          <IconButton
            size={size}
            {...narrow}
            icon={<ChevronLeftIcon />}
            aria-label={labels.previous}
            disabled={disabled || page <= 1}
            onPress={() => setPage(page - 1)}
          />
        </View>
        {variant === 'compact' ? (
          <View render="li" paddingHorizontal="$2">
            <Text size="sm" tone="muted" aria-live="polite">
              {labels.status(page, pages)}
            </Text>
          </View>
        ) : (
          getPaginationItems(page, pages, { siblings, boundaries }).map((item) =>
            typeof item === 'number' ? (
              <View key={item} render="li">
                <Button
                  size={size === 'sm' ? 'sm' : 'md'}
                  variant={item === page ? 'outline' : 'ghost'}
                  minWidth={buttonSize}
                  {...narrowPage}
                  paddingHorizontal="$2"
                  aria-label={labels.page(item)}
                  disabled={disabled}
                  // Native has no aria-current; a selected button says "selected".
                  {...(item === page &&
                    (isWeb ? { 'aria-current': 'page' as const } : { 'aria-selected': true }))}
                  onPress={() => setPage(item)}
                >
                  {String(item)}
                </Button>
              </View>
            ) : (
              <View
                key={item}
                render="li"
                aria-hidden
                width={buttonSize}
                height={buttonSize}
                {...narrow}
                alignItems="center"
                justifyContent="center"
              >
                <MoreHorizontalIcon size={16} color="$mutedForeground" />
              </View>
            ),
          )
        )}
        <View render="li">
          <IconButton
            size={size}
            {...narrow}
            icon={<ChevronRightIcon />}
            aria-label={labels.next}
            disabled={disabled || page >= pages}
            onPress={() => setPage(page + 1)}
          />
        </View>
      </PaginationFrame>
    </View>
  )
})
