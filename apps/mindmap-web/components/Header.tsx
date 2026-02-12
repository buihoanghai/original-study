import Link from 'next/link'

/**
 * Header Component
 *
 * App-wide header with navigation and branding.
 */
export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Mindmap Learning
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              My Mindmaps
            </Link>
            <Link
              href="/review"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              📚 Review
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New Mindmap
          </Link>
        </div>
      </div>
    </header>
  )
}

