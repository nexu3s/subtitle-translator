// ===== CORE BUSINESS LOGIC =====
import { SubtitleEntry, SubtitleChunk } from '../types';

export class ChunkManager {
  /**
   * Groups subtitle entries into chunks.
   * We add a unique delimiter to help the AI distinguish between subtitle entries.
   * @param entries - The array of subtitle entries.
   * @param chunkSize - The number of subtitle entries per chunk.
   */
  public static chunkSubtitles(entries: SubtitleEntry[], chunkSize: number = 10): SubtitleChunk[] {
    const chunks: SubtitleChunk[] = [];
    for (let i = 0; i < entries.length; i += chunkSize) {
      const batch = entries.slice(i, i + chunkSize);
      
      // Using a clear, uncommon delimiter helps the model maintain structure.
      const combinedText = batch
        .map(entry => `[${entry.index}]:: ${entry.originalText}`)
        .join('\n---\n');
      
      chunks.push({
        entries: batch,
        combinedText,
      });
    }
    return chunks;
  }
}