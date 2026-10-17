import { View, styled } from 'tamagui'

// The bar and its triggers, shared by the web and native menubars.

export const MenubarFrame = styled(View, {
  name: 'Menubar',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  padding: '$1',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$lg',
})

export const MenubarTriggerFrame = styled(View, {
  name: 'MenubarTrigger',
  flexDirection: 'row',
  alignItems: 'center',
  minHeight: '$8',
  paddingHorizontal: '$3',
  borderRadius: '$md',
  borderWidth: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: -2,
  },
  // Finger-sized targets on touch screens and phones.
  $touchable: { minHeight: '$11' },

  variants: {
    open: {
      true: { backgroundColor: '$accent' },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', hoverStyle: { backgroundColor: 'transparent' } },
    },
  } as const,
})
