'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

/**
 * CodeBlock Component
 * 
 * Displays code with syntax highlighting.
 * Supports multiple languages and dark/light themes.
 */
export function CodeBlock({ code, language = 'javascript', title }: CodeBlockProps) {
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      {title && (
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
          <span>{title}</span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
            title="Copy code"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      )}
      <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <SyntaxHighlighter
          language={language}
          style={isDark ? vscDarkPlus : vs}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

