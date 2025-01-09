interface GuidedPromptParams {
  genre?: string;
  mood?: string;
  mainCharacter?: string;
  setting?: string;
  timePeriod?: string;
  writingStyle?: string;
  conflictType?: string;
}

/**
 * Generates a random creative writing prompt
 * @returns Promise<string | null> The generated prompt or null if generation fails
 */
export async function generateRandomPrompt(): Promise<string | null> {
  const content = "Generate a creative writing prompt that is unique and intriguing. The prompt should be open-ended, not bound by genre, tone, character type, setting, or time period. It should inspire creativity and encourage the writer to develop a story from scratch. Limit the response to 3-4 sentences.";
  
  return generatePrompt(content);
}

/**
 * Generates a guided creative writing prompt based on user parameters
 * @param params Parameters to guide the prompt generation
 * @returns Promise<string | null> The generated prompt or null if generation fails
 */
export async function generateGuidedPrompt(params: GuidedPromptParams): Promise<string | null> {
  const content = `Generate a creative writing prompt for a ${params.genre} story with a ${params.mood} tone. 
    The story should feature a ${params.mainCharacter} in a ${params.setting} during ${params.timePeriod}. 
    The writing style should be ${params.writingStyle} and focus on a ${params.conflictType} conflict. 
    Make the prompt engaging and specific to these parameters while leaving room for creativity. 
    Limit the response to 3-4 sentences.`;
  
  return generatePrompt(content);
}

/**
 * Base function to generate prompts using the Groq API
 * @param content The content to send to Groq
 * @returns Promise<string | null> The generated prompt or null if generation fails
 */
async function generatePrompt(content: string): Promise<string | null> {
  try {
    const response = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    const data = await response.json();
    return data.prompt || null;
  } catch (error) {
    console.error('Error generating prompt:', error);
    return null;
  }
}