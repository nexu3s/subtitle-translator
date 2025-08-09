// ===== API ROUTES & CONTROLLERS =====
import { Router, Request, Response } from 'express';
import multer from 'multer';
import PQueue from 'p-queue';
import { v4 as uuidv4 } from 'uuid';
import { SubtitleParser } from '../services/parser.service';
import { ChunkManager } from '../services/chunker.service';
import { GeminiService } from '../services/gemini.service';
import { WebSocketService } from '../services/websocket.service';
import { logger } from '../utils/logger';
import { SubtitleEntry } from '../types';
import { FileAssembler } from '../services/assembler.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure the queue for rate limiting (e.g., 30 requests per minute)
const translationQueue = new PQueue({ interval: 60000, intervalCap: 30, carryoverConcurrencyCount: true });

export const configureTranslateRoutes = (wss: WebSocketService): Router => {
  router.post('/translate', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is missing.' });
    }

    const clientId = uuidv4();
    res.status(202).json({ clientId }); // Immediately respond with a client ID

    // ---- Start processing in the background ----
    (async () => {
      try {
        const srtContent = req.file.buffer.toString('utf-8');
        const allEntries = SubtitleParser.parse(srtContent);
        const chunks = ChunkManager.chunkSubtitles(allEntries, 15);
        
        const geminiService = new GeminiService(apiKey);
        const allTranslatedEntries: SubtitleEntry[] = [];
        
        const translationPromises = chunks.map(chunk => 
          translationQueue.add(async () => {
            const translatedEntries = await geminiService.translateChunk(chunk);
            allTranslatedEntries.push(...translatedEntries);
            wss.sendMessage(clientId, { type: 'PROGRESS', payload: translatedEntries });
            logger.info(`Translated chunk for client`, { clientId, count: translatedEntries.length });
          })
        );

        await Promise.all(translationPromises);

        const finalSrt = FileAssembler.assemble(allTranslatedEntries);
        wss.sendMessage(clientId, { type: 'COMPLETE', payload: finalSrt });
        logger.info(`Translation complete for client`, { clientId });

      } catch (error) {
        logger.error('Translation process failed', error, { clientId });
        wss.sendMessage(clientId, { type: 'ERROR', payload: { message: error.message || 'An unknown error occurred during translation.' } });
      }
    })();
  });

  return router;
};