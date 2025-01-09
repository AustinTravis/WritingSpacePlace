// src/components/NewStoryModal.tsx
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PenLine, Sparkles, Brain, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { generateRandomPrompt, generateGuidedPrompt } from '@/lib/generatePrompt'

// Define the available story start options
type StoryStartOption = 'blank' | 'random' | 'guided'

// Form field configuration for guided prompts
const formFields = [
    {
        name: 'genre',
        label: 'Genre',
        options: [
            'Fiction',
            'Non-Fiction',
            'Poetry',
            'Mystery',
            'Historical Fiction',
            'Fantasy',
            'Sci-Fi',
            'Romance',
            'Thriller'
        ]
    },
    {
        name: 'mood',
        label: 'Tone / Mood',
        options: [
            'Lighthearted',
            'Dark / Gritty',
            'Inspirational',
            'Suspenseful',
            'Melancholic',
            'Hopeful',
            'Eerie / Unsettling',
            'Romantic',
            'Reflective',
            'Tense / Anticipatory'
        ]
    },
    {
        name: 'mainCharacter',
        label: 'Main Character Type',
        options: [
            'Misunderstood Genius',
            'Reluctant Hero',
            'Adventurous Child',
            'Wise Old Mentor',
            'Morally Ambiguous Character',
            'Rebel with a Cause',
            'Disillusioned Idealist',
            'Cunning Survivor',
            'Tragic Villain',
            'Mischievous Trickster'
        ]
    },
    {
        name: 'setting',
        label: 'Setting',
        options: [
            'Bustling City',
            'Remote Village',
            'Distant Planet',
            'Fantasy Kingdom',
            'Near Future',
            'War-Torn Countryside',
            'Secluded Monastery',
            'Thriving Port Town',
            'Nobleman\'s Estate',
            'Colonial Settlement'
        ]
    },
    {
        name: 'timePeriod',
        label: 'Time Period',
        options: [
            'Biblical Times',
            'Ancient Greece',
            'Roman Empire',
            'Renaissance Era',
            'Age of Exploration',
            'Victorian Era',
            '1900s',
            'Present Day',
            'Far Future'
        ]
    },
    {
        name: 'writingStyle',
        label: 'Writing Style',
        options: [
            'First-Person Narrative',
            'Poetic and Descriptive',
            'Journal Entry Style',
            'Dialogue-Driven',
            'Fast-Paced',
            'Epistolary (Letters or Correspondence)',
            'Multiple POVs (Switching Perspectives)',
            'Stream of Consciousness',
            'Unreliable Narrator',
            'Flashback-Heavy Narrative'
        ]
    },
    {
        name: 'conflictType',
        label: 'Conflict Type',
        options: [
            'Person vs. Person',
            'Person vs. Nature',
            'Person vs. Self',
            'Person vs. Society',
            'Person vs. Technology',
            'Person vs. Destiny/Fate',
            'Person vs. The Unknown',
            'Person vs. Time',
            'Person vs. Morality',
            'Person vs. Tradition'
        ]
    },
]

interface NewStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GuidedFormData {
    genre: string;
    mood: string;
    mainCharacter: string;
    setting: string;
    timePeriod: string;
    writingStyle: string;
    conflictType: string;
}

const NewStoryModal: React.FC<NewStoryModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter()
    const [mode, setMode] = useState<StoryStartOption | null>(null)
    const [generatingPrompt, setGeneratingPrompt] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<Record<string, string>>({})

    // Reset all state when the modal is opened or closed
    useEffect(() => {
        const resetState = () => {
            setMode(null)
            setCurrentStep(0)
            setFormData({})
            setGeneratingPrompt(false)
        }

        resetState()
    }, [isOpen])

    // Handle random prompt generation
    const handleRandomPrompt = async () => {
        setGeneratingPrompt(true)
        try {
            const generatedPrompt = await generateRandomPrompt()
            if (generatedPrompt) {
                localStorage.setItem('writing_prompt', generatedPrompt)
                router.push('/create')
                onClose() // Close modal after successful prompt generation
            }
        } catch (error) {
            console.error('Failed to generate prompt:', error)
        } finally {
            setGeneratingPrompt(false)
        }
    }

    // Handle guided prompt submission
    const handleGuidedSubmit = async (formData: GuidedFormData) => {
        setGeneratingPrompt(true)
        try {
            const generatedPrompt = await generateGuidedPrompt({
                genre: formData.genre,
                mood: formData.mood,
                mainCharacter: formData.mainCharacter,
                setting: formData.setting,
                timePeriod: formData.timePeriod,
                writingStyle: formData.writingStyle,
                conflictType: formData.conflictType
            });

            if (generatedPrompt) {
                localStorage.setItem('writing_prompt', generatedPrompt)
                router.push('/create')
                onClose()
            }
        } catch (error) {
            console.error('Failed to generate guided prompt:', error)
        } finally {
            setGeneratingPrompt(false)
        }
    }

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [formFields[currentStep].name]: e.target.value })
    }

    // Handle form submission
    const handleSubmitForm = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate that all required fields are present
        const requiredFields = [
            'genre',
            'mood',
            'mainCharacter',
            'setting',
            'timePeriod',
            'writingStyle',
            'conflictType'
        ];

        const guidedFormData: GuidedFormData = {
            genre: formData.genre || '',
            mood: formData.mood || '',
            mainCharacter: formData.mainCharacter || '',
            setting: formData.setting || '',
            timePeriod: formData.timePeriod || '',
            writingStyle: formData.writingStyle || '',
            conflictType: formData.conflictType || ''
        };

        // Check if all required fields are filled
        const isValid = requiredFields.every(field => !!formData[field]);

        if (isValid) {
            handleGuidedSubmit(guidedFormData);
        } else {
            console.error('Missing required fields');
            // Optionally add error handling here
        }
    }

    // Render the content based on current mode and step
    const renderContent = () => {
        if (mode === 'guided') {
            const progress = ((currentStep + 1) / formFields.length) * 100

            return (
                <form onSubmit={handleSubmitForm} className="p-6">
                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-2 bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Form fields */}
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
                                <option
                                    key={option}
                                    value={option.toLowerCase().replace(/ /g, '-')}
                                >
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (currentStep === 0) {
                                    setMode(null)
                                } else {
                                    setCurrentStep(Math.max(0, currentStep - 1))
                                }
                            }}
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

        // Initial options view
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
                    disabled={generatingPrompt}
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