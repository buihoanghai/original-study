'use client'

import { useState, useEffect } from 'react'
import { useEditorStore, buildBreadcrumb, getChildren } from '@mindmap/editor'
import { getNodeByNodeId } from '@/lib/node-api'
import { getNoteByNodeId, createNote, updateNote, type Note } from '@/lib/notes-api'
import { Breadcrumb } from './Breadcrumb'
import { ContentSection } from './ContentSection'
import { CodeBlock } from './CodeBlock'
import { SearchBar } from './SearchBar'
import { HighlightText } from './HighlightText'
import { DynamicContentSection } from './DynamicContentSection'
import { OutlineContent } from './OutlineContent'
import { useNodeProgress } from '@/hooks/useNodeProgress'

interface NodeDetailPanelProps {
  nodeId: string | null
  isVisible: boolean
  onClose: () => void
  mindmapId?: string
}

/**
 * NodeDetailPanel Component
 * 
 * Left-side panel displaying rich learning content for selected nodes.
 * Features:
 * - Breadcrumb navigation to view parent content
 * - Collapsible content sections (definition, pitfalls, best practices, etc.)
 * - Children list for navigation
 */
export function NodeDetailPanel({
  nodeId,
  isVisible,
  onClose,
  mindmapId = 'default',
}: NodeDetailPanelProps) {
  const [nodeData, setNodeData] = useState<any>(null)
  const [breadcrumbPath, setBreadcrumbPath] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [childrenData, setChildrenData] = useState<any[]>([]) // Full data for children from database
  const [viewingNodeId, setViewingNodeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [note, setNote] = useState<Note | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectNode = useEditorStore((state) => state.selectNode)

  // Helper function to convert content to outline format
  const convertToOutline = (content: any) => {
    const items: any[] = []

    // NEW SCHEMA: Handle sections array (preferred)
    if (content.sections && content.sections.length > 0) {
      content.sections.forEach((section: any) => {
        const sectionItem: any = {
          level: 1,
          title: section.name || 'Untitled Section',
        }

        // Handle different section content types
        if (section.content) {
          if (section.content.type === 'text') {
            sectionItem.content = section.content.text
          } else if (section.content.type === 'list') {
            sectionItem.list = section.content.items || []
            sectionItem.listStyle = section.content.listStyle || 'bullet'
          } else if (section.content.type === 'code') {
            // Handle both single code and examples array
            if (section.content.examples && section.content.examples.length > 0) {
              sectionItem.codeExamples = section.content.examples
            } else if (section.content.code) {
              sectionItem.codeExamples = [
                {
                  language: section.content.language || 'javascript',
                  code: section.content.code,
                  title: section.content.title,
                },
              ]
            }
          }
        }

        items.push(sectionItem)
      })
      return items
    }

    // LEGACY SCHEMA: Fallback to old structure
    if (content.definition) {
      items.push({
        level: 1,
        title: 'Definition',
        content: content.definition,
      })
    }

    if (content.codeExamples && content.codeExamples.length > 0) {
      items.push({
        level: 1,
        title: 'Code Examples',
        codeExamples: content.codeExamples,
      })
    }

    if (content.pitfalls && content.pitfalls.length > 0) {
      items.push({
        level: 1,
        title: 'Pitfalls',
        content: content.pitfalls,
      })
    }

    if (content.commonMistakes && content.commonMistakes.length > 0) {
      items.push({
        level: 1,
        title: 'Common Mistakes',
        content: content.commonMistakes,
      })
    }

    if (content.bestPractices && content.bestPractices.length > 0) {
      items.push({
        level: 1,
        title: 'Best Practices',
        content: content.bestPractices,
      })
    }

    if (content.realWorldUseCases && content.realWorldUseCases.length > 0) {
      items.push({
        level: 1,
        title: 'Real-World Use Cases',
        content: content.realWorldUseCases,
      })
    }

    if (content.practiceTasks && content.practiceTasks.length > 0) {
      items.push({
        level: 1,
        title: 'Practice Tasks',
        content: content.practiceTasks,
      })
    }

    if (content.assessment) {
      items.push({
        level: 1,
        title: 'Assessment',
        content: content.assessment,
      })
    }

    if (content.signalsOfMastery && content.signalsOfMastery.length > 0) {
      items.push({
        level: 1,
        title: 'Signals of Mastery',
        content: content.signalsOfMastery,
      })
    }

    return items
  }

  const {
    toggleBookmark,
    toggleLearned,
    isBookmarked,
    isLearned,
    getProgress,
  } = useNodeProgress(mindmapId)

  // Load node data when nodeId or viewingNodeId changes
  useEffect(() => {
    const targetNodeId = viewingNodeId || nodeId
    if (!targetNodeId || !isVisible) {
      setNodeData(null)
      return
    }

    async function loadNode() {
      if (!targetNodeId) return

      setIsLoading(true)
      setError(null)

      const result = await getNodeByNodeId(targetNodeId)

      if (result.success && result.data) {
        setNodeData(result.data)

        // Build breadcrumb
        const breadcrumb = buildBreadcrumb(nodes, edges, targetNodeId)
        setBreadcrumbPath(breadcrumb)

        // Get children
        const childIds = getChildren(edges, targetNodeId)
        const childNodes = childIds
          .map((id) => nodes.find((n) => n.nodeId === id))
          .filter(Boolean)
        setChildren(childNodes)

        // Fetch full children data from database (not from editor store)
        // Editor store may have incomplete data, database has full content
        const childrenDataPromises = childIds.map((childId) => getNodeByNodeId(childId))
        const childrenResults = await Promise.all(childrenDataPromises)
        const fullChildrenData = childrenResults
          .filter((result) => result.success && result.data)
          .map((result) => result.data!)

        // Also fetch grandchildren data for each child
        const childrenWithGrandchildren = await Promise.all(
          fullChildrenData.map(async (child) => {
            const grandchildIds = getChildren(edges, child.nodeId)
            if (grandchildIds.length === 0) {
              return { ...child, grandchildren: [] }
            }

            const grandchildrenPromises = grandchildIds.map((id) => getNodeByNodeId(id))
            const grandchildrenResults = await Promise.all(grandchildrenPromises)
            const grandchildren = grandchildrenResults
              .filter((result) => result.success && result.data)
              .map((result) => result.data!)

            return { ...child, grandchildren }
          })
        )

        setChildrenData(childrenWithGrandchildren)
      } else {
        setError(result.error || 'Failed to load node')
      }

      setIsLoading(false)
    }

    loadNode()
  }, [nodeId, viewingNodeId, isVisible, nodes, edges])

  // Reset viewing node when selected node changes
  useEffect(() => {
    setViewingNodeId(null)
  }, [nodeId])

  // Load note when node changes
  useEffect(() => {
    const targetNodeId = viewingNodeId || nodeId
    if (!targetNodeId || !isVisible) {
      setNote(null)
      setNoteContent('')
      return
    }

    async function loadNote() {
      if (!targetNodeId) return

      const result = await getNoteByNodeId(targetNodeId)
      if (result.success && result.data) {
        setNote(result.data)
        setNoteContent(result.data.content)
      } else {
        setNote(null)
        setNoteContent('')
      }
    }

    loadNote()
  }, [nodeId, viewingNodeId, isVisible])

  const handleBreadcrumbNavigate = (targetNodeId: string) => {
    setViewingNodeId(targetNodeId)
  }

  const handleChildClick = (childNodeId: string) => {
    selectNode(childNodeId)
  }

  const handleSaveNote = async () => {
    const targetNodeId = viewingNodeId || nodeId
    if (!targetNodeId) return

    // Don't save if content is empty and no note exists
    if (!noteContent.trim() && !note) return

    setIsSavingNote(true)

    try {
      if (note) {
        // Update existing note
        const result = await updateNote(note.id, noteContent)
        if (result.success && result.data) {
          setNote(result.data)
        }
      } else {
        // Create new note
        const result = await createNote(targetNodeId, noteContent)
        if (result.success && result.data) {
          setNote(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Helper to render text with search highlighting
  const renderText = (text: string) => {
    return <HighlightText text={text} query={searchQuery} />
  }

  if (!isVisible) return null

  return (
    <div className="h-full w-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Node Details
          </h2>
          <div className="flex items-center gap-2">
            {/* Bookmark Button */}
            {nodeId && (
              <button
                onClick={() => toggleBookmark(viewingNodeId || nodeId)}
                className={`text-xl transition-transform hover:scale-110 ${
                  isBookmarked(viewingNodeId || nodeId)
                    ? 'text-yellow-500'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
                title={isBookmarked(viewingNodeId || nodeId) ? 'Remove bookmark' : 'Add bookmark'}
                aria-label={isBookmarked(viewingNodeId || nodeId) ? 'Remove bookmark' : 'Add bookmark'}
              >
                {isBookmarked(viewingNodeId || nodeId) ? '⭐' : '☆'}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xl leading-none"
              aria-label="Close detail panel"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} placeholder="Search content..." />

        {/* Progress Bar */}
        {nodes.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Learning Progress</span>
              <span>{getProgress(nodes.length).percentage}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
              <div
                className="bg-green-500 dark:bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getProgress(nodes.length).percentage}%` }}
              />
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
              {getProgress(nodes.length).learned} of {getProgress(nodes.length).total} nodes learned
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="text-center text-zinc-500 py-8">
            <div className="animate-pulse">Loading...</div>
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        {nodeData && !isLoading && (
          <>
            {/* Breadcrumb */}
            <Breadcrumb
              path={breadcrumbPath}
              currentNodeId={viewingNodeId || nodeId || ''}
              onNavigate={handleBreadcrumbNavigate}
            />

            {/* Title */}
            <div className="mb-4">
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {nodeData.content.text || 'Untitled'}
              </h3>

              {/* Mark as Learned Checkbox */}
              {nodeId && (
                <label className="flex items-center gap-2 text-base text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={isLearned(viewingNodeId || nodeId)}
                    onChange={() => toggleLearned(viewingNodeId || nodeId)}
                    className="w-5 h-5 text-green-600 bg-zinc-100 border-zinc-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                  />
                  <span className={isLearned(viewingNodeId || nodeId) ? 'font-medium text-green-600 dark:text-green-400' : ''}>
                    {isLearned(viewingNodeId || nodeId) ? '✓ Learned' : 'Mark as learned'}
                  </span>
                </label>
              )}
            </div>

            {/* Aggregate Intro (for parent nodes with displayMode: aggregate-children) */}
            {nodeData.content.aggregateIntro && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                  {renderText(nodeData.content.aggregateIntro)}
                </p>
              </div>
            )}

            {/* Content in Outline Format */}
            {(() => {
              const outlineItems = convertToOutline(nodeData.content)
              return outlineItems.length > 0 ? (
                <div className="mb-6">
                  <OutlineContent items={outlineItems} searchQuery={searchQuery} />
                </div>
              ) : null
            })()}

            {/* Personal Notes */}
            <ContentSection title="Personal Notes" icon="📝" defaultExpanded={true}>
              <div className="space-y-2">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onBlur={handleSaveNote}
                  placeholder="Add your personal notes about this topic..."
                  className="w-full min-h-[150px] p-3 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                {isSavingNote && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    💾 Saving...
                  </div>
                )}
                {note && !isSavingNote && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Last updated: {new Date(note.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </ContentSection>

            {/* Children */}
            {childrenData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <span>👶</span>
                  <span>Children Topics</span>
                </h3>
                <div className="space-y-8">
                  {childrenData.map((child: any) => {
                    const childOutline = convertToOutline(child.content)
                    const grandchildren = child.grandchildren || []

                    return (
                      <div key={child.nodeId} className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 pb-4">
                        <button
                          onClick={() => handleChildClick(child.nodeId)}
                          className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:underline mb-4 block"
                        >
                          {child.content.text || 'Untitled'}
                        </button>

                        {/* Child content in outline format */}
                        {childOutline.length > 0 ? (
                          <div className="text-sm mb-4">
                            <OutlineContent items={childOutline} searchQuery={searchQuery} />
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-2 mb-4">No content available</p>
                        )}

                        {/* Grandchildren (sub-topics) with full content */}
                        {grandchildren.length > 0 && (
                          <div className="mt-4 space-y-6">
                            {grandchildren.map((grandchild: any) => {
                              const grandchildOutline = convertToOutline(grandchild.content)
                              return (
                                <div key={grandchild.nodeId} className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-4">
                                  <button
                                    onClick={() => handleChildClick(grandchild.nodeId)}
                                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                                  >
                                    {grandchild.content.text || 'Untitled'}
                                  </button>

                                  {/* Grandchild content */}
                                  {grandchildOutline.length > 0 ? (
                                    <div className="text-sm">
                                      <OutlineContent items={grandchildOutline} searchQuery={searchQuery} />
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

