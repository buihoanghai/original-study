import { EditorWrapper } from '@/components/EditorWrapper'
import { getMindmapBySlug } from '@/lib/api'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface NodeEditorPageProps {
  params: Promise<{
    id: string // This is actually a mindmap slug now
    nodeSlug: string
  }>
}

/**
 * Node-Focused Editor Page
 *
 * Displays the mindmap editor focused on a specific node.
 * URL: /editor/[mindmapSlug]/[nodeSlug]
 *
 * Shows:
 * - Current node
 * - Children of current node
 * - Parent of current node (if any)
 * - Breadcrumb navigation
 */
export default async function NodeEditorPage({ params }: NodeEditorPageProps) {
  const { id, nodeSlug } = await params
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  // Fetch mindmap by slug
  const result = await getMindmapBySlug(id, cookieHeader)

  if (!result.success || !result.data) {
    // If not found by slug, redirect to home
    redirect('/')
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EditorWrapper mindmapId={result.data.id} focusNodeSlug={nodeSlug} />
    </div>
  )
}

