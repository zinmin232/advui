import { Button, Checkbox, Drawer, HStack, Label, Text, VStack, toast } from '@advui/core'
import { FilterIcon } from '@advui/icons'
import { useState } from 'react'

const categories = ['Laptops', 'Phones', 'Tablets', 'Monitors', 'Accessories']

export default function DrawerFilters() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(['Laptops'])
  const toggle = (name: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, name] : current.filter((item) => item !== name),
    )
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" icon={<FilterIcon />}>
          Filters
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the product list.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <Text size="sm" weight="semibold">
            Category
          </Text>
          <VStack gap="$3">
            {categories.map((name) => {
              const id = `drawer-${name.toLowerCase()}`
              return (
                <HStack key={name} gap="$2" alignItems="center">
                  <Checkbox
                    id={id}
                    checked={selected.includes(name)}
                    onCheckedChange={(checked) => toggle(name, checked === true)}
                  />
                  <Label htmlFor={id}>{name}</Label>
                </HStack>
              )
            })}
          </VStack>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="outline" onPress={() => setSelected([])}>
            Clear
          </Button>
          <Button
            onPress={() => {
              setOpen(false)
              toast.success(
                selected.length ? `Showing ${selected.join(', ')}` : 'Showing all categories',
              )
            }}
          >
            Apply
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
