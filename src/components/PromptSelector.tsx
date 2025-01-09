// components/PromptSelector.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function PromptSelector({ onSelect }: { onSelect: (prompt: string) => void }) {
    const [prompt, setPrompt] = useState<string | null>(null)
    const supabase = createClient()

    const getRandomPrompt = async () => {
        const { data } = await supabase
            .from('writing_prompts')
            .select('content')
            .limit(1)
            .order('created_at', { ascending: false }) // Changed from RANDOM()

        if (data?.[0]) {
            setPrompt(data[0].content)
        }
    }

    return (
        <Card className="p-4">
            <div className="space-y-4">
                <Button onClick={getRandomPrompt}>Get Random Prompt</Button>
                {prompt && (
                    <>
                        <p className="text-lg">{prompt}</p>
                        <Button onClick={() => onSelect(prompt)}>Use This Prompt</Button>
                    </>
                )}
            </div>
        </Card>
    )
}