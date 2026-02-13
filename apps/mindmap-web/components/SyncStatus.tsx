'use client'

import { useEditorStore } from '@mindmap/editor'
import { useState } from 'react'

interface SyncStatusProps {
  onSave?: () => Promise<void>
}

/**
 * SyncStatus Component
 *
 * Displays sync status and provides manual save button.
 * Shows:
 * - Sync status (saved/saving/error)
 * - Last saved timestamp
 * - Manual save button
 */
export function SyncStatus({ onSave }: SyncStatusProps = {}) {
  const { isSyncing, lastSyncedAt, syncError } = useEditorStore()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  const formatTimestamp = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  const getStatusIcon = () => {
    if (syncError) return '❌'
    if (isSyncing || isSaving) return '⏳'
    if (lastSyncedAt) return '✅'
    return '⚪'
  }

  const getStatusText = () => {
    if (syncError) return 'Error'
    if (isSyncing || isSaving) return 'Saving...'
    if (lastSyncedAt) return 'Saved'
    return 'Not saved'
  }

  const getStatusColor = () => {
    if (syncError) return 'text-red-600 dark:text-red-400'
    if (isSyncing || isSaving) return 'text-yellow-600 dark:text-yellow-400'
    if (lastSyncedAt) return 'text-green-600 dark:text-green-400'
    return 'text-zinc-400 dark:text-zinc-600'
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label="sync status">
          {getStatusIcon()}
        </span>
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {lastSyncedAt && !syncError && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatTimestamp(lastSyncedAt)}
            </span>
          )}
          {syncError && (
            <span className="text-xs text-red-600 dark:text-red-400" title={syncError}>
              {syncError.length > 30 ? syncError.substring(0, 30) + '...' : syncError}
            </span>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSyncing || isSaving}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        title="Save mindmap (Ctrl+S)"
      >
        {isSyncing || isSaving ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Saving...
          </span>
        ) : (
          'Save'
        )}
      </button>
    </div>
  )
}

