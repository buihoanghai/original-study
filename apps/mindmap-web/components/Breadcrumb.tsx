'use client'

interface BreadcrumbItem {
  nodeId: string
  title: string
}

interface BreadcrumbProps {
  path: BreadcrumbItem[]
  currentNodeId: string
  onNavigate: (nodeId: string) => void
}

/**
 * Breadcrumb Component
 * 
 * Displays navigation trail from root to current node.
 * Allows clicking on parent nodes to view their content.
 */
export function Breadcrumb({ path, currentNodeId, onNavigate }: BreadcrumbProps) {
  if (path.length === 0) return null

  return (
    <nav 
      className="flex items-center flex-wrap gap-1 text-sm text-zinc-600 dark:text-zinc-400 mb-4"
      aria-label="Breadcrumb navigation"
    >
      {path.map((item, index) => {
        const isCurrent = item.nodeId === currentNodeId
        const isLast = index === path.length - 1

        return (
          <div key={item.nodeId} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 text-zinc-400 dark:text-zinc-600">/</span>
            )}
            {isCurrent ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(item.nodeId)}
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                aria-label={`Navigate to ${item.title}`}
              >
                {item.title}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}

