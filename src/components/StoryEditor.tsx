'use client'
import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import PromptSelector from './PromptSelector'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered
} from 'lucide-react'
import { generateRandomPrompt } from '@/lib/generatePrompt'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontSize: {
            /**
             * Set the font size
             */
            setFontSize: (size: string) => ReturnType;
        }
    }
}

// Custom extension for font size
const FontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'],
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: '16', // Set default font size to Medium (16px)
                        parseHTML: element => element.style.fontSize?.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`
                            }
                        }
                    }
                }
            }
        ]
    },

    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
        }
    },
})

// Add these type definitions at the top
type Genre = 'fiction' | 'non-fiction' | 'poetry' | 'mystery' | 'fantasy' | 'sci-fi' | 'romance' | 'thriller' | 'horror' | 'other'

type Story = {
    id: string
    title: string
    content: string
    genre?: Genre
    tags?: string[]
    prompt?: string
}

type StoryEditorProps = {
    initialStory?: Story
}

export default function StoryEditor({ initialStory }: StoryEditorProps) {
    const router = useRouter()
    const supabase = createClient()
    const [title, setTitle] = useState(initialStory?.title || '')
    const [genre, setGenre] = useState<Genre>(initialStory?.genre || 'fiction')
    const [tags, setTags] = useState<string[]>(initialStory?.tags || [])
    const [tagInput, setTagInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [generatingPrompt, setGeneratingPrompt] = useState(false)
    const [currentPrompt, setCurrentPrompt] = useState<string>(initialStory?.prompt || '')

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Underline,
            Heading.configure({
                levels: [1, 2, 3]
            }),
            CharacterCount,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            FontSize
        ],
        content: initialStory?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-4 focus:outline-none min-h-[300px]',
            },
        },
        onCreate: ({ editor }) => {
            // Set default font size for both content and cursor
            editor.commands.setMark('textStyle', { fontSize: '16' })
        }
    })

    const handleSelectPrompt = (prompt: string) => {
        setCurrentPrompt(prompt)
        setShowPrompt(false)
    }

    const handleRandomPrompt = async () => {
        setGeneratingPrompt(true)
        try {
            const generatedPrompt = await generateRandomPrompt()
            if (generatedPrompt) {
                setCurrentPrompt(generatedPrompt)
            }
        } catch (error) {
            console.error('Failed to generate prompt:', error)
            setError('Failed to generate prompt')
        } finally {
            setGeneratingPrompt(false)
        }
    }

    const setFontSize = (size: string) => {
        const sizeMap: { [key: string]: string } = {
            '1': '14',
            '2': '16',
            '3': '20',
            '4': '24',
            '5': '32'
        }

        if (editor && sizeMap[size]) {
            editor.chain()
                .focus()
                .setMark('textStyle', { fontSize: sizeMap[size] })
                .run()
        }
    }

    // Add tag handling functions
    const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const newTag = tagInput.trim().toLowerCase()
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleSave = async () => {
        if (!title.trim()) {
            setError('Title is required')
            return
        }

        if (!editor) return

        setSaving(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const content = editor.getHTML()
            const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length

            const storyData = {
                title,
                content,
                word_count: wordCount,
                genre,
                tags,
                // Add the prompt to the story data
                prompt: currentPrompt || null, // Use null if no prompt is set
                updated_at: new Date().toISOString()
            }

            if (initialStory) {
                // Update existing story
                const { error } = await supabase
                    .from('stories')
                    .update(storyData)
                    .eq('id', initialStory.id)

                if (error) throw error
            } else {
                // Create new story
                const { error } = await supabase
                    .from('stories')
                    .insert([{
                        ...storyData,
                        user_id: user.id
                    }])

                if (error) throw error
            }

            router.push('/library')
            router.refresh()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred')
        } finally {
            setSaving(false)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    {error && (
                        <div className="mb-4 text-red-500 text-sm">{error}</div>
                    )}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Story Title"
                        className="w-full text-2xl font-bold mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Genre and Tags Section */}
                    <div className="mb-4 space-y-4">
                        {/* Genre Selection */}
                        <div>
                            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                                Genre
                            </label>
                            <select
                                id="genre"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value as Genre)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="fiction">Fiction</option>
                                <option value="non-fiction">Non-Fiction</option>
                                <option value="poetry">Poetry</option>
                                <option value="mystery">Mystery</option>
                                <option value="fantasy">Fantasy</option>
                                <option value="sci-fi">Sci-Fi</option>
                                <option value="romance">Romance</option>
                                <option value="thriller">Thriller</option>
                                <option value="horror">Horror</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (press Enter or comma to add)
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    placeholder="Add tags..."
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {/* Tags Display */}
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Display Section */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Prompt</h3>
                            <button
                                onClick={handleRandomPrompt}
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                                disabled={generatingPrompt}
                            >
                                {generatingPrompt ? 'Generating...' : 'Generate Random'}
                            </button>
                        </div>
                        {currentPrompt ? (
                            <p className="text-gray-600">{currentPrompt}</p>
                        ) : (
                            <p className="text-gray-400 italic">No prompt generated</p>
                        )}
                    </div>

                    {/* Prompt Selector Modal */}
                    {showPrompt && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4">
                                <h2 className="text-xl font-semibold mb-4">Generate Writing Prompt</h2>
                                <PromptSelector onSelect={handleSelectPrompt} />
                                <button
                                    onClick={() => setShowPrompt(false)}
                                    className="mt-4 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Formatting toolbar */}
                    <div className="border border-gray-300 rounded-t p-2 bg-gray-50 flex flex-wrap gap-2">
                        {/* Text formatting buttons */}
                        <div className="flex gap-1 items-center border-r pr-2">
                            <button
                                onClick={() => editor?.chain().focus().toggleBold().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                                title="Bold (Ctrl+B)"
                            >
                                <Bold className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().toggleItalic().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                                title="Italic (Ctrl+I)"
                            >
                                <Italic className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                                title="Underline (Ctrl+U)"
                            >
                                <UnderlineIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().toggleStrike().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
                                title="Strikethrough"
                            >
                                <Strikethrough className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Text alignment buttons */}
                        <div className="flex gap-1 items-center border-r pr-2">
                            <button
                                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                                title="Align Left"
                            >
                                <AlignLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                                title="Center"
                            >
                                <AlignCenter className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                                title="Align Right"
                            >
                                <AlignRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
                                title="Justify"
                            >
                                <AlignJustify className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Font size selector */}
                        <div className="flex gap-2 items-center border-r pr-2">
                            <select
                                onChange={(e) => setFontSize(e.target.value)}
                                className="p-2 rounded border border-gray-300"
                                defaultValue="2"
                            >
                                <option value="1">Small</option>
                                <option value="2">Medium</option>
                                <option value="3">Large</option>
                                <option value="4">X-Large</option>
                                <option value="5">XX-Large</option>
                            </select>
                        </div>

                        {/* List buttons */}
                        <div className="flex gap-1 items-center">
                            <button
                                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                                title="Bullet List"
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                className={`p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                                title="Numbered List"
                            >
                                <ListOrdered className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="border border-t-0 border-gray-300 rounded-b min-h-[60vh] overflow-y-auto">
                        <style jsx global>{`
                            .ProseMirror {
                                font-size: 16px !important;
                            }
                            .ProseMirror p {
                                margin-top: 0.5em !important;
                                margin-bottom: 0.5em !important;
                            }
                            .ProseMirror p.is-editor-empty:first-child::before {
                                font-size: 16px !important;
                                height: 0;
                                color: #adb5bd;
                                content: attr(data-placeholder);
                                float: left;
                                pointer-events: none;
                            }
                            /* Adjust spacing for lists */
                            .ProseMirror ul, .ProseMirror ol {
                                margin-top: 0.5em !important;
                                margin-bottom: 0.5em !important;
                            }
                            .ProseMirror li > p {
                                margin: 0 !important;
                            }
                            /* Adjust heading spacing */
                            .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
                                margin-top: 1em !important;
                                margin-bottom: 0.5em !important;
                            }
                        `}</style>
                        <EditorContent editor={editor} />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            {editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0} words
                        </div>
                        <div className="space-x-4">
                            <button
                                onClick={() => router.push('/library')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
                            >
                                {saving ? 'Saving...' : 'Save Story'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}