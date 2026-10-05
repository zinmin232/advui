import { Video } from '@advui/core'

// The demo clips are published with the docs site, on another origin than
// your app: `crossOrigin` lets the browser load the captions from there.
const media = 'https://zinmin232.github.io/advui/media'

export default function VideoBasic() {
  return (
    <Video
      maxWidth="$144"
      src={`${media}/handwashing.mp4`}
      poster={`${media}/handwashing.jpg`}
      title="Handwashing in five steps"
      crossOrigin="anonymous"
      captions={[
        { src: `${media}/handwashing.en.vtt`, srcLang: 'en', label: 'English', default: true },
      ]}
    />
  )
}
