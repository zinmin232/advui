import { ScrollArea } from '@advui/core'
import { MobileHomeScreen } from '../screens/mobile'

export default function Home() {
  return (
    // avoidKeyboard keeps a focused field above the on-screen keyboard.
    <ScrollArea avoidKeyboard>
      <MobileHomeScreen />
    </ScrollArea>
  )
}
