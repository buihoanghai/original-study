'use client'

import { useState } from 'react'
import type { Mindmap } from '@mindmap/domain'

export interface ConflictData {
  local: Mindmap
  remote: Mindmap
  localUpdated: Date
  remoteUpdated: Date
}

interface ConflictResolutionProps {
  conflict: ConflictData
  onResolve: (resolution: 'local' | 'remote' | 'cancel') => void
}

/**
 * ConflictResolution Component
 *
 * Displays a modal when sync conflicts are detected, allowing the user to:
 * - Keep local version (overwrite remote)
 * - Keep remote version (discard local changes)
 * - Cancel and review manually
 *
 * Shows a side-by-side comparison of local vs remote versions.
 */
export function ConflictResolution({
  conflict,
  onResolve,
}: ConflictResolutionProps) {
  const [selectedResolution, setSelectedResolution] = useState<
    'local' | 'remote' | null
  >(null)

  const handleResolve = () => {
    if (selectedResolution) {
      onResolve(selectedResolution)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            ⚠️ Sync Conflict Detected
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            The mindmap has been modified both locally and remotely. Choose
            which version to keep.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Local Version */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedResolution === 'local'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
              onClick={() => setSelectedResolution('local')}
            >
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="radio"
                  checked={selectedResolution === 'local'}
                  onChange={() => setSelectedResolution('local')}
                  className="w-4 h-4"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your Local Version
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Title:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.local.metadata.title}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Description:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.local.metadata.description || '(none)'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Last Modified:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(conflict.localUpdated)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.local.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Remote Version */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedResolution === 'remote'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
              }`}
              onClick={() => setSelectedResolution('remote')}
            >
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="radio"
                  checked={selectedResolution === 'remote'}
                  onChange={() => setSelectedResolution('remote')}
                  className="w-4 h-4"
                />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Remote Version (Server)
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Title:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.remote.metadata.title}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Description:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.remote.metadata.description || '(none)'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Last Modified:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(conflict.remoteUpdated)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Status:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {conflict.remote.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Warning:</strong> Choosing a version will overwrite
              the other. Make sure you select the correct version before
              proceeding.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => onResolve('cancel')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!selectedResolution}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedResolution
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedResolution === 'local'
              ? 'Keep Local Version'
              : selectedResolution === 'remote'
                ? 'Keep Remote Version'
                : 'Select a Version'}
          </button>
        </div>
      </div>
    </div>
  )
}

