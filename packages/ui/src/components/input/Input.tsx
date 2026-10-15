import { IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef, useId, useRef, useState } from 'react'
import {
  type GetProps,
  Input as TamaguiInput,
  type TamaguiElement,
  Text,
  View,
  isWeb,
  styled,
  useComposedRefs,
} from 'tamagui'
import { useFieldControl } from '../../hooks/useFieldControl'
import { ariaState } from '../../utils/ariaState'
import { isTextContent } from '../../utils/isTextContent'

/** Box styles shared by text fields and field-like triggers (Select). */
export const fieldBoxStyle = {
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$input',
  borderRadius: '$md',
  // No `transition` on fields: the native animation driver would pass animated
  // style objects to TextInput, which Android rejects.
  hoverStyle: { borderColor: '$borderStrong' },
  focusStyle: { borderColor: '$ring' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 0,
  },
} as const

export const inputBaseStyle = {
  ...fieldBoxStyle,
  fontFamily: '$body',
  color: '$foreground',
  placeholderTextColor: '$placeholderColor',
} as const

export type InputSize = 'sm' | 'md' | 'lg'

const InputFrame = styled(TamaguiInput, {
  name: 'Input',
  ...inputBaseStyle,
  // Android's TextInput adds its own vertical padding, which clips text in
  // the fixed-height sizes (sm most visibly); the height already centers it.
  paddingVertical: 0,

  variants: {
    size: {
      sm: { height: '$8', paddingHorizontal: '$2.5', fontSize: '$2' },
      md: { height: '$10', paddingHorizontal: '$3', fontSize: '$2' },
      lg: { height: '$12', paddingHorizontal: '$4', fontSize: '$3' },
    },
    invalid: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
        focusStyle: { borderColor: '$error' },
        focusVisibleStyle: { outlineColor: '$error' },
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
    // Inside a group the group draws the box, the ring and the dimming.
    grouped: {
      true: {
        flex: 1,
        minWidth: 0,
        height: '100%',
        borderWidth: 0,
        borderRadius: 0,
        backgroundColor: 'transparent',
        opacity: 1,
        focusVisibleStyle: { outlineWidth: 0, outlineStyle: 'none' },
      },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const InputGroupFrame = styled(View, {
  name: 'InputGroup',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$input',
  borderRadius: '$md',
  flexDirection: 'row',
  alignItems: 'stretch',
  // Addon backgrounds stop at the rounded corners.
  overflow: 'hidden',
  hoverStyle: { borderColor: '$borderStrong' },

  variants: {
    size: {
      sm: { height: '$8' },
      md: { height: '$10' },
      lg: { height: '$12' },
    },
    focused: {
      true: {
        borderColor: '$ring',
        hoverStyle: { borderColor: '$ring' },
      },
    },
    invalid: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

// The input's own side padding, and the square an icon or icon button sits in.
const sidePadding = { sm: '$2.5', md: '$3', lg: '$4' } as const
const squareSizes = { sm: '$8', md: '$10', lg: '$12' } as const
const iconSizes = { sm: 14, md: 16, lg: 18 } as const
const fontSizes = { sm: '$2', md: '$2', lg: '$3' } as const

// With slots, these props size and place the group's box rather than the text field.
const boxProps = new Set([
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'backgroundColor',
  'borderColor',
  'borderWidth',
  'borderRadius',
])

// Presses that land on a control inside a slot belong to that control.
const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]'

export interface InputProps extends Omit<GetProps<typeof InputFrame>, 'grouped' | 'size'> {
  size?: InputSize
  /**
   * Inside the field, before the text: an icon, a small button, or short text
   * such as "$". Pass `null` rather than leaving a slot out while it is empty
   * (a clear button before there is text), so the field is not re-created.
   */
  leading?: ReactNode
  /** Inside the field, after the text: an icon, a small button, or short text such as "kg". */
  trailing?: ReactNode
  /** A shaded box joined to the start of the field, such as "https://". */
  leadingAddon?: ReactNode
  /** A shaded box joined to the end of the field, such as ".com". */
  trailingAddon?: ReactNode
}

/**
 * Single-line text field (`<input>` on web, `TextInput` on native).
 * Set `invalid` to mark errors — it sets `aria-invalid` and the error color.
 * `leading`, `trailing` and the addons put icons, buttons or text in and beside it.
 */
export const Input = forwardRef<TamaguiElement, InputProps>(function Input(inputProps, ref) {
  const {
    invalid,
    disabled,
    size = 'md',
    leading,
    trailing,
    leadingAddon,
    trailingAddon,
    ...props
  } = useFieldControl(inputProps)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, inputRef)
  const textId = useId()

  const has = (node: ReactNode) =>
    node !== undefined && node !== null && node !== false && node !== ''
  // Any slot prop, even null, keeps the group: switching between a plain field
  // and a group re-creates the field, which loses focus mid-typing.
  const grouped = [leading, trailing, leadingAddon, trailingAddon].some(
    (node) => node !== undefined,
  )

  const semantics = {
    'aria-invalid': invalid || undefined,
    'aria-disabled': ariaState(disabled),
  }

  if (!grouped) {
    return (
      <InputFrame
        ref={ref}
        size={size}
        invalid={invalid}
        disabled={disabled}
        {...semantics}
        {...props}
      />
    )
  }

  const boxStyle: Record<string, unknown> = {}
  const fieldProps: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    ;(boxProps.has(key) ? boxStyle : fieldProps)[key] = value
  }

  // Text beside the field says what it means ("kg", "https://"), so screen
  // readers hear it with the field: in its description on web, its hint on native.
  const parts = [
    ['leading-addon', leadingAddon],
    ['leading', leading],
    ['trailing', trailing],
    ['trailing-addon', trailingAddon],
  ] as const
  const textParts = parts.filter(([, node]) => has(node) && isTextContent(node))
  const describedBy = [props['aria-describedby'], ...textParts.map(([part]) => `${textId}-${part}`)]
    .filter(Boolean)
    .join(' ')
  // Joined like a description on web: with spaces, after the field's own hint.
  const hint = [props.accessibilityHint, ...textParts.map(([, node]) => [node].flat().join(''))]
    .filter(Boolean)
    .join(' ')

  const focusInput = (event: { target?: unknown }) => {
    if (disabled) return
    const target = event.target as Element | null | undefined
    if (isWeb && target?.closest?.(INTERACTIVE)) return
    ;(inputRef.current as unknown as { focus?: () => void } | null)?.focus?.()
  }

  const text = (
    part: (typeof parts)[number][0],
    node: string | number | Array<string | number>,
  ) => (
    <Text
      {...(isWeb ? { id: `${textId}-${part}` } : { 'aria-hidden': true })}
      fontFamily="$body"
      fontSize={fontSizes[size]}
      color="$mutedForeground"
      numberOfLines={1}
    >
      {node}
    </Text>
  )

  const addon = (part: 'leading-addon' | 'trailing-addon', node: ReactNode) => (
    <View
      justifyContent="center"
      paddingHorizontal={sidePadding[size]}
      backgroundColor="$muted"
      borderColor="$input"
      {...(part === 'leading-addon' ? { borderRightWidth: 1 } : { borderLeftWidth: 1 })}
      onPress={focusInput}
      {...(!isWeb && { accessible: false })}
    >
      {isTextContent(node) ? text(part, node) : node}
    </View>
  )

  const slot = (part: 'leading' | 'trailing', node: ReactNode) =>
    isTextContent(node) ? (
      <View
        justifyContent="center"
        {...(part === 'leading'
          ? { paddingLeft: sidePadding[size], paddingRight: '$1' }
          : { paddingLeft: '$1', paddingRight: sidePadding[size] })}
        onPress={focusInput}
        {...(!isWeb && { accessible: false })}
      >
        {text(part, node)}
      </View>
    ) : (
      <View
        alignItems="center"
        justifyContent="center"
        minWidth={squareSizes[size]}
        paddingHorizontal="$1"
        onPress={focusInput}
        {...(!isWeb && { accessible: false })}
      >
        <IconDefaults size={iconSizes[size]} color="$mutedForeground">
          {node}
        </IconDefaults>
      </View>
    )

  return (
    <InputGroupFrame
      size={size}
      focused={focused}
      invalid={invalid}
      disabled={disabled}
      // The ring a plain field draws on focus (web only, like its focusVisibleStyle).
      {...(isWeb &&
        focused && {
          outlineColor: invalid ? '$error' : '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
        })}
      {...boxStyle}
    >
      {has(leadingAddon) ? addon('leading-addon', leadingAddon) : null}
      {has(leading) ? slot('leading', leading) : null}
      <InputFrame
        ref={composedRef}
        size={size}
        invalid={invalid}
        disabled={disabled}
        grouped
        {...semantics}
        {...fieldProps}
        {...(isWeb
          ? { 'aria-describedby': describedBy || undefined }
          : { accessibilityHint: hint || undefined })}
        // After the spread: a slot provides the space on its side.
        {...(has(leading) && { paddingLeft: 0 })}
        {...(has(trailing) && { paddingRight: 0 })}
        onFocus={(event: never) => {
          setFocused(true)
          ;(props.onFocus as ((event: never) => void) | undefined)?.(event)
        }}
        onBlur={(event: never) => {
          setFocused(false)
          ;(props.onBlur as ((event: never) => void) | undefined)?.(event)
        }}
      />
      {has(trailing) ? slot('trailing', trailing) : null}
      {has(trailingAddon) ? addon('trailing-addon', trailingAddon) : null}
    </InputGroupFrame>
  )
})
