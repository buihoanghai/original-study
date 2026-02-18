'use client'

import { useState, useEffect, useCallback } from 'react'

interface NodeProgressData {
  bookmarkedNodes: Set<string>
  learnedNodes: Set<string>
}

const STORAGE_KEY = 'mindmap-node-progress'

/**
 * useNodeProgress Hook
 * 
 * Manages bookmarks and learned status for nodes using localStorage.
 * Provides methods to bookmark, mark as learned, and check status.
 */
export function useNodeProgress(mindmapId: string) {
  const [data, setData] = useState<NodeProgressData>({
    bookmarkedNodes: new Set(),
    learnedNodes: new Set(),
  })

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${mindmapId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData({
          bookmarkedNodes: new Set(parsed.bookmarkedNodes || []),
          learnedNodes: new Set(parsed.learnedNodes || []),
        })
      } catch (error) {
        console.error('Failed to parse node progress data:', error)
      }
    }
  }, [mindmapId])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const toSave = {
      bookmarkedNodes: Array.from(data.bookmarkedNodes),
      learnedNodes: Array.from(data.learnedNodes),
    }
    localStorage.setItem(`${STORAGE_KEY}-${mindmapId}`, JSON.stringify(toSave))
  }, [data, mindmapId])

  const toggleBookmark = useCallback((nodeId: string) => {
    setData((prev) => {
      const newBookmarks = new Set(prev.bookmarkedNodes)
      if (newBookmarks.has(nodeId)) {
        newBookmarks.delete(nodeId)
      } else {
        newBookmarks.add(nodeId)
      }
      return { ...prev, bookmarkedNodes: newBookmarks }
    })
  }, [])

  const toggleLearned = useCallback((nodeId: string) => {
    setData((prev) => {
      const newLearned = new Set(prev.learnedNodes)
      if (newLearned.has(nodeId)) {
        newLearned.delete(nodeId)
      } else {
        newLearned.add(nodeId)
      }
      return { ...prev, learnedNodes: newLearned }
    })
  }, [])

  const isBookmarked = useCallback(
    (nodeId: string) => data.bookmarkedNodes.has(nodeId),
    [data.bookmarkedNodes]
  )

  const isLearned = useCallback(
    (nodeId: string) => data.learnedNodes.has(nodeId),
    [data.learnedNodes]
  )

  const getProgress = useCallback(
    (totalNodes: number) => {
      const learned = data.learnedNodes.size
      const percentage = totalNodes > 0 ? Math.round((learned / totalNodes) * 100) : 0
      return { learned, total: totalNodes, percentage }
    },
    [data.learnedNodes]
  )

  return {
    bookmarkedNodes: data.bookmarkedNodes,
    learnedNodes: data.learnedNodes,
    toggleBookmark,
    toggleLearned,
    isBookmarked,
    isLearned,
    getProgress,
  }
}

