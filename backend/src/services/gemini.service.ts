// ===== CORE BUSINESS LOGIC =====
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SubtitleChunk, SubtitleEntry } from '../types';
import { logger } from '../utils/logger';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private readonly promptTemplate: string;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.promptTemplate = `
      You are an expert subtitle translator.
      Translate the following English subtitle text to Persian.
      - Maintain the original meaning and tone.
      - Preserve the original line breaks within each entry.
      - Each entry is separated by "---". Respond with the same "---" separator.
      - Each entry starts with an identifier like "[INDEX]::". Maintain this structure in your response.
      - DO NOT add any extra explanations, introductory text, or concluding remarks.
      - Your entire response should only be the translated text in the specified format.

      Example Input:
      [1]:: Hello, world.
      This is a test.
      ---
      [2]:: Goodbye.

      Example Output:
      [1]:: سلام دنیا.
      این یک امتحان است.
      ---
      [2]:: خداحافظ.

      Now, translate the following:
      ---
      {text}
      ---
    `;
  }

  public async translateChunk(chunk: SubtitleChunk): Promise<SubtitleEntry[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = this.promptTemplate.replace('{text}', chunk.combinedText);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      return this.parseTranslationResponse(chunk, translatedText);
    } catch (error) {
      logger.error('Gemini API Error', error, { chunk: chunk.combinedText });
      // Re-throw a more user-friendly error
      if(error.message.includes('API key not valid')) {
          throw new Error('Invalid API Key. Please check your key in the settings.');
      }
      throw new Error('Failed to translate chunk. The API may be overloaded.');
    }
  }

  private parseTranslationResponse(chunk: SubtitleChunk, translatedText: string): SubtitleEntry[] {
    const translatedEntriesMap = new Map<number, string>();
    const translatedSections = translatedText.trim().split(/\n---\n/);
    
    for (const section of translatedSections) {
      const match = section.match(/\[(\d+)]::\s*(.*)/s);
      if (match) {
        const index = parseInt(match[1], 10);
        const text = match[2].trim();
        translatedEntriesMap.set(index, text);
      }
    }
    
    // Map the translations back to the original subtitle entries
    return chunk.entries.map(entry => ({
      ...entry,
      translatedText: translatedEntriesMap.get(entry.index) || `[Translation Failed for index ${entry.index}]`,
    }));
  }
}