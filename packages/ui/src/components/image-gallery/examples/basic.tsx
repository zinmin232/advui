import { ImageGallery, VStack, type GalleryImage } from '@advui/core'

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=70`
const thumb = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&q=60`

const ids = [
  ['1500530855697-b586d89ba3ee', 'A desert road between red rock canyons', 'Road to the canyon'],
  ['1506744038136-46273834b3fb', 'A lake below forested mountains', undefined],
  ['1469474968028-56623f02e42e', 'Sunlight over a valley of green hills', 'Morning in the valley'],
  ['1441974231531-c6227db76b6e', 'Sun rays through a tall forest', undefined],
  ['1470071459604-3b5ec3a7fe05', 'Misty hills at dawn', undefined],
  ['1426604966848-d7adac402bff', 'A mountain lake with a pine forest', 'Taken on the second day'],
] as const

const images: GalleryImage[] = ids.map(([id, alt, caption]) => ({
  src: photo(id),
  thumbnail: thumb(id),
  alt,
  caption,
}))

export default function ImageGalleryBasic() {
  return (
    <VStack width="100%" maxWidth="$96">
      <ImageGallery images={images} columns={{ base: 2, sm: 4 }} />
    </VStack>
  )
}
