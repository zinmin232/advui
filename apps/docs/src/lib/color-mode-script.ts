export const COLOR_MODE_KEY = 'aui-color-mode'
export const COLOR_MODE_QUERY = '(prefers-color-scheme: dark)'

/**
 * Runs before first paint (inlined in <head> by the root layout) so the page
 * never flashes the wrong theme. Tamagui themes are keyed by the html class.
 */
export const colorModeScript = `(function(){try{var m=localStorage.getItem('${COLOR_MODE_KEY}')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('${COLOR_MODE_QUERY}').matches);var c=document.documentElement.classList;c.remove('t_light','t_dark');c.add(d?'t_dark':'t_light');document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`
