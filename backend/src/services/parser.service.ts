// ===== CORE BUSINESS LOGIC =====
import { SubtitleEntry } from '../types';

export class SubtitleParser {
  public static parse(srtContent: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const sections = srtContent.trim().split(/\r?\n\r?\n/);

    for (const section of sections) {
      if (!section.trim()) continue;

      const lines = section.trim().split(/\r?\n/);
      try {
        const index = parseInt(lines[0], 10);
        const [startTime, endTime] = lines[1].split(' --> ');
        const originalText = lines.slice(2).join('\n');

        if (!isNaN(index) && startTime && endTime && originalText) {
          entries.push({
            index,
            startTime,
            endTime,
            originalText,
          });
        }
      } catch (error) {
        // Skip malformed entries
      }
    }
    return entries;
  }
}