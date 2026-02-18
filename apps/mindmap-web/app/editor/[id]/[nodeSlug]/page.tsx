import { EditorWrapper } from '@/components/EditorWrapper'

interface NodeEditorPageProps {
  params: Promise<{
    id: string
    nodeSlug: string
  }>
}

/**
 * Node-Focused Editor Page
 *
 * Displays the mindmap editor focused on a specific node.
 * URL: /editor/[mindmapId]/[nodeSlug]
 *
 * Shows:
 * - Current node
 * - Children of current node
 * - Parent of current node (if any)
 * - Breadcrumb navigation
 */
export default async function NodeEditorPage({ params }: NodeEditorPageProps) {
  const { id, nodeSlug } = await params

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EditorWrapper mindmapId={id} focusNodeSlug={nodeSlug} />
    </div>
  )
}

