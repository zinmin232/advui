import { Carousel, Heading, Text, VStack } from '@advui/core'

const news = [
  { title: 'Spring release', body: 'Branch previews and a faster build cache are live.' },
  { title: 'New region', body: 'Projects can now run in Singapore.' },
  { title: 'Office hours', body: 'Ask the team anything, every Thursday at 10:00.' },
]

export default function CarouselAutoplay() {
  return (
    <VStack width="100%" maxWidth="96">
      {/* It waits while the pointer or focus is on it; the first button pauses it. */}
      <Carousel aria-label="News" autoplay={6000} loop>
        {news.map((item) => (
          <Carousel.Item
            key={item.title}
            gap="1"
            padding="5"
            borderRadius="lg"
            backgroundColor="muted"
          >
            <Heading level={3} size="lg">
              {item.title}
            </Heading>
            <Text tone="muted">{item.body}</Text>
          </Carousel.Item>
        ))}
      </Carousel>
    </VStack>
  )
}
