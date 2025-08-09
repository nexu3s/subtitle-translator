// ===== INITIALIZATION & STARTUP =====
import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketService } from './services/websocket.service';
import { configureTranslateRoutes } from './api/translate.routes';

const app = express();
app.use(cors()); // Allow requests from our frontend
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketService(server);

// Configure routes
app.use('/api/v1', configureTranslateRoutes(wss));

export { app, server };