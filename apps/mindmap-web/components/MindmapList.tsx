import Link from 'next/link'
import type { Mindmap } from '@mindmap/domain'

interface MindmapListProps {
  mindmaps: Mindmap[]
}

/**
 * MindmapList Component
 *
 * Displays a list of mindmaps with links to edit them.
 */
export function MindmapList({ mindmaps }: MindmapListProps) {
  if (mindmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No mindmaps yet
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Get started by creating your first mindmap.
        </p>
        <Link
          href="/new"
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create Mindmap
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mindmaps.map((mindmap) => (
        <Link
          key={mindmap.id}
          href={`/editor/${mindmap.id}`}
          className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
                {mindmap.metadata.title}
              </h3>
              {mindmap.metadata.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {mindmap.metadata.description}
                </p>
              )}
            </div>
            <span
              className={`ml-4 rounded-full px-2 py-1 text-xs font-medium ${
                mindmap.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : mindmap.status === 'archived'
                    ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {mindmap.status}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
            <span>
              Updated{' '}
              {new Date(mindmap.metadata.updated).toLocaleDateString()}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

