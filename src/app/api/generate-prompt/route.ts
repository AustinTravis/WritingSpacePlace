import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Get the prompt type and parameters from the request body
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Generate prompt using Groq with the provided content
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content,
        },
      ],
      model: "llama-3.3-70b-versatile",
      // Optional parameters for controlling the output
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
    });

    const prompt = completion.choices[0]?.message?.content;

    if (!prompt) {
      throw new Error('No prompt generated');
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}