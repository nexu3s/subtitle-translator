// # In the root directory
// mkdir backend && cd backend
// npm init -y
// npm install express cors multer ws @google/generative-ai p-queue dotenv
// npm install -D typescript @types/express @types/cors @types/multer @types/ws @types/node ts-node-dev
// npx tsc --init #```

// Create a `.env` file in the `backend` directory for your API key:
// `GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"`

// #### **Step 2: Backend Code**

// Here is the complete code for each file in the `backend/src/` directory.

// <br/>

// **`backend/src/types/index.ts`**
// This file defines the data structures used throughout the backend.

// ```typescript
// ===== TYPES & INTERFACES =====
export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  originalText: string;
  translatedText?: string;
}

export interface SubtitleChunk {
  entries: SubtitleEntry[];
  combinedText: string;
}

export type WebSocketMessage =
  | { type: 'PROGRESS'; payload: SubtitleEntry[] }
  | { type: 'COMPLETE'; payload: string }
  | { type: 'ERROR'; payload: { message: string } };