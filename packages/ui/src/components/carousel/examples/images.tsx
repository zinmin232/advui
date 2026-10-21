import { Carousel, Image, Text, VStack } from '@advui/core'

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=70`

const photos = [
  ['1500530855697-b586d89ba3ee', 'A desert road between red rock canyons', 'Road to the canyon'],
  ['1506744038136-46273834b3fb', 'A lake below forested mountains', 'The lake at noon'],
  ['1469474968028-56623f02e42e', 'Sunlight over a valley of green hills', 'Morning in the valley'],
  ['1470071459604-3b5ec3a7fe05', 'Misty hills at dawn', 'Last day, before sunrise'],
] as const

export default function CarouselImages() {
  return (
    <VStack width="100%" maxWidth="128">
      <Carousel aria-label="Trip photos" loop>
        {photos.map(([id, alt, caption]) => (
          <Carousel.Item key={id} gap="2">
            <Image src={photo(id)} alt={alt} ratio={16 / 9} width="100%" borderRadius="lg" />
            <Text size="sm" tone="muted">
              {caption}
            </Text>
          </Carousel.Item>
        ))}
      </Carousel>
    </VStack>
  )
}
