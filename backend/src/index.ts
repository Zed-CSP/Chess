import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { gameManager } from './gameManager';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ 
    message: 'Chess Master API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Game API routes
app.post('/api/games/quick-match', (_req, res) => {
  // For now, return a mock response
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const color = Math.random() > 0.5 ? 'white' : 'black';
  
  res.json({
    gameId,
    color,
    opponent: {
      id: 'ai_opponent',
      name: 'Chess AI',
      rating: 1500,
      isAI: true
    }
  });
});

app.post('/api/games/create', (req, res) => {
  const { timeControl, playerColor } = req.body;
  const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create game in GameManager for multiplayer
  gameManager.createGame(gameId, timeControl);
  
  res.json({
    gameId,
    timeControl,
    playerColor: playerColor === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : playerColor,
    status: 'waiting_for_opponent'
  });
});

// AI Service proxy endpoints
app.post('/api/ai/move', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8001/ai-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(response.status).json({ error: 'AI service unavailable' });
    }
  } catch (error) {
    console.error('AI service error:', error);
    res.status(503).json({ error: 'AI service unavailable' });
  }
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      res.status(response.status).json({ error: 'AI service unavailable' });
    }
  } catch (error) {
    console.error('AI service error:', error);
    res.status(503).json({ error: 'AI service unavailable' });
  }
});

// GameManager event listeners
gameManager.on('timerUpdate', (gameId: string, timer: any) => {
  io.to(gameId).emit('timer-update', { timer });
});

gameManager.on('gameTimeout', (gameId: string, timeoutPlayer: string, game: any) => {
  io.to(gameId).emit('game-timeout', { timeoutPlayer, game });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining a game room
  socket.on('join-game', (data: { gameId: string; playerName?: string }) => {
    const { gameId, playerName = 'Anonymous' } = data;
    socket.join(gameId);
    
    // Try to join the game through GameManager
    const result = gameManager.joinGame(gameId, socket.id, playerName);
    
    if (result.success && result.game) {
      socket.emit('game-joined', {
        success: true,
        color: result.color,
        game: result.game
      });
      
      // Notify other players
      socket.to(gameId).emit('player-joined', {
        player: {
          id: socket.id,
          name: playerName,
          color: result.color
        }
      });
      
      // If game started, notify all players
      if (result.game.status === 'active') {
        io.to(gameId).emit('game-started', { game: result.game });
      }
    } else {
      socket.emit('game-joined', { success: false, error: 'Could not join game' });
    }
    
    console.log(`User ${socket.id} joined game ${gameId}`);
  });

  // Handle user leaving a game room
  socket.on('leave-game', (gameId: string) => {
    socket.leave(gameId);
    gameManager.removePlayer(socket.id);
    console.log(`User ${socket.id} left game ${gameId}`);
  });

  // Handle chess moves
  socket.on('make-move', (data: { gameId: string; move: any; newFen: string }) => {
    const result = gameManager.makeMove(data.gameId, socket.id, data.move, data.newFen);
    
    if (result.success && result.game) {
      // Broadcast move to other players in the game
      socket.to(data.gameId).emit('move-made', {
        move: data.move,
        newFen: data.newFen,
        game: result.game
      });
      
      // Send confirmation to the player who made the move
      socket.emit('move-confirmed', {
        success: true,
        game: result.game
      });
    } else {
      socket.emit('move-confirmed', { success: false, error: 'Invalid move' });
    }
    
    console.log(`Move made in game ${data.gameId}:`, data.move);
  });

  // Handle game resignation
  socket.on('resign', (data: { gameId: string }) => {
    const result = gameManager.resignGame(data.gameId, socket.id);
    
    if (result.success && result.game) {
      // Broadcast resignation to all players in the game
      io.to(data.gameId).emit('player-resigned', {
        game: result.game
      });
    }
    
    console.log(`Player resigned in game ${data.gameId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    gameManager.removePlayer(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Chess Master API server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app; 