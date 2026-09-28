/**
 * Android: while `open`, the hardware back button (or back gesture) calls
 * `close` instead of going back in the app's navigation. See
 * useBackToClose.native.ts. Browsers have no back button to intercept here
 * (react-native-web's BackHandler only warns), so on web it does nothing.
 */
export function useBackToClose(_open: boolean, _close: () => void) {}
