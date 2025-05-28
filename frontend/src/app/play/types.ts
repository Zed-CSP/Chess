import { Move, PieceSymbol } from 'chess.js'

// Game mode types
export type GameMode = 'human-vs-human' | 'human-vs-ai' | 'spectator' | 'analysis'
export type TimeControl = '1+0' | '3+2' | '5+0' | '10+5' | '15+10' | '30+30'
export type PlayerColor = 'white' | 'black'

// Game state interface
export interface GameState {
  fen: string
  turn: PlayerColor
  gameOver: boolean
  winner?: PlayerColor | 'draw'
  check: boolean
  checkmate: boolean
  stalemate: boolean
  threefoldRepetition: boolean
  insufficientMaterial: boolean
  moveHistory: Move[]
  capturedPieces: {
    white: PieceSymbol[]
    black: PieceSymbol[]
  }
}

// Player interface
export interface Player {
  id: string
  name: string
  rating: number
  color: PlayerColor
  timeRemaining: number
  isConnected: boolean
  isAI?: boolean
}

// Game configuration
export interface GameConfig {
  mode: GameMode
  timeControl: TimeControl
  playerColor: PlayerColor
  aiDifficulty?: number
  gameId?: string
}

// UI State
export interface UIState {
  selectedSquare: string | null
  possibleMoves: string[]
  moveFrom: string | null
  rightClickedSquares: {[key: string]: any}
  showChat: boolean
  isThinking: boolean
  boardOrientation: PlayerColor
} 