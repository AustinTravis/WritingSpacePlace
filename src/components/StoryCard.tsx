import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface StoryCardProps {
  story: {
    id: string
    title: string
    content: string
    word_count: number
    genre?: string
    tags?: string[]
    created_at: string
    updated_at: string
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function StoryCard({ story, onEdit, onDelete }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl line-clamp-1">{story.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          {story.genre && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Genre:</span>
              <span className="text-sm">{story.genre}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Word Count:</span>
            <span className="text-sm">{story.word_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Last Edited:</span>
            <span className="text-sm">{formatDate(story.updated_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Created:</span>
            <span className="text-sm">{formatDate(story.created_at)}</span>
          </div>
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {story.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(story.id)}
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(story.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  )
}