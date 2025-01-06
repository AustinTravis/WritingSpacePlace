'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ViewStory() {
    const params = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [story, setStory] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    router.push('/login')
                    return
                }

                const { data, error } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (error) throw error
                if (!data) throw new Error('Story not found')

                setStory(data)
            } catch (e) {
                console.error(e)
                router.push('/library')
            } finally {
                setLoading(false)
            }
        }

        fetchStory()
    }, [params.id, router, supabase])

    if (loading) {
        return <LoadingSpinner />
    }

    if (!story) return null

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">{story.title}</h1>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.push(`/story/${story.id}/edit`)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => router.push('/library')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Back to Library
                            </button>
                        </div>
                    </div>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: story.content }}
                    />
                    <div className="mt-6 text-gray-500 text-sm">
                        {story.word_count} words • Last updated {new Date(story.updated_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
}