'use client'

import { useState } from 'react'

interface ContentSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

/**
 * ContentSection Component
 * 
 * Collapsible section for displaying node content.
 * Used in NodeDetailPanel to organize different types of content.
 */
export function ContentSection({
  title,
  icon,
  children,
  defaultExpanded = true,
}: ContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="mb-4 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">{icon}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </span>
        </div>
        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
          {children}
        </div>
      )}
    </div>
  )
}

