// ===== CORE BUSINESS LOGIC =====
import { SubtitleEntry } from '../types';

export class FileAssembler {
  public static assemble(entries: SubtitleEntry[]): string {
    // Sort entries by index to ensure correct order
    const sortedEntries = [...entries].sort((a, b) => a.index - b.index);

    return sortedEntries
      .map(entry => {
        return `${entry.index}\r\n${entry.startTime} --> ${entry.endTime}\r\n${entry.translatedText || entry.originalText}`;
      })
      .join('\r\n\r\n');
  }
}