// app/story/[id]/edit/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StoryEditor from '@/components/StoryEditor'
import LoadingSpinner from '@/components/LoadingSpinner' // Add this import

export default function EditStory() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [story, setStory] = useState(null)
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

  return story ? <StoryEditor initialStory={story} /> : null
}