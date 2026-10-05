import {
  Avatar,
  Badge,
  Button,
  Card,
  HStack,
  IconButton,
  RadioGroup,
  Separator,
  Tabs,
  Text,
  VStack,
  toast,
} from '@advui/core'
import { HeartIcon, MinusIcon, PlusIcon, ShoppingCartIcon, StarIcon } from '@advui/icons'
import { useState } from 'react'
import { Image } from 'react-native'
import { View } from 'tamagui'
import { avatarUrl } from './shared'

const images = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=70',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=900&q=70',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=70',
]
const sizes = ['38', '39', '40', '41', '42', '43']

export function ProductScreen() {
  const [image, setImage] = useState(0)
  const [size, setSize] = useState('41')
  const [quantity, setQuantity] = useState(1)
  const [favorite, setFavorite] = useState(false)

  return (
    <VStack
      padding="$4"
      gap="$8"
      width="100%"
      maxWidth="$224"
      marginHorizontal="auto"
      $md={{ padding: '$8', flexDirection: 'row' }}
    >
      {/* flex only in the md row: in the phone column its 0px basis collapses
          the gallery and details in containers without a fixed height. */}
      <VStack gap="$3" $md={{ flex: 1 }}>
        <View
          position="relative"
          borderRadius="$xl"
          overflow="hidden"
          backgroundColor="$muted"
          aspectRatio={1}
        >
          <Image
            source={{ uri: images[image] }}
            style={{ width: '100%', height: '100%' }}
            accessibilityLabel="Red running shoe, side view"
          />
          <Badge variant="destructive" position="absolute" top="$3" left="$3">
            -20%
          </Badge>
        </View>
        <HStack gap="$2">
          {images.map((uri, index) => (
            <View
              key={uri}
              render="button"
              role="button"
              aria-label={`Show image ${index + 1}`}
              aria-pressed={image === index}
              onPress={() => setImage(index)}
              width="$20"
              height="$20"
              borderRadius="$lg"
              overflow="hidden"
              borderWidth={2}
              borderColor={image === index ? '$ring' : 'transparent'}
              padding={0}
              cursor="pointer"
            >
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
            </View>
          ))}
        </HStack>
      </VStack>

      <VStack gap="$5" $md={{ flex: 1 }}>
        <VStack gap="$2">
          <Text size="sm" tone="muted">
            Running · Men
          </Text>
          <Text render="h1" size="3xl" weight="bold" margin={0}>
            Velocity Runner 3
          </Text>
          <HStack gap="$1" aria-label="Rated 4.6 out of 5 from 128 reviews" role="img">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarIcon key={i} size={16} color={i < 4 ? '$warning' : '$borderStrong'} />
            ))}
            <Text size="sm" tone="muted" marginLeft="$1">
              4.6 (128)
            </Text>
          </HStack>
        </VStack>
        <HStack gap="$3" alignItems="baseline">
          <Text size="3xl" weight="bold">
            $119.00
          </Text>
          <Text tone="muted" textDecorationLine="line-through">
            $149.00
          </Text>
        </HStack>
        <Text tone="muted">
          A responsive everyday trainer with a breathable knit upper and a cushioned midsole for
          long runs.
        </Text>
        <VStack gap="$3">
          <Text size="sm" weight="medium" id="size-label">
            Size (EU)
          </Text>
          <RadioGroup
            value={size}
            onValueChange={setSize}
            orientation="horizontal"
            aria-labelledby="size-label"
            flexWrap="wrap"
            gap="$2"
          >
            {sizes.map((s) => (
              <HStack
                key={s}
                gap="$1.5"
                borderWidth={1}
                borderColor={size === s ? '$ring' : '$border'}
                borderRadius="$md"
                paddingHorizontal="$3"
                height="$10"
              >
                <RadioGroup.Item value={s} id={`size-${s}`} size="sm" />
                <Text render="label" htmlFor={`size-${s}`} size="sm">
                  {s}
                </Text>
              </HStack>
            ))}
          </RadioGroup>
        </VStack>
        <HStack gap="$3" flexWrap="wrap">
          <HStack borderWidth={1} borderColor="$input" borderRadius="$md" alignItems="center">
            <IconButton
              aria-label="Decrease quantity"
              icon={<MinusIcon />}
              disabled={quantity <= 1}
              onPress={() => setQuantity((q) => q - 1)}
            />
            <Text
              weight="medium"
              width="$8"
              textAlign="center"
              aria-live="polite"
              aria-label={`Quantity ${quantity}`}
            >
              {quantity}
            </Text>
            <IconButton
              aria-label="Increase quantity"
              icon={<PlusIcon />}
              onPress={() => setQuantity((q) => q + 1)}
            />
          </HStack>
          <Button
            flex={1}
            size="lg"
            icon={<ShoppingCartIcon />}
            onPress={() =>
              toast.success('Added to cart', {
                description: `${quantity} × Velocity Runner 3 (EU ${size})`,
              })
            }
          >
            Add to cart
          </Button>
          <IconButton
            aria-label={favorite ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={favorite}
            variant="outline"
            size="lg"
            icon={<HeartIcon color={favorite ? '$destructive' : undefined} />}
            onPress={() => setFavorite((f) => !f)}
          />
        </HStack>
        <Separator />
        <Tabs defaultValue="details">
          <Tabs.List aria-label="Product information">
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="details" gap="$1">
            <Text size="sm">• Knit upper, recycled materials</Text>
            <Text size="sm">• 8 mm heel-to-toe drop</Text>
            <Text size="sm">• Free returns within 30 days</Text>
          </Tabs.Content>
          <Tabs.Content value="reviews">
            <Card variant="filled">
              <Card.Content gap="$2">
                <HStack gap="$2">
                  <Avatar size="sm" alt="Jackson Lee" src={avatarUrl(12)} />
                  <Text weight="medium" size="sm">
                    Jackson Lee
                  </Text>
                </HStack>
                <Text size="sm">Light and comfortable, great for tempo runs.</Text>
              </Card.Content>
            </Card>
          </Tabs.Content>
        </Tabs>
      </VStack>
    </VStack>
  )
}
