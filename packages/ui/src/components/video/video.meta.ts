import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Video',
  slug: 'video',
  category: 'media',
  description:
    'A video with the platform’s own controls, a fixed aspect ratio, captions on web and an error state.',
  status: 'stable',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Video',
    'VideoProps',
    'VideoCaptionTrack',
    'VideoLabels',
    'setVideoView',
    'getVideoView',
    'NativeVideoViewProps',
  ],
  files: [
    'components/video/Video.tsx',
    'components/video/Video.native.tsx',
    'components/video/shared.tsx',
    'components/video/index.ts',
  ],
  keywords: ['video', 'player', 'movie', 'clip', 'captions', 'subtitles', 'media'],
  usage: `import { Video } from '@advui/core'

<Video
  src="https://example.org/training/handwashing.mp4"
  poster="https://example.org/training/handwashing.jpg"
  title="Handwashing in five steps"
  captions={[{ src: '/captions/handwashing.en.vtt', srcLang: 'en', label: 'English', default: true }]}
/>

// iOS and Android: register a player once at app start (see Platform notes).
import { setVideoView } from '@advui/core'
import { VideoView, useVideoPlayer } from 'expo-video'`,
  parts: [
    {
      name: 'Video',
      description: 'Also takes View props (`maxWidth`, `borderRadius`…) for the frame.',
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
          description: 'Accessible name. Say what the video shows.',
        },
        { name: 'poster', type: 'string', description: 'Image shown before playback (web).' },
        {
          name: 'captions',
          type: 'VideoCaptionTrack[]',
          description:
            'WebVTT tracks: `src`, `srcLang`, `label`, `kind` (`captions` or `subtitles`), `default`. Web.',
        },
        { name: 'ratio', type: 'number', default: '16 / 9', description: 'Width / height.' },
        {
          name: 'autoPlay',
          type: 'boolean',
          default: 'false',
          description: 'Starts playing, muted (browsers block autoplay with sound).',
        },
        { name: 'muted', type: 'boolean', default: '`autoPlay`', description: 'No sound.' },
        { name: 'loop', type: 'boolean', default: 'false', description: 'Plays again at the end.' },
        {
          name: 'controls',
          type: 'boolean',
          default: 'true',
          description: 'The platform’s play, seek, volume and full-screen controls.',
        },
        {
          name: 'onEnded',
          type: '() => void',
          description: 'Called when playback reaches the end.',
        },
        {
          name: 'onError',
          type: '() => void',
          description: 'Called when the video fails to load or play.',
        },
        {
          name: 'labels',
          type: 'Partial<VideoLabels>',
          description: 'Error text, for translation.',
        },
      ],
      children: { accepts: 'none' },
    },
    {
      name: 'setVideoView',
      kind: 'function',
      description:
        'Registers the native player: a component that takes `NativeVideoViewProps` (`source`, `autoPlay`, `muted`, `loop`, `controls`, `accessibilityLabel`, `onEnded`, `onError`, `style`). Call it once at app start.',
      props: [],
    },
  ],
  examples: [
    { name: 'basic', title: 'Video with a poster' },
    { name: 'muted-loop', title: 'Square, muted and looping' },
  ],
  accessibility: [
    'The platform controls are keyboard and screen-reader accessible: `<video controls>` on web, the native player on iOS and Android.',
    '`title` names the video. Add `captions` whenever it has speech: they are required by WCAG 1.2.2, and many viewers watch without sound.',
    'Avoid `autoPlay` for anything longer than a few seconds; if you use it, keep `controls` so it can be paused.',
    'When the video cannot be played, a message replaces it.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the player’s controls (web).' },
    { keys: 'Space', action: 'Play or pause, on the focused control.' },
  ],
  responsive: 'Fills its container’s width and keeps `ratio`; set `maxWidth` to limit it.',
  platformNotes: {
    web: 'A `<video>` element with `playsInline` (no forced full screen on iPhone Safari) and `preload="metadata"`.',
    ios: 'Uses the player registered with `setVideoView`, e.g. a wrapper around `expo-video` (see the Expo playground’s `_layout.tsx`). Without one it shows the error message and warns in development. `poster` and `captions` are web only.',
    android: 'Same as iOS.',
  },
  related: ['audio-player', 'image', 'aspect-ratio'],
})
