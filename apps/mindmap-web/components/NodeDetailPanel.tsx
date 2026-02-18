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

            {/* NEW SCHEMA: Dynamic Sections */}
            {nodeData.content.sections && nodeData.content.sections.length > 0 ? (
              <div className="space-y-4">
                {nodeData.content.sections
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((section: any) => (
                    <DynamicContentSection
                      key={section.id}
                      section={section}
                      searchQuery={searchQuery}
                    />
                  ))}
              </div>
            ) : (
              /* OLD SCHEMA: Legacy hardcoded sections (backward compatibility) */
              <>
                {/* Definition */}
                {nodeData.content.definition && (
                  <ContentSection title="Definition" icon="📖">
                    <p className="whitespace-pre-wrap">{renderText(nodeData.content.definition)}</p>
                  </ContentSection>
                )}

                {/* Code Examples */}
                {nodeData.content.codeExamples && nodeData.content.codeExamples.length > 0 && (
                  <ContentSection title="Code Examples" icon="💻">
                    <div className="space-y-4">
                      {nodeData.content.codeExamples.map((example: any, i: number) => (
                        <CodeBlock
                          key={i}
                          code={example.code}
                          language={example.language || 'javascript'}
                          title={example.title}
                        />
                      ))}
                    </div>
                  </ContentSection>
                )}

                {/* Pitfalls */}
                {nodeData.content.pitfalls && nodeData.content.pitfalls.length > 0 && (
                  <ContentSection title="Pitfalls" icon="⚠️">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.pitfalls.map((pitfall: string, i: number) => (
                        <li key={i}>{renderText(pitfall)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}

                {/* Common Mistakes */}
                {nodeData.content.commonMistakes && nodeData.content.commonMistakes.length > 0 && (
                  <ContentSection title="Common Mistakes" icon="❌">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.commonMistakes.map((mistake: string, i: number) => (
                        <li key={i}>{renderText(mistake)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}

                {/* Best Practices */}
                {nodeData.content.bestPractices && nodeData.content.bestPractices.length > 0 && (
                  <ContentSection title="Best Practices" icon="✅">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.bestPractices.map((practice: string, i: number) => (
                        <li key={i}>{renderText(practice)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}

                {/* Real-World Use Cases */}
                {nodeData.content.realWorldUseCases && nodeData.content.realWorldUseCases.length > 0 && (
                  <ContentSection title="Real-World Use Cases" icon="💡">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.realWorldUseCases.map((useCase: string, i: number) => (
                        <li key={i}>{renderText(useCase)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}

                {/* Practice Tasks */}
                {nodeData.content.practiceTasks && nodeData.content.practiceTasks.length > 0 && (
                  <ContentSection title="Practice Tasks" icon="🎯">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.practiceTasks.map((task: string, i: number) => (
                        <li key={i}>{renderText(task)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}

                {/* Assessment */}
                {nodeData.content.assessment && (
                  <ContentSection title="Assessment" icon="📊">
                    <p className="whitespace-pre-wrap">{renderText(nodeData.content.assessment)}</p>
                  </ContentSection>
                )}

                {/* Signals of Mastery */}
                {nodeData.content.signalsOfMastery && nodeData.content.signalsOfMastery.length > 0 && (
                  <ContentSection title="Signals of Mastery" icon="🎓">
                    <ul className="list-disc list-inside space-y-1">
                      {nodeData.content.signalsOfMastery.map((signal: string, i: number) => (
                        <li key={i}>{renderText(signal)}</li>
                      ))}
                    </ul>
                  </ContentSection>
                )}
              </>
            )}

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
            {children.length > 0 && (
              <ContentSection title="Children" icon="👶" defaultExpanded={true}>
                <div className="space-y-4">
                  {children.map((child: any) => (
                    <div key={child.nodeId} className="border-l-2 border-blue-500 dark:border-blue-400 pl-4">
                      <button
                        onClick={() => handleChildClick(child.nodeId)}
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                      >
                        {child.content.text || 'Untitled'}
                      </button>
                      {child.content.definition && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <span className="font-medium">Definition:</span> {child.content.definition}
                        </p>
                      )}
                      {child.content.commonMistakes && child.content.commonMistakes.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Common Mistakes:</span>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {child.content.commonMistakes.slice(0, 2).map((mistake: string, i: number) => (
                              <li key={i}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ContentSection>
            )}
          </>
        )}
      </div>
    </div>
  )
}

