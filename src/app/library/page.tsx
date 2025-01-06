'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StoryCard from '@/components/StoryCard'
import { Button } from "@/components/ui/button"
import { PlusCircle, LogOut } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import LoadingSpinner from '@/components/LoadingSpinner'

type Story = {
    id: string
    title: string
    content: string
    word_count: number
    genre?: string
    tags?: string[]
    created_at: string
    updated_at: string
}

export default function Library() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stories, setStories] = useState<Story[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    router.push('/login')
                    return
                }

                const { data, error } = await supabase
                    .from('stories')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })

                if (error) throw error

                setStories(data)
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStories()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleEdit = (id: string) => {
        router.push(`/story/${id}/edit`)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this story?')) {
            const { error } = await supabase
                .from('stories')
                .delete()
                .eq('id', id)

            if (!error) {
                setStories(stories.filter(s => s.id !== id))
            } else {
                setError('Failed to delete story')
            }
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Library</h1>

                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {stories.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <h2 className="text-xl font-semibold mb-2">No Stories Yet</h2>
                        <p className="text-gray-600 mb-4">Start your writing journey by creating your first story!</p>
                        <Button onClick={() => router.push('/create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Story
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map((story) => (
                            <StoryCard
                                key={story.id}
                                story={story}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}