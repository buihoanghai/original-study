import { EditorWrapper } from '@/components/EditorWrapper'
import { getMindmapBySlug } from '@/lib/api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface EditorPageProps {
  params: Promise<{
    id: string // This is actually a slug now, but keeping param name for backward compatibility
  }>
}

/**
 * Editor Page
 *
 * Renders the mindmap editor for a specific mindmap slug.
 * The [id] param can be either a slug or a UUID (for backward compatibility).
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  // Try to fetch mindmap by slug first
  const result = await getMindmapBySlug(id, cookieHeader)

  if (!result.success || !result.data) {
    // If not found by slug, redirect to home
    redirect('/')
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EditorWrapper mindmapId={result.data.id} />
    </div>
  )
}

