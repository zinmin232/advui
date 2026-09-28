import { describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen } from '../../../test/utils'
import { TreeView, flattenTree, type TreeNode } from './TreeView'

const data: TreeNode[] = [
  {
    id: 'reports',
    label: 'Reports',
    children: [
      { id: 'q3', label: 'Q3 summary' },
      { id: '5w', label: '5W', children: [{ id: 'jul', label: 'July' }] },
    ],
  },
  { id: 'maps', label: 'Maps', children: [{ id: 'townships', label: 'Townships' }] },
  { id: 'readme', label: 'Readme', disabled: true },
]

describe('flattenTree', () => {
  it('lists roots and the children of open branches with their position', () => {
    const visible = flattenTree(data, new Set(['reports']))
    expect(visible.map((v) => [v.node.id, v.level, v.posInSet, v.setSize])).toEqual([
      ['reports', 1, 1, 3],
      ['q3', 2, 1, 2],
      ['5w', 2, 2, 2],
      ['maps', 1, 2, 3],
      ['readme', 1, 3, 3],
    ])
  })
})

describe('TreeView', () => {
  it('exposes the tree roles, levels and states', () => {
    renderWithProvider(
      <TreeView
        aria-label="Files"
        data={data}
        defaultExpanded={['reports']}
        defaultSelected="q3"
      />,
    )
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument()
    const reports = screen.getByRole('treeitem', { name: 'Reports' })
    expect(reports).toHaveAttribute('aria-expanded', 'true')
    expect(reports).toHaveAttribute('aria-level', '1')
    const q3 = screen.getByRole('treeitem', { name: 'Q3 summary' })
    expect(q3).toHaveAttribute('aria-selected', 'true')
    expect(q3).toHaveAttribute('aria-level', '2')
    expect(q3).toHaveAttribute('aria-posinset', '1')
    expect(q3).toHaveAttribute('aria-setsize', '2')
    expect(screen.getByRole('treeitem', { name: '5W' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('treeitem', { name: 'Readme' })).not.toHaveAttribute('aria-expanded')
    expect(screen.queryByRole('treeitem', { name: 'July' })).not.toBeInTheDocument()
  })

  it('is one Tab stop, on the selected item', async () => {
    const { user } = renderWithProvider(
      <TreeView
        aria-label="Files"
        data={data}
        defaultExpanded={['reports']}
        defaultSelected="q3"
      />,
    )
    await user.tab()
    expect(screen.getByRole('treeitem', { name: 'Q3 summary' })).toHaveFocus()
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it('moves, opens and closes with the arrow keys', async () => {
    const onExpandedChange = vi.fn()
    const { user } = renderWithProvider(
      <TreeView aria-label="Files" data={data} onExpandedChange={onExpandedChange} />,
    )
    const item = (name: string) => screen.getByRole('treeitem', { name })
    act(() => item('Reports').focus())
    await user.keyboard('{ArrowRight}')
    expect(onExpandedChange).toHaveBeenLastCalledWith(['reports'])
    expect(item('Reports')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(item('Q3 summary')).toHaveFocus()
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}')
    expect(item('July')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(item('5W')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(item('5W')).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{ArrowLeft}')
    expect(item('Reports')).toHaveFocus()
    await user.keyboard('{End}')
    expect(item('Readme')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(item('Reports')).toHaveFocus()
    await user.keyboard('m')
    expect(item('Maps')).toHaveFocus()
  })

  it('selects with Enter, Space and a press; a press also opens a branch', async () => {
    const onSelectedChange = vi.fn()
    const onNodePress = vi.fn()
    const { user } = renderWithProvider(
      <TreeView
        aria-label="Files"
        data={data}
        onSelectedChange={onSelectedChange}
        onNodePress={onNodePress}
      />,
    )
    await user.click(screen.getByRole('treeitem', { name: 'Maps' }))
    expect(onSelectedChange).toHaveBeenLastCalledWith('maps')
    expect(screen.getByRole('treeitem', { name: 'Maps' })).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onSelectedChange).toHaveBeenLastCalledWith('townships')
    expect(onNodePress).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'townships' }))
  })

  it('does not select a disabled item', async () => {
    const onSelectedChange = vi.fn()
    const { user } = renderWithProvider(
      <TreeView aria-label="Files" data={data} onSelectedChange={onSelectedChange} />,
    )
    const readme = screen.getByRole('treeitem', { name: 'Readme' })
    expect(readme).toHaveAttribute('aria-disabled', 'true')
    await user.click(readme)
    expect(onSelectedChange).not.toHaveBeenCalled()
  })
})
