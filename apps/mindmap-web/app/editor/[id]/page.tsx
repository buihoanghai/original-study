import { EditorWrapper } from '@/components/EditorWrapper'

interface EditorPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Editor Page
 *
 * Renders the mindmap editor for a specific mindmap ID.
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params

  return (
    <div className="h-[calc(100vh-4rem)]">
      <EditorWrapper mindmapId={id} />
    </div>
  )
}

