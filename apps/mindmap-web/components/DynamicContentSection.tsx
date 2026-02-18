'use client'

import type { ContentSection } from '@mindmap/domain'
import { ContentSection as ContentSectionWrapper } from './ContentSection'
import { CodeBlock } from './CodeBlock'
import { HighlightText } from './HighlightText'

interface DynamicContentSectionProps {
  section: ContentSection
  searchQuery?: string
}

/**
 * DynamicContentSection Component
 * 
 * Renders content sections dynamically based on their type.
 * Supports: text, list, code, table, and custom content types.
 */
export function DynamicContentSection({ 
  section, 
  searchQuery = '' 
}: DynamicContentSectionProps) {
  // Helper to render text with search highlighting
  const renderText = (text: string) => {
    return <HighlightText text={text} query={searchQuery} />
  }

  // Determine color classes based on section.color
  const colorClasses = {
    red: 'text-red-700 dark:text-red-400',
    green: 'text-green-700 dark:text-green-400',
    blue: 'text-blue-700 dark:text-blue-400',
    purple: 'text-purple-700 dark:text-purple-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    orange: 'text-orange-700 dark:text-orange-400',
    gray: 'text-zinc-700 dark:text-zinc-300',
  }[section.color || 'gray']

  return (
    <ContentSectionWrapper
      title={section.name}
      icon={section.icon || '📄'}
      defaultExpanded={section.defaultExpanded ?? true}
    >
      {/* Text content */}
      {section.content.type === 'text' && (() => {
        const textContent = section.content as { type: 'text'; text: string }
        return (
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {renderText(textContent.text)}
          </p>
        )
      })()}

      {/* List content */}
      {section.content.type === 'list' && (() => {
        const listContent = section.content as { type: 'list'; items: string[]; listStyle?: 'bullet' | 'numbered' | 'checklist' }
        return (
          <ul
            className={`space-y-2 ${colorClasses} ${
              listContent.listStyle === 'numbered'
                ? 'list-decimal list-inside'
                : listContent.listStyle === 'checklist'
                ? 'list-none'
                : 'list-disc list-inside'
            }`}
          >
            {listContent.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {listContent.listStyle === 'checklist' && (
                  <span className="mr-2">☐</span>
                )}
                {renderText(item)}
              </li>
            ))}
          </ul>
        )
      })()}

      {/* Code examples */}
      {section.content.type === 'code' && (() => {
        const codeContent = section.content as { type: 'code'; examples: Array<{ language: string; title?: string; code: string }> }
        return (
          <div className="space-y-4">
            {codeContent.examples.map((example, i) => (
              <CodeBlock
                key={i}
                code={example.code}
                language={example.language}
                title={example.title}
              />
            ))}
          </div>
        )
      })()}

      {/* Table content */}
      {section.content.type === 'table' && (() => {
        const tableContent = section.content as { type: 'table'; headers: string[]; rows: string[][] }
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-600">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  {tableContent.headers.map((header, i) => (
                    <th
                      key={i}
                      className="border border-zinc-300 dark:border-zinc-600 p-3 text-left font-semibold text-zinc-900 dark:text-zinc-100"
                    >
                      {renderText(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableContent.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="border border-zinc-300 dark:border-zinc-600 p-3 text-zinc-700 dark:text-zinc-300"
                      >
                        {renderText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })()}

      {/* Video content */}
      {section.content.type === 'video' && (() => {
        const videoContent = section.content as { type: 'video'; videos: Array<{ url: string; title?: string; description?: string; duration?: string; platform?: 'youtube' | 'vimeo' | 'custom' }> }
        return (
          <div className="space-y-4">
            {videoContent.videos.map((video, i) => (
              <div key={i} className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                {video.title && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-300 dark:border-zinc-600">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{video.title}</h4>
                    {video.duration && (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">⏱️ {video.duration}</span>
                    )}
                  </div>
                )}
                <div className="aspect-video bg-black">
                  {video.platform === 'youtube' && (
                    <iframe
                      className="w-full h-full"
                      src={video.url.replace('watch?v=', 'embed/')}
                      title={video.title || 'Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {video.platform === 'vimeo' && (
                    <iframe
                      className="w-full h-full"
                      src={video.url}
                      title={video.title || 'Video'}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {(!video.platform || video.platform === 'custom') && (
                    <video className="w-full h-full" controls>
                      <source src={video.url} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                {video.description && (
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{renderText(video.description)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })()}

      {/* Quiz content */}
      {section.content.type === 'quiz' && (() => {
        const quizContent = section.content as { type: 'quiz'; questions: Array<{ id: string; question: string; options: string[]; correctAnswer: number; explanation?: string }> }
        return (
          <div className="space-y-6">
            {quizContent.questions.map((q, i) => (
              <div key={q.id} className="border border-zinc-300 dark:border-zinc-600 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  {i + 1}. {renderText(q.question)}
                </p>
                <div className="space-y-2 mb-3">
                  {q.options.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded border ${
                        optIdx === q.correctAnswer
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                      {renderText(option)}
                      {optIdx === q.correctAnswer && (
                        <span className="ml-2 text-green-600 dark:text-green-400">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Explanation:</strong> {renderText(q.explanation)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })()}

      {/* Diagram content */}
      {section.content.type === 'diagram' && (() => {
        const diagramContent = section.content as { type: 'diagram'; diagrams: Array<{ title?: string; description?: string; mermaidCode?: string; imageUrl?: string; alt?: string }> }
        return (
          <div className="space-y-4">
            {diagramContent.diagrams.map((diagram, i) => (
              <div key={i} className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
                {diagram.title && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-300 dark:border-zinc-600">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{diagram.title}</h4>
                  </div>
                )}
                <div className="p-4 bg-white dark:bg-zinc-900">
                  {diagram.mermaidCode && (
                    <div className="mermaid-diagram bg-zinc-50 dark:bg-zinc-800 p-4 rounded">
                      <pre className="text-sm overflow-auto">
                        <code>{diagram.mermaidCode}</code>
                      </pre>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                        💡 Mermaid diagram (render with Mermaid.js)
                      </p>
                    </div>
                  )}
                  {diagram.imageUrl && (
                    <img
                      src={diagram.imageUrl}
                      alt={diagram.alt || diagram.title || 'Diagram'}
                      className="max-w-full h-auto rounded"
                    />
                  )}
                </div>
                {diagram.description && (
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-300 dark:border-zinc-600">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{renderText(diagram.description)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })()}

      {/* Custom content - fallback for extensibility */}
      {section.content.type === 'custom' && (() => {
        const customContent = section.content as { type: 'custom'; data: unknown }
        return (
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Custom content type (extensible)
            </p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(customContent.data, null, 2)}
            </pre>
          </div>
        )
      })()}
    </ContentSectionWrapper>
  )
}

