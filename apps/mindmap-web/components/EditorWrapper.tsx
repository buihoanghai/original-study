'use client'

import { useEffect, useState, useCallback } from 'react'
import { MindmapEditor } from '@mindmap/editor'
import { useSyncMindmap } from '@mindmap/editor'
import { useEditorStore } from '@mindmap/editor'
import { FlashcardPanel } from './FlashcardPanel'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { SyncStatus } from './SyncStatus'
import { ToastContainer, useToast } from './Toast'
import { ConflictResolution, type ConflictData } from './ConflictResolution'

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
  const [conflict, setConflict] = useState<ConflictData | null>(null)
  const selectedNodeId = useEditorStore((state) => state.ui.selectedNodeId)
  const setSaveCallback = useEditorStore((state) => state.setSaveCallback)
  const { toasts, closeToast, success, error: showError } = useToast()
  const { save, load } = useSyncMindmap(
    process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
  )

  // Log selectedNodeId changes
  useEffect(() => {
    console.log('[EditorWrapper] selectedNodeId changed to:', selectedNodeId)
  }, [selectedNodeId])

  // Wrap save function to show toast notifications and handle conflicts
  const handleSave = useCallback(async (skipConflictCheck = false) => {
    const result = await save(skipConflictCheck)
    if (result.success) {
      success('Mindmap saved successfully')
      setConflict(null) // Clear any existing conflict
    } else if (result.conflict) {
      // Show conflict resolution UI
      setConflict(result.conflict as ConflictData)
    } else {
      showError(result.error || 'Failed to save mindmap')
    }
  }, [save, success, showError])

  // Handle conflict resolution
  const handleConflictResolve = useCallback(async (
    resolution: 'local' | 'remote' | 'cancel'
  ) => {
    if (resolution === 'cancel') {
      setConflict(null)
      return
    }

    if (resolution === 'local') {
      // Force save local version (skip conflict check)
      await handleSave(true)
    } else if (resolution === 'remote') {
      // Load remote version and discard local changes
      if (conflict?.remote.id) {
        await load(conflict.remote.id)
        success('Loaded remote version')
      }
      setConflict(null)
    }
  }, [conflict, handleSave, load, success])

  // Register save callback for Ctrl+S hotkey
  useEffect(() => {
    setSaveCallback(handleSave)
    return () => setSaveCallback(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSave])

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
        <SyncStatus onSave={handleSave} />
        <button
          onClick={() => setShowFlashcardPanel(!showFlashcardPanel)}
          className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm ${
            showFlashcardPanel
              ? 'bg-blue-600 text-white'
              : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700'
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

      <KeyboardShortcutsHelp />

      <ToastContainer toasts={toasts} onClose={closeToast} />

      {conflict && (
        <ConflictResolution
          conflict={conflict}
          onResolve={handleConflictResolve}
        />
      )}
    </div>
  )
}

