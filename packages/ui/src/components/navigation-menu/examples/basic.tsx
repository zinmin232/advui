import { NavigationMenu } from '@advui/core'
import { BarChartIcon, FileIcon, GlobeIcon, UsersIcon } from '@advui/icons'

export default function NavigationMenuBasic() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenu.Link href="#" active>
        Home
      </NavigationMenu.Link>
      <NavigationMenu.Item label="Data">
        <NavigationMenu.Link
          href="#"
          icon={<BarChartIcon />}
          description="Who does what, where and when"
        >
          5W dashboard
        </NavigationMenu.Link>
        <NavigationMenu.Link
          href="#"
          icon={<GlobeIcon />}
          description="Place codes for every village"
        >
          Place codes
        </NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Item label="Resources">
        <NavigationMenu.Link href="#" icon={<FileIcon />} description="Assessments and reports">
          Publications
        </NavigationMenu.Link>
        <NavigationMenu.Link href="#" icon={<UsersIcon />} description="Partner organizations">
          Directory
        </NavigationMenu.Link>
      </NavigationMenu.Item>
      <NavigationMenu.Link href="#">About</NavigationMenu.Link>
    </NavigationMenu>
  )
}
