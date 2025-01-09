import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PenLine, Sparkles, Brain, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { generateRandomPrompt } from '@/lib/generatePrompt'

const formFields = [
  { name: 'genre', label: 'Genre', options: ['Mystery', 'Romance', 'Historical Fiction', 'Fantasy', 'Science Fiction', 'Thriller'] },
  { name: 'mood', label: 'Tone / Mood', options: ['Lighthearted', 'Dark / Gritty', 'Inspirational', 'Suspenseful', 'Melancholic'] },
  { name: 'mainCharacter', label: 'Main Character Type', options: ['Misunderstood Genius', 'Reluctant Hero', 'Adventurous Child', 'Wise Old Mentor', 'Morally Ambiguous Character'] },
  { name: 'setting', label: 'Setting', options: ['Bustling City', 'Remote Village', 'Distant Planet', 'Fantasy Kingdom', 'Near Future'] },
  { name: 'timePeriod', label: 'Time Period', options: ['Present Day', '1800s', 'Medieval Times', 'Far Future', '1960s', 'Biblical Times'] },
  { name: 'writingStyle', label: 'Writing Style', options: ['First-Person Narrative', 'Poetic and Descriptive', 'Journal Entry Style', 'Dialogue-Driven', 'Fast-Paced'] },
  { name: 'conflictType', label: 'Conflict Type', options: ['Person vs. Person', 'Person vs. Nature', 'Person vs. Self', 'Person vs. Society', 'Person vs. Technology'] },
]

type StoryStartOption = 'blank' | 'random' | 'guided'

type GuidedPromptFormProps = {
  onSubmit: (formData: Record<string, string>) => void;
  onClose: () => void;
}

const NewStoryModal = ({ isOpen, onClose }: {
    isOpen: boolean,
    onClose: () => void
}) => {
    const router = useRouter()
    const [mode, setMode] = useState<StoryStartOption | null>(null)
    const [generatingPrompt, setGeneratingPrompt] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, string>>({})

    const handleRandomPrompt = async () => {
        setGeneratingPrompt(true)
        try {
            const generatedPrompt = await generateRandomPrompt()
            if (generatedPrompt) {
                localStorage.setItem('writing_prompt', generatedPrompt)
                router.push('/create')
            }
        } catch (error) {
            console.error('Failed to generate prompt:', error)
        } finally {
            setGeneratingPrompt(false)
            onClose()
        }
    }

    const handleGuidedSubmit = async (formData: Record<string, string>) => {
        try {
            const prompt = `Write a ${formData.genre} story with a ${formData.mood} tone, featuring a ${formData.mainCharacter} in a ${formData.setting} during ${formData.timePeriod}. The story should be written in a ${formData.writingStyle} and focus on a ${formData.conflictType} conflict.`
            localStorage.setItem('writing_prompt', prompt)
            router.push('/create')
            onClose()
        } catch (error) {
            console.error('Failed to process guided prompt:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [formFields[currentStep].name]: e.target.value })
    }

    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault()
        handleGuidedSubmit(formData)
    }

    const renderContent = () => {
        if (mode === 'guided') {
            const progress = ((currentStep + 1) / formFields.length) * 100

            return (
                <form onSubmit={handleSubmitForm} className="p-6">
                    <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-2 bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor={formFields[currentStep].name} className="block mb-2 text-sm font-medium text-gray-700">
                            {formFields[currentStep].label}:
                        </label>
                        <select
                            name={formFields[currentStep].name}
                            id={formFields[currentStep].name}
                            value={formData[formFields[currentStep].name] || ''}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select {formFields[currentStep].label}</option>
                            {formFields[currentStep].options.map((option) => (
                                <option key={option} value={option.toLowerCase().replace(/ /g, '-')}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (currentStep === 0) {
                                    setMode(null) // Go back to the main options
                                } else {
                                    setCurrentStep(Math.max(0, currentStep - 1))
                                }
                            }}
                            disabled={currentStep === 0 && mode !== 'guided'}
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            Previous
                        </Button>

                        {currentStep < formFields.length - 1 ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentStep(Math.min(formFields.length - 1, currentStep + 1))}
                                disabled={!formData[formFields[currentStep].name]}
                            >
                                Next
                                <ChevronRightIcon className="w-5 h-5 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={Object.keys(formData).length !== formFields.length}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Generate Prompt
                            </Button>
                        )}
                    </div>
                </form>
            )
        }

        return (
            <div className="grid gap-4">
                <Button
                    variant="outline"
                    className="p-8"
                    onClick={() => {
                        router.push('/create')
                        onClose()
                    }}
                >
                    <PenLine className="mr-2 h-5 w-5" />
                    Just Let Me Write
                </Button>

                <Button
                    variant="outline"
                    className="p-8"
                    onClick={handleRandomPrompt}
                    disabled={generatingPrompt}
                >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {generatingPrompt ? 'Generating...' : 'Random Prompt'}
                </Button>

                <Button
                    variant="outline"
                    className="p-8"
                    onClick={() => setMode('guided')}
                >
                    <Brain className="mr-2 h-5 w-5" />
                    Guided Prompt
                </Button>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Start Your Story</DialogTitle>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}

export default NewStoryModal
