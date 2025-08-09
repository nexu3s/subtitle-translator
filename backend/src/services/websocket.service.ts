// ===== CORE BUSINESS LOGIC =====
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { WebSocketMessage } from '../types';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupConnections();
  }

  private setupConnections(): void {
    this.wss.on('connection', (ws) => {
      // The first message from the client should be its unique ID
      ws.on('message', (message) => {
        const clientId = message.toString();
        this.clients.set(clientId, ws);
        logger.info(`WebSocket client connected`, { clientId });

        ws.on('close', () => {
          this.clients.delete(clientId);
          logger.info(`WebSocket client disconnected`, { clientId });
        });
      });
    });
  }

  public sendMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}