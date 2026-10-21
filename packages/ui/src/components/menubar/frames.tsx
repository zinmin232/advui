import { View, styled } from 'tamagui'

// The bar and its triggers, shared by the web and native menubars.

export const MenubarFrame = styled(View, {
  name: 'Menubar',
  flexDirection: 'row',
  alignItems: 'center',
  gap: "1",
  padding: "1",
  backgroundColor: "background",
  borderWidth: 1,
  borderColor: "border",
  borderRadius: "lg"
})

export const MenubarTriggerFrame = styled(View, {
  name: 'MenubarTrigger',
  flexDirection: 'row',
  alignItems: 'center',
  // Finger-sized targets on touch screens and phones.
minHeight: "8 touchable:11",
  paddingHorizontal: "3",
  borderRadius: "md",
  borderWidth: 0,
  backgroundColor: "transparent hover:accent",
  cursor: 'pointer',
  outlineColor: "focus-visible:ring",
  outlineStyle: "focus-visible:solid",
  outlineWidth: "focus-visible:2px",
  outlineOffset: "focus-visible:-2px",
  variants: {
    open: {
      true: {
        backgroundColor: "accent"
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: "hover:transparent"
      },
    },
  } as const
})
