'use client'

import { useState, useEffect } from 'react'
import type { Flashcard } from '@mindmap/domain'
import { FlashcardForm } from './FlashcardForm'
import {
  getFlashcardsByNode,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from '@/lib/flashcard-api'

interface FlashcardPanelProps {
  nodeId: string | null
  isVisible: boolean
  onClose: () => void
}

/**
 * FlashcardPanel Component
 *
 * Side panel for managing flashcards associated with a node.
 * Shows list of flashcards and allows creating/editing/deleting.
 */
export function FlashcardPanel({
  nodeId,
  isVisible,
  onClose,
}: FlashcardPanelProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  // Load flashcards when nodeId changes
  useEffect(() => {
    console.log('[FlashcardPanel] useEffect triggered')
    console.log('[FlashcardPanel] - nodeId:', nodeId)
    console.log('[FlashcardPanel] - isVisible:', isVisible)

    if (!nodeId || !isVisible) {
      console.log('[FlashcardPanel] Clearing flashcards (no nodeId or not visible)')
      setFlashcards([])
      return
    }

    async function loadFlashcards() {
      if (!nodeId) return

      console.log('[FlashcardPanel] Loading flashcards for node:', nodeId)
      setIsLoading(true)
      setError(null)

      const result = await getFlashcardsByNode(nodeId)
      console.log('[FlashcardPanel] Flashcards result:', result)

      if (result.success) {
        console.log('[FlashcardPanel] Loaded flashcards count:', result.data?.length)
        setFlashcards(result.data || [])
      } else {
        console.error('[FlashcardPanel] Failed to load flashcards:', result.error)
        setError(result.error || 'Failed to load flashcards')
      }

      setIsLoading(false)
    }

    loadFlashcards()
  }, [nodeId, isVisible])

  const handleCreate = async (question: string, answer: string) => {
    if (!nodeId) return

    const result = await createFlashcard(nodeId, question, answer)

    if (result.success && result.data) {
      setFlashcards([...flashcards, result.data])
      setIsCreating(false)
    } else {
      throw new Error(result.error || 'Failed to create flashcard')
    }
  }

  const handleUpdate = async (question: string, answer: string) => {
    if (!editingFlashcard) return

    const result = await updateFlashcard(editingFlashcard.id, {
      question,
      answer,
    })

    if (result.success && result.data) {
      setFlashcards(
        flashcards.map((f) =>
          f.id === editingFlashcard.id ? result.data! : f
        )
      )
      setEditingFlashcard(null)
    } else {
      throw new Error(result.error || 'Failed to update flashcard')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return

    const result = await deleteFlashcard(id)

    if (result.success) {
      setFlashcards(flashcards.filter((f) => f.id !== id))
    } else {
      setError(result.error || 'Failed to delete flashcard')
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-zinc-200 shadow-lg overflow-y-auto z-50">
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          Flashcards {flashcards.length > 0 && `(${flashcards.length})`}
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-700"
          aria-label="Close panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {!nodeId && (
          <div className="text-sm text-zinc-500 text-center py-8">
            Select a node to manage flashcards
          </div>
        )}

        {nodeId && isLoading && (
          <div className="text-sm text-zinc-500 text-center py-8">
            Loading flashcards...
          </div>
        )}

        {nodeId && error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {nodeId && !isLoading && !error && (
          <>
            {!isCreating && !editingFlashcard && (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                + Create Flashcard
              </button>
            )}

            {isCreating && (
              <FlashcardForm
                nodeId={nodeId}
                onSubmit={handleCreate}
                onCancel={() => setIsCreating(false)}
              />
            )}

            {editingFlashcard && (
              <FlashcardForm
                nodeId={nodeId}
                initialData={editingFlashcard}
                onSubmit={handleUpdate}
                onCancel={() => setEditingFlashcard(null)}
              />
            )}

            {flashcards.length === 0 && !isCreating && (
              <div className="text-sm text-zinc-500 text-center py-8">
                No flashcards yet. Create one to start learning!
              </div>
            )}

            {flashcards.length > 0 && !isCreating && !editingFlashcard && (
              <div className="space-y-3">
                {flashcards.map((flashcard) => (
                  <div
                    key={flashcard.id}
                    className="p-3 border border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100"
                  >
                    <div className="text-sm font-medium text-zinc-900 mb-1">
                      Q: {flashcard.question}
                    </div>
                    <div className="text-sm text-zinc-600 mb-3">
                      A: {flashcard.answer}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFlashcard(flashcard)}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(flashcard.id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

