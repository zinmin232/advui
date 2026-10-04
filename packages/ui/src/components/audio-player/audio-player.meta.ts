import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Audio Player',
  slug: 'audio-player',
  category: 'media',
  description:
    'Plays a sound with a play button, a seek bar, skip buttons and a speed control, the same on every platform.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'AudioPlayer',
    'AudioPlayerProps',
    'AudioPlayerLabels',
    'formatTime',
    'setAudioEngine',
    'getAudioEngine',
    'AudioEngine',
    'AudioStatus',
    'CreateAudioEngine',
  ],
  files: [
    'components/audio-player/AudioPlayer.tsx',
    'components/audio-player/engine.ts',
    'components/audio-player/index.ts',
  ],
  keywords: ['audio', 'player', 'podcast', 'voice message', 'sound', 'radio', 'media'],
  usage: `import { AudioPlayer } from '@advui/core'

<AudioPlayer src="https://example.org/radio/flood-safety.mp3" title="Flood safety" subtitle="Community radio" />

// iOS and Android: register an engine once at app start (see Platform notes).
import { setAudioEngine } from '@advui/core'
import { createAudioPlayer } from 'expo-audio'`,
  parts: [
    {
      name: 'AudioPlayer',
      description: 'Also takes View props (`maxWidth`…) for the frame.',
      props: [
        {
          name: 'src',
          type: 'string | number',
          required: true,
          description: 'A URL, or `require()` of a bundled file on native.',
        },
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Shown as the heading and names the player.',
        },
        { name: 'subtitle', type: 'string', description: 'A second line: speaker, date, length.' },
        { name: 'artwork', type: 'ReactNode', description: 'An image or icon before the title.' },
        {
          name: 'skip',
          type: 'number',
          default: '10',
          min: 0,
          step: 1,
          description: 'Seconds moved by the skip buttons; 0 hides them.',
        },
        {
          name: 'rates',
          type: 'number[]',
          default: '[1, 1.25, 1.5, 2]',
          description: 'Speeds the speed button cycles through. One speed hides the button.',
        },
        { name: 'autoPlay', type: 'boolean', default: 'false', description: 'Start at once.' },
        { name: 'loop', type: 'boolean', default: 'false', description: 'Play again at the end.' },
        { name: 'onPlay', type: '() => void', description: 'Called when playback starts.' },
        { name: 'onPause', type: '() => void', description: 'Called when playback pauses.' },
        {
          name: 'onEnded',
          type: '() => void',
          description: 'Called when playback reaches the end (not while looping).',
        },
        {
          name: 'labels',
          type: 'Partial<AudioPlayerLabels>',
          description: 'Button names, seek text and the error, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'setAudioEngine',
      kind: 'function',
      description:
        'Registers the native engine: `(source, onStatus) => AudioEngine`, where the engine has `play`, `pause`, `seek(seconds)`, `setRate`, `setLoop` and `release`, and reports `AudioStatus` changes through `onStatus`. Call it once at app start.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Audio player' },
    {
      name: 'compact',
      title: 'Voice message',
      description: 'An icon, and no skip or speed buttons.',
    },
  ],
  accessibility: [
    'On web the player is a `group` named by its title, so "Play" and "Seek" are read in context.',
    'The play button’s name follows the state ("Play" / "Pause"). The seek bar is a slider whose value reads "1:05 of 3:20"; the time labels beside it are hidden to avoid reading them twice.',
    'The speed button says its value ("Playback speed, 1.5×"). Skip buttons say how far they move.',
    'If the sound cannot be played, the controls are disabled and a message replaces the subtitle.',
    'Provide a transcript nearby for speech: people who cannot hear it, or cannot play sound, need one (WCAG 1.2.1).',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Play, speed, skip back, seek bar, skip forward.' },
    { keys: 'Enter / Space', action: 'Press the focused button.' },
    {
      keys: 'Arrow keys',
      action: 'Move the seek bar by one second (Page Up / Down: bigger steps).',
    },
  ],
  responsive: 'Fills its container’s width; set `maxWidth` to limit it.',
  platformNotes: {
    web: 'Uses an `Audio` element that is not added to the page, with `preload="metadata"` so the length shows before playing.',
    ios: 'Uses the engine registered with `setAudioEngine`, e.g. a wrapper around `expo-audio` (see the Expo playground’s `_layout.tsx`). Without one the controls are disabled and it warns in development.',
    android: 'Same as iOS.',
  },
  related: ['video', 'slider', 'icon-button'],
})
