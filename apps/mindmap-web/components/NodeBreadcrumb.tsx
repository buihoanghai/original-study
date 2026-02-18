'use client'

import Link from 'next/link'
import { useEditorStore, buildBreadcrumb } from '@mindmap/editor'

interface NodeBreadcrumbProps {
  mindmapId: string
  currentNodeId: string | null
}

/**
 * NodeBreadcrumb Component
 *
 * Displays breadcrumb navigation showing the path from root to current node.
 * Each breadcrumb item is clickable and navigates to that node's URL.
 */
export function NodeBreadcrumb({ mindmapId, currentNodeId }: NodeBreadcrumbProps) {
  const { nodes, edges } = useEditorStore()

  if (!currentNodeId) return null

  const breadcrumb = buildBreadcrumb(nodes, edges, currentNodeId)

  return (
    <nav 
      className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 px-4 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800"
      aria-label="Breadcrumb"
    >
      {breadcrumb.map((item, index) => (
        <div key={item.nodeId} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-zinc-400 dark:text-zinc-600">/</span>
          )}
          <Link
            href={`/editor/${mindmapId}/${item.nodeId}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-50 hover:underline transition-colors"
          >
            {item.title}
          </Link>
        </div>
      ))}
    </nav>
  )
}

