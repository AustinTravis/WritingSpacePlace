'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/library')
      } else {
        router.push('/login')
      }
    }
    checkUser()
  }, [router, supabase])

  // Show loading state while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl">Loading...</div>
    </div>
  )
}