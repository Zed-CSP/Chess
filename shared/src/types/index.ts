// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  country?: string;
  rating: number;
  ratingPeak: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen: Date;
  timeZone: string;
  boardTheme: string;
  pieceSet: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends Omit<User, 'email'> {
  winRate: number;
  averageRating: number;
  recentGames: GameSummary[];
}

// Game Types
export interface Game {
  id: string;
  whiteId: string;
  blackId: string;
  white: User;
  black: User;
  timeControl: string;
  variant: string;
  rated: boolean;
  status: GameStatus;
  result?: GameResult;
  winner?: 'white' | 'black' | null;
  fen: string;
  pgn: string;
  moveCount: number;
  whiteTime: number;
  blackTime: number;
  increment: number;
  startedAt: Date;
  endedAt?: Date;
  moves: Move[];
}

export interface GameSummary {
  id: string;
  opponent: {
    id: string;
    username: string;
    rating: number;
  };
  color: 'white' | 'black';
  result: GameResult;
  rating: number;
  ratingChange: number;
  timeControl: string;
  endedAt: Date;
}

export interface Move {
  id: string;
  gameId: string;
  moveNumber: number;
  color: 'white' | 'black';
  san: string;
  uci: string;
  fen: string;
  timeSpent: number;
  timeLeft: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isCapture: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
  promotion?: string;
  playerId: string;
  createdAt: Date;
}

// Enums
export enum GameStatus {
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  ABORTED = 'ABORTED',
  TIMEOUT = 'TIMEOUT',
  ABANDONED = 'ABANDONED'
}

export enum GameResult {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
  STALEMATE = 'STALEMATE',
  INSUFFICIENT_MATERIAL = 'INSUFFICIENT_MATERIAL',
  THREEFOLD_REPETITION = 'THREEFOLD_REPETITION',
  FIFTY_MOVE_RULE = 'FIFTY_MOVE_RULE',
  TIMEOUT = 'TIMEOUT',
  RESIGNATION = 'RESIGNATION',
  ABANDONMENT = 'ABANDONMENT'
}

// Socket Events
export interface SocketEvents {
  // Game events
  'game:join': (gameId: string) => void;
  'game:leave': (gameId: string) => void;
  'game:move': (move: MoveData) => void;
  'game:offer-draw': (gameId: string) => void;
  'game:accept-draw': (gameId: string) => void;
  'game:decline-draw': (gameId: string) => void;
  'game:resign': (gameId: string) => void;
  'game:abort': (gameId: string) => void;
  
  // Matchmaking events
  'matchmaking:join': (preferences: MatchmakingPreferences) => void;
  'matchmaking:leave': () => void;
  'matchmaking:found': (game: Game) => void;
  
  // Chat events
  'chat:message': (message: ChatMessage) => void;
  'chat:typing': (gameId: string) => void;
  
  // User events
  'user:online': () => void;
  'user:offline': () => void;
}

export interface MoveData {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
  timeSpent: number;
}

export interface MatchmakingPreferences {
  timeControl: string;
  rated: boolean;
  variant: string;
  ratingRange?: {
    min: number;
    max: number;
  };
}

export interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

// Puzzle Types
export interface Puzzle {
  id: string;
  fen: string;
  moves: string;
  rating: number;
  themes: string[];
  title?: string;
  description?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PuzzleSolve {
  id: string;
  userId: string;
  puzzleId: string;
  solved: boolean;
  attempts: number;
  timeSpent: number;
  solvedAt: Date;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  type: TournamentType;
  timeControl: string;
  maxPlayers: number;
  rounds?: number;
  status: TournamentStatus;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  players: TournamentPlayer[];
}

export interface TournamentPlayer {
  id: string;
  tournamentId: string;
  userId: string;
  user: User;
  score: number;
  rank?: number;
  joinedAt: Date;
}

export enum TournamentType {
  SWISS = 'SWISS',
  ROUND_ROBIN = 'ROUND_ROBIN',
  KNOCKOUT = 'KNOCKOUT',
  ARENA = 'ARENA'
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Game Analysis Types
export interface EngineEvaluation {
  depth: number;
  score: {
    type: 'cp' | 'mate';
    value: number;
  };
  bestMove: string;
  pv: string[]; // principal variation
  nodes: number;
  time: number;
}

export interface MoveAnalysis {
  move: string;
  evaluation: EngineEvaluation;
  classification: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  comment?: string;
}

export interface GameAnalysis {
  gameId: string;
  moves: MoveAnalysis[];
  openingName?: string;
  openingEco?: string;
  accuracy: {
    white: number;
    black: number;
  };
  createdAt: Date;
}

// Time Control Types
export interface TimeControl {
  initial: number; // initial time in seconds
  increment: number; // increment per move in seconds
  name: string; // e.g., "Blitz", "Rapid", "Classical"
}

export const TIME_CONTROLS: TimeControl[] = [
  { initial: 60, increment: 1, name: 'Bullet' },
  { initial: 180, increment: 2, name: 'Blitz' },
  { initial: 600, increment: 5, name: 'Rapid' },
  { initial: 1800, increment: 30, name: 'Classical' },
];

// Board Theme Types
export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  preview: string;
}

export interface PieceSet {
  id: string;
  name: string;
  preview: string;
}

// Error Types
export class ChessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ChessError';
  }
}

export class GameError extends ChessError {
  constructor(message: string, code: string = 'GAME_ERROR') {
    super(message, code, 400);
    this.name = 'GameError';
  }
}

export class AuthError extends ChessError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
  }
} 