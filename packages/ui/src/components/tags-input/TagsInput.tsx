import { forwardRef, useRef, useState } from 'react'
import { AccessibilityInfo } from 'react-native'
import {
  type GetProps,
  type TamaguiElement,
  Text,
  View,
  XStack,
  isWeb,
  styled,
} from 'tamagui'
import { type FieldControlProps, useFieldControl } from '../../hooks/useFieldControl'
import { useControllableState } from '../../hooks/useControllableState'
import { ariaState } from '../../utils/ariaState'
import { visuallyHidden } from '../../utils/visuallyHidden'
import { Chip } from '../chip/Chip'
import { fieldBoxStyle } from '../input/Input'
import { TagsInputText } from './TagsInputText'

export const TagsInputFrame = styled(XStack, {
  name: 'TagsInput',
  ...fieldBoxStyle,
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$1.5',
  cursor: 'text',

  variants: {
    // The row of tags and the text box fits inside the field's height, so a
    // field with one row is as tall as an Input of the same size.
    size: {
      sm: { minHeight: '$8', paddingHorizontal: '$1', paddingVertical: '$0.5' },
      md: { minHeight: '$10', paddingHorizontal: '$1.5', paddingVertical: '$1' },
      lg: { minHeight: '$12', paddingHorizontal: '$2', paddingVertical: '$1' },
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

const rowHeights = { sm: '$6', md: '$7', lg: '$8' } as const
const fontSizes = { sm: '$2', md: '$2', lg: '$3' } as const
// The text box's own inset, so its text and placeholder line up with an Input's.
const textInsets = { sm: '$1.5', md: '$1.5', lg: '$2' } as const

export interface TagsInputLabels {
  /** Name of a tag's remove button. Default: "Remove {tag}". */
  remove: (tag: string) => string
  /** Announced when tags are added. Default: "Added {tags}". */
  added: (tags: string[]) => string
  /** Announced when a tag is removed. Default: "Removed {tag}". */
  removed: (tag: string) => string
}

const defaultLabels: TagsInputLabels = {
  remove: (tag) => `Remove ${tag}`,
  added: (tags) => `Added ${tags.join(', ')}`,
  removed: (tag) => `Removed ${tag}`,
}

type FrameProps = GetProps<typeof TagsInputFrame>

export interface TagsInputProps
  extends
    Omit<
      FrameProps,
      'children' | 'size' | 'focused' | 'invalid' | 'disabled' | keyof FieldControlProps
    >,
    FieldControlProps {
  /** The tags, in order (controlled). */
  value?: string[]
  /** Starting tags when uncontrolled. */
  defaultValue?: string[]
  /** Called with the new list when tags are added or removed. */
  onValueChange?: (value: string[]) => void
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  /**
   * Characters that end a tag as you type them, besides Enter. Pasted text is
   * split at them. Default: `[',']`; `[]` leaves only Enter.
   */
  separators?: string[]
  /** Most tags allowed; more are refused. */
  max?: number
  /** Allow the same tag twice. Default: false. */
  allowDuplicates?: boolean
  /** Return false to refuse a tag; it stays in the text box to be fixed. */
  validate?: (tag: string, value: string[]) => boolean
  /** Add the typed text when the field loses focus. Default: true. */
  addOnBlur?: boolean
  /** Web: the field name each tag submits under in a native form. */
  name?: string
  /** Remove-button names and announcements, for translation. */
  labels?: Partial<TagsInputLabels>
}

const none: string[] = []
const defaultSeparators = [',']

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

type KeyEvent = {
  key: string
  preventDefault?: () => void
  nativeEvent?: { isComposing?: boolean }
}

/**
 * A text field that turns what you type into tags: Enter or a separator
 * (comma by default) adds one, each tag is a chip with a remove button, and
 * Backspace in the empty text box removes the last. Use Multi Select instead
 * when the choices come from a fixed list.
 */
export const TagsInput = forwardRef<TamaguiElement, TagsInputProps>(
  function TagsInput(tagsProps, ref) {
    const {
      value: valueProp,
      defaultValue = none,
      onValueChange,
      placeholder,
      size = 'md',
      separators = defaultSeparators,
      max,
      allowDuplicates = false,
      validate,
      addOnBlur = true,
      name,
      labels: labelsProp,
      invalid = false,
      disabled = false,
      id,
      'aria-label': ariaLabel,
      'aria-describedby': describedBy,
      'aria-required': required,
      accessibilityHint,
      ...props
    } = useFieldControl(tagsProps)
    const labels = { ...defaultLabels, ...labelsProp }
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue,
      onChange: onValueChange,
    })
    const [text, setTextState] = useState('')
    // The text as of the last change: native can report one return key press
    // twice (key press and submit), and the second must not add the tag again.
    const textRef = useRef('')
    const setText = (next: string) => {
      textRef.current = next
      setTextState(next)
    }
    const [focused, setFocused] = useState(false)
    const [message, setMessage] = useState({ text: '', count: 0 })
    const inputRef = useRef<HTMLInputElement | null>(null)

    const announce = (next: string) => {
      if (isWeb) setMessage((current) => ({ text: next, count: current.count + 1 }))
      else AccessibilityInfo.announceForAccessibility(next)
    }

    /** Adds what it can and returns the tags it refused. */
    const add = (parts: string[]) => {
      const next = [...value]
      const added: string[] = []
      const refused: string[] = []
      for (const part of parts) {
        const tag = part.trim()
        if (!tag) continue
        const fits = max === undefined || next.length < max
        const fresh = allowDuplicates || !next.includes(tag)
        if (fits && fresh && (validate?.(tag, next) ?? true)) {
          next.push(tag)
          added.push(tag)
        } else {
          refused.push(tag)
        }
      }
      if (added.length) {
        setValue(next)
        announce(labels.added(added))
      }
      return refused
    }

    const commit = () => {
      const pending = textRef.current
      if (!pending.trim()) return false
      setText(add([pending]).length ? pending : '')
      return true
    }

    const remove = (index: number) => {
      const tag = value[index]
      if (tag === undefined) return
      setValue(value.filter((_, i) => i !== index))
      announce(labels.removed(tag))
    }

    const splitter = separators.length ? new RegExp(separators.map(escape).join('|')) : null

    const onChangeText = (input: string) => {
      const parts = splitter ? input.split(splitter) : [input]
      if (parts.length === 1) {
        // Space after a separator would only push the next tag along.
        setText(textRef.current || input.trim() ? input : '')
        return
      }
      // Typing adds one character at a time; more at once is a paste, and a
      // pasted list adds its last part too.
      const pasted = input.length - textRef.current.length > 1
      const rest = pasted ? '' : parts.pop()!.trimStart()
      const refused = add(parts)
      setText([...refused, rest].filter(Boolean).join(`${separators[0]} `))
    }

    const onKeyDown = (event: KeyEvent) => {
      // Enter that confirms an input method's composition (Chinese, Japanese) is not ours.
      if (event.nativeEvent?.isComposing) return
      if (event.key === 'Enter') {
        // An empty text box lets Enter through, so it can submit a form.
        if (commit()) event.preventDefault?.()
      } else if (event.key === 'Backspace' && !textRef.current && value.length) {
        remove(value.length - 1)
      }
    }

    const focusInput = (event: { target?: unknown }) => {
      if (disabled) return
      const target = event.target as Element | null | undefined
      if (isWeb && target?.closest?.('button')) return
      inputRef.current?.focus()
    }

    return (
      <TagsInputFrame
        ref={ref}
        size={size}
        focused={focused}
        invalid={invalid}
        disabled={disabled}
        {...props}
        // The ring an Input draws on focus (web only, like its focusVisibleStyle).
        {...(isWeb &&
          focused && {
            outlineColor: invalid ? '$error' : '$ring',
            outlineStyle: 'solid',
            outlineWidth: 2,
          })}
        onPress={focusInput}
        {...(isWeb
          ? {
              // Presses on the box and on remove buttons keep focus in the
              // text box, so its blur does not add half-typed text.
              onMouseDown: (event: { target: unknown; preventDefault: () => void }) => {
                if (event.target !== inputRef.current) event.preventDefault()
              },
            }
          : { accessible: false })}
      >
        {value.map((tag, index) => (
          <Chip
            key={`${index}-${tag}`}
            height={rowHeights[size]}
            disabled={disabled}
            onRemove={() => {
              remove(index)
              // The button is gone; the text box is the next place to work.
              if (isWeb) inputRef.current?.focus()
            }}
            removeLabel={labels.remove(tag)}
          >
            {tag}
          </Chip>
        ))}
        <TagsInputText
          ref={inputRef as never}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-required={required}
          aria-invalid={invalid || undefined}
          aria-disabled={ariaState(disabled)}
          accessibilityHint={accessibilityHint}
          disabled={disabled}
          placeholder={placeholder}
          height={rowHeights[size]}
          paddingHorizontal={textInsets[size]}
          fontSize={fontSizes[size]}
          autoCapitalize="none"
          autoCorrect={false}
          // Return adds the tag and keeps the keyboard open.
          submitBehavior="submit"
          value={text}
          onChangeText={onChangeText}
          onKeyDown={onKeyDown as never}
          // Native: return arrives as a submit (web reads it in onKeyDown).
          {...(!isWeb && { onSubmitEditing: commit })}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (addOnBlur) commit()
          }}
        />
        {isWeb ? (
          <>
            <View role="status" aria-live="polite" {...visuallyHidden}>
              {message.text ? <Text key={message.count}>{message.text}</Text> : null}
            </View>
            {name
              ? value.map((tag, index) => (
                  <input key={`${index}-${tag}`} type="hidden" name={name} value={tag} />
                ))
              : null}
          </>
        ) : null}
      </TagsInputFrame>
    )
  },
)
