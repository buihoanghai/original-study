import { cookies } from 'next/headers'
import { getMindmaps } from '@/lib/api'
import { MindmapList } from '@/components/MindmapList'

export default async function Home() {
  // Get cookies from the incoming request to forward to the backend API
  // This is required for Server Components to authenticate with Payload CMS
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const result = await getMindmaps(cookieHeader)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          My Mindmaps
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Organize knowledge, learn deeply, recall effectively
        </p>
      </div>

      {result.success ? (
        <MindmapList mindmaps={result.data || []} />
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-50">
            Error Loading Mindmaps
          </h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">
            {result.error}
          </p>
        </div>
      )}
    </main>
  )
}
