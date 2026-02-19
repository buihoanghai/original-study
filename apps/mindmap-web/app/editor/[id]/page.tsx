import { EditorWrapper } from '@/components/EditorWrapper'

interface EditorPageProps {
  params: Promise<{
    id: string // Can be either a UUID or a slug
  }>
}

/**
 * Editor Page
 *
 * Renders the mindmap editor for a specific mindmap.
 * The [id] param can be either a UUID (for backward compatibility) or a slug.
 *
 * Note: The EditorWrapper component handles fetching the mindmap data client-side,
 * which ensures proper cookie handling for authentication.
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EditorWrapper mindmapId={id} />
    </div>
  )
}

