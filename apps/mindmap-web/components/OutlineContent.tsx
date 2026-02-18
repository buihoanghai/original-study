'use client'

import { CodeBlock } from './CodeBlock'
import { HighlightText } from './HighlightText'

interface OutlineItem {
  level: number // 1, 2, 3, etc.
  title: string
  content?: string | string[]
  list?: string[]
  listStyle?: 'bullet' | 'numbered'
  codeExamples?: Array<{
    language: string
    title?: string
    code: string
  }>
}

interface OutlineContentProps {
  items: OutlineItem[]
  searchQuery?: string
}

/**
 * OutlineContent Component
 * 
 * Renders content in hierarchical outline format:
 * I) Level 1 (Roman numerals)
 *    1) Level 2 (Numbers)
 *       a) Level 3 (Lowercase letters)
 *          i) Level 4 (Lowercase Roman numerals)
 */
export function OutlineContent({ items, searchQuery = '' }: OutlineContentProps) {
  // Helper to render text with search highlighting
  const renderText = (text: string) => {
    return <HighlightText text={text} query={searchQuery} />
  }

  // Convert number to Roman numeral (uppercase)
  const toRomanUpper = (num: number): string => {
    const romanNumerals = [
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' },
    ]
    let result = ''
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral
        num -= value
      }
    }
    return result
  }

  // Convert number to lowercase Roman numeral
  const toRomanLower = (num: number): string => {
    return toRomanUpper(num).toLowerCase()
  }

  // Convert number to lowercase letter (a, b, c, ...)
  const toLetter = (num: number): string => {
    return String.fromCharCode(96 + num) // 97 is 'a'
  }

  // Get the appropriate prefix for the outline level
  const getPrefix = (level: number, index: number): string => {
    const num = index + 1
    switch (level) {
      case 1:
        return `${toRomanUpper(num)})`
      case 2:
        return `${num})`
      case 3:
        return `${toLetter(num)})`
      case 4:
        return `${toRomanLower(num)})`
      default:
        return `${num})`
    }
  }

  // Get indentation based on level
  const getIndentation = (level: number): string => {
    const baseIndent = 0
    const indentPerLevel = 24 // pixels
    return `${baseIndent + (level - 1) * indentPerLevel}px`
  }

  // Group items by level for proper numbering
  let levelCounters: { [key: number]: number } = {}

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        // Reset counters for deeper levels when we go back to a shallower level
        const currentLevel = item.level
        Object.keys(levelCounters).forEach((key) => {
          const level = parseInt(key)
          if (level > currentLevel) {
            delete levelCounters[level]
          }
        })

        // Increment counter for current level
        if (!levelCounters[currentLevel]) {
          levelCounters[currentLevel] = 0
        }
        const itemIndex = levelCounters[currentLevel]
        levelCounters[currentLevel]++

        const prefix = getPrefix(currentLevel, itemIndex)
        const indent = getIndentation(currentLevel)

        return (
          <div key={index} style={{ marginLeft: indent }} className="outline-item">
            {/* Title */}
            <div className="flex items-start gap-2 mb-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 min-w-[40px]">
                {prefix}
              </span>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex-1">
                {renderText(item.title)}
              </h4>
            </div>

            {/* Content */}
            {item.content && (
              <div className="ml-[48px] mb-2">
                {typeof item.content === 'string' ? (
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {renderText(item.content)}
                  </p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                    {item.content.map((line, i) => (
                      <li key={i}>{renderText(line)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* List */}
            {item.list && item.list.length > 0 && (
              <div className="ml-[48px] mb-2">
                {item.listStyle === 'numbered' ? (
                  <ol className="list-decimal list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                    {item.list.map((line, i) => (
                      <li key={i}>{renderText(line)}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                    {item.list.map((line, i) => (
                      <li key={i}>{renderText(line)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Code Examples */}
            {item.codeExamples && item.codeExamples.length > 0 && (
              <div className="ml-[48px] space-y-3">
                {item.codeExamples.map((example, i) => (
                  <CodeBlock
                    key={i}
                    code={example.code}
                    language={example.language}
                    title={example.title}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

