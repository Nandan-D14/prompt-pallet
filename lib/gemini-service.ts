"use client";

import { GoogleGenAI } from "@google/genai";

// Enhanced Gemini AI service with better error handling and retry logic
export class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.client = new GoogleGenAI({
          apiKey: apiKey
        });
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error);
        this.client = null;
      }
    } else {
      console.warn('Gemini API key not found. AI features will be disabled.');
    }
  }

  async generatePrompt(
    description: string, 
    style?: string, 
    mood?: string,
    retries: number = 3
  ): Promise<{ success: boolean; prompt?: string; error?: string }> {
    if (!this.client) {
      return {
        success: false,
        error: 'Gemini AI not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY environment variable.'
      };
    }

    const systemPrompt = `You are an expert AI image prompt generator. Create detailed, artistic prompts for AI image generation tools like Midjourney, DALL-E, or Stable Diffusion.

Guidelines:
- Be specific about visual elements, lighting, composition, and style
- Include artistic techniques and camera angles when appropriate
- Make prompts creative but coherent
- Keep prompts between 50-150 words
- Focus on visual impact and artistic quality

User wants: ${description}
${style ? `Style preference: ${style}` : ''}
${mood ? `Mood/Atmosphere: ${mood}` : ''}

Generate a single, detailed AI image prompt:`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Gemini API attempt ${attempt}/${retries}`);
        
        const response = await this.client.models.generateContent({
          model: "gemini-2.0-flash-exp",
          contents: systemPrompt,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          }
        });

        const generatedText = response.text;
        
        if (generatedText) {
          return {
            success: true,
            prompt: generatedText.trim()
          };
        }

        throw new Error('No valid content generated');

      } catch (error: any) {
        console.error(`Gemini API attempt ${attempt} failed:`, error);
        
        if (error.message?.includes('quota') || error.message?.includes('429')) {
          // Rate limit - wait before retry
          if (attempt < retries) {
            await this.delay(2000 * attempt);
            continue;
          }
        }
        
        if (attempt === retries) {
          // Use fallback for final attempt
          const fallbackPrompt = this.generateFallbackPrompt(description, style);
          return {
            success: true,
            prompt: fallbackPrompt
          };
        }
        
        // Wait before retry (exponential backoff)
        await this.delay(1000 * Math.pow(2, attempt - 1));
      }
    }

    return {
      success: false,
      error: 'Maximum retries exceeded'
    };
  }

  async enhancePrompt(originalPrompt: string): Promise<{ success: boolean; prompt?: string; error?: string }> {
    const enhanceRequest = `Take this AI image prompt and enhance it with more artistic details, better composition description, and visual impact:

Original prompt: "${originalPrompt}"

Make it more detailed and visually compelling while keeping the core concept:`;

    return this.generatePrompt(enhanceRequest);
  }

  async generateVariations(basePrompt: string, count: number = 3): Promise<{ success: boolean; prompts?: string[]; error?: string }> {
    const variations: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const variationRequest = `Create a variation of this AI image prompt, keeping the main concept but changing the style, mood, or artistic approach:

Base prompt: "${basePrompt}"

Create variation ${i + 1}:`;
      
      const result = await this.generatePrompt(variationRequest);
      if (result.success && result.prompt) {
        variations.push(result.prompt);
      }
    }

    if (variations.length === 0) {
      return {
        success: false,
        error: 'Failed to generate any variations'
      };
    }

    return {
      success: true,
      prompts: variations
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fallback prompt generator for when API is unavailable
  generateFallbackPrompt(description: string, style?: string): string {
    const styles = {
      'realistic': 'photorealistic, highly detailed, professional photography',
      'artistic': 'artistic, painterly, creative composition',
      'abstract': 'abstract art, geometric, non-representational',
      'fantasy': 'fantasy art, magical, ethereal, mystical',
      'cyberpunk': 'cyberpunk, neon lights, futuristic, digital art',
      'vintage': 'vintage style, retro, classic photography'
    };

    const moodWords = ['atmospheric', 'dramatic lighting', 'cinematic', 'professional quality'];
    const qualityWords = ['4K', 'ultra-detailed', 'masterpiece', 'award-winning'];
    
    const styleText = style && styles[style as keyof typeof styles] 
      ? styles[style as keyof typeof styles] 
      : 'high quality, detailed';
    
    const randomMood = moodWords[Math.floor(Math.random() * moodWords.length)];
    const randomQuality = qualityWords[Math.floor(Math.random() * qualityWords.length)];

    return `${description}, ${styleText}, ${randomMood}, ${randomQuality}, professional composition`;
  }
}

export const geminiService = new GeminiService();
