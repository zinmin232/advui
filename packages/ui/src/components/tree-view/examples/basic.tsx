import { TreeView, type TreeNode } from '@advui/core'
import { FileIcon, FolderIcon } from '@advui/icons'

const files: TreeNode[] = [
  {
    id: 'reports',
    label: 'Reports',
    icon: <FolderIcon />,
    children: [
      { id: 'q3', label: 'Q3 summary.pdf', icon: <FileIcon /> },
      {
        id: '5w',
        label: '5W',
        icon: <FolderIcon />,
        children: [
          { id: '5w-jul', label: 'July.xlsx', icon: <FileIcon /> },
          { id: '5w-aug', label: 'August.xlsx', icon: <FileIcon /> },
        ],
      },
    ],
  },
  {
    id: 'maps',
    label: 'Maps',
    icon: <FolderIcon />,
    children: [{ id: 'townships', label: 'Townships.png', icon: <FileIcon /> }],
  },
  { id: 'readme', label: 'README.md', icon: <FileIcon /> },
]

export default function TreeViewBasic() {
  return (
    <TreeView
      aria-label="Files"
      data={files}
      defaultExpanded={['reports']}
      defaultSelected="q3"
      width="100%"
      maxWidth="$72"
    />
  )
}
