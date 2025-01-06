'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { BookOpen, PenSquare, LogOut } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Memoize the checkAuth function
  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    checkAuth()

    // Only set up the auth listener if we haven't already
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, checkAuth])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  // Return consistent markup while loading
  if (isLoading) {
    return (
      <header className="w-full py-4 px-6 bg-background border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-semibold">StoryApp</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="w-full py-4 px-6 bg-background border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <Link href="/" className="text-lg font-semibold hover:text-gray-600 transition-colors">
            StoryApp
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {isAuthenticated ? (
              // Authenticated navigation items
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/library">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Library
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/create">
                      <PenSquare className="mr-2 h-4 w-4" />
                      New Story
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </li>
              </>
            ) : (
              // Non-authenticated navigation items
              <>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/login">
                      Log In
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}