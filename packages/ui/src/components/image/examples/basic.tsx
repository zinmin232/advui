import { Image } from '@advui/core'

export default function ImageBasic() {
  return (
    <Image
      src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=70"
      alt="Sunlight over a valley of green hills"
      ratio={16 / 9}
      borderRadius="$lg"
      width="100%"
      maxWidth="$96"
    />
  )
}
