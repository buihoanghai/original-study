'use client'

import { useState, useEffect } from 'react'

/**
 * KeyboardShortcutsHelp Component
 *
 * Displays a help panel showing all available keyboard shortcuts.
 * Can be toggled with ? key or a help button.
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle help panel with ? key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          setIsOpen((prev) => !prev)
        }
      }
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        title="Keyboard shortcuts (?)"
        aria-label="Show keyboard shortcuts"
      >
        <span className="text-lg font-semibold">?</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="space-y-6">
          {/* Node Operations */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Node Operations
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Tab" description="Add child node to selected node" />
              <ShortcutRow shortcut="Enter" description="Add sibling node" />
              <ShortcutRow shortcut="Double-click" description="Edit node content" />
              <ShortcutRow shortcut="Delete" description="Delete selected node and its descendants" />
            </div>
          </section>

          {/* Navigation */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Navigation
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Arrow Keys" description="Navigate between nodes" />
              <ShortcutRow shortcut="Esc" description="Exit edit mode → Center root node" />
            </div>
          </section>

          {/* View Controls */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              View Controls
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="F" description="Collapse/expand selected node" />
              <ShortcutRow shortcut="Ctrl/Cmd + +" description="Zoom in" />
              <ShortcutRow shortcut="Ctrl/Cmd + -" description="Zoom out" />
            </div>
          </section>

          {/* History */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              History
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/Cmd + Z" description="Undo last action" />
              <ShortcutRow shortcut="Ctrl/Cmd + Shift + Z" description="Redo last undone action" />
            </div>
          </section>

          {/* Sync & Save */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Sync & Save
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/Cmd + S" description="Save mindmap to CMS" />
            </div>
          </section>

          {/* Other */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Other
            </h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="?" description="Toggle this help panel" />
              <ShortcutRow shortcut="Ctrl/Cmd + Shift + F" description="Toggle flashcard panel" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{description}</span>
      <kbd className="rounded bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
        {shortcut}
      </kbd>
    </div>
  )
}

