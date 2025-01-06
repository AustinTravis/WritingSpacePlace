export type Story = {
    id: string;
    user_id: string;
    title: string;
    content: string;
    word_count: number;
    status: 'draft' | 'published';
    genre?: 'fiction' | 'non-fiction' | 'poetry' | 'mystery' | 'fantasy' | 'sci-fi' | 'romance' | 'thriller' | 'horror' | 'other';
    tags?: string[];
    visibility: 'private' | 'public';
    created_at: string;
    updated_at: string;
    search_vector?: unknown;
  }
  
  export type Database = {
    public: {
      Tables: {
        stories: {
          Row: Story;
          Insert: Omit<Story, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<Story, 'id'>>;
        };
      };
    };
  };