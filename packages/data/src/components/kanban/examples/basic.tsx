import { Kanban, type KanbanColumn } from '@advui/data'

const board: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    items: [
      { id: 'legend', title: 'Add partners to the map legend' },
      {
        id: 'chin',
        title: 'Collect the Chin State sheets',
        description: 'Three townships are still missing.',
      },
      { id: 'kobo', title: 'Update the Kobo form' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    items: [
      {
        id: 'clean',
        title: 'Clean the September data',
        description: 'Merge duplicate rows and fix the township codes.',
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    items: [{ id: 'dashboard', title: 'Dashboard filters' }],
  },
  { id: 'done', title: 'Done', items: [] },
]

export default function KanbanBasic() {
  return <Kanban aria-label="Sprint board" defaultValue={board} width="100%" />
}
