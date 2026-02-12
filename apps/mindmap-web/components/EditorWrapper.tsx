'use client'

import { useEffect, useState } from 'react'
import { MindmapEditor } from '@mindmap/editor'
import { useSyncMindmap } from '@mindmap/editor'
import { useEditorStore } from '@mindmap/editor'
import { FlashcardPanel } from './FlashcardPanel'

interface EditorWrapperProps {
  mindmapId: string
}

/**
 * EditorWrapper Component
 *
 * Client-side wrapper for the MindmapEditor.
 * Handles loading mindmap data and sync operations.
 */
export function EditorWrapper({ mindmapId }: EditorWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFlashcardPanel, setShowFlashcardPanel] = useState(false)
  const selectedNodeId = useEditorStore((state) => state.ui.selectedNodeId)
  const { save, load } = useSyncMindmap(
    process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
  )

  // Load mindmap on mount
  useEffect(() => {
    async function loadMindmap() {
      setIsLoading(true)
      setError(null)

      try {
        await load(mindmapId)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mindmap')
        setIsLoading(false)
      }
    }

    loadMindmap()
  }, [mindmapId, load])

  // Keyboard shortcut for flashcard panel (Ctrl/Cmd + Shift + F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setShowFlashcardPanel((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading mindmap...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-50">
            Error Loading Mindmap
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 dark:bg-red-50 dark:text-red-900 dark:hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => setShowFlashcardPanel(!showFlashcardPanel)}
          className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm ${
            showFlashcardPanel
              ? 'bg-blue-600 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50'
          }`}
          title="Toggle flashcard panel (Ctrl+Shift+F)"
        >
          📇 Flashcards
        </button>
      </div>

      <MindmapEditor />

      <FlashcardPanel
        nodeId={selectedNodeId}
        isVisible={showFlashcardPanel}
        onClose={() => setShowFlashcardPanel(false)}
      />
    </div>
  )
}

