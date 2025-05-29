import { EventEmitter } from 'events'

export interface GameTimer {
  whiteTime: number
  blackTime: number
  activePlayer: 'white' | 'black' | null
  lastMoveTime: number | null
  increment: number
  isRunning: boolean
}

export interface ServerGameState {
  id: string
  players: {
    white?: { id: string; socketId: string; name: string }
    black?: { id: string; socketId: string; name: string }
  }
  fen: string
  turn: 'white' | 'black'
  moveHistory: any[]
  timer: GameTimer
  timeControl: string
  status: 'waiting' | 'active' | 'finished'
  winner?: 'white' | 'black' | 'draw'
  endReason?: 'checkmate' | 'resignation' | 'timeout' | 'draw'
  createdAt: number
  lastActivity: number
}

export class GameManager extends EventEmitter {
  private games: Map<string, ServerGameState> = new Map()
  private playerToGame: Map<string, string> = new Map()
  private timerIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    super()
    // Clean up inactive games every 5 minutes
    setInterval(() => this.cleanupInactiveGames(), 5 * 60 * 1000)
  }

  createGame(gameId: string, timeControl: string): ServerGameState {
    const { initialTime, increment } = this.parseTimeControl(timeControl)
    
    const game: ServerGameState = {
      id: gameId,
      players: {},
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'white',
      moveHistory: [],
      timer: {
        whiteTime: initialTime,
        blackTime: initialTime,
        activePlayer: null,
        lastMoveTime: null,
        increment,
        isRunning: false
      },
      timeControl,
      status: 'waiting',
      createdAt: Date.now(),
      lastActivity: Date.now()
    }

    this.games.set(gameId, game)
    console.log(`🎮 Game created: ${gameId} with time control ${timeControl}`)
    return game
  }

  joinGame(gameId: string, socketId: string, playerName: string): { success: boolean; color?: 'white' | 'black'; game?: ServerGameState } {
    const game = this.games.get(gameId)
    if (!game) {
      return { success: false }
    }

    // Assign player to available color
    let assignedColor: 'white' | 'black'
    if (!game.players.white) {
      assignedColor = 'white'
      game.players.white = { id: socketId, socketId, name: playerName }
    } else if (!game.players.black) {
      assignedColor = 'black'
      game.players.black = { id: socketId, socketId, name: playerName }
    } else {
      return { success: false } // Game is full
    }

    this.playerToGame.set(socketId, gameId)
    game.lastActivity = Date.now()

    // Start game if both players joined
    if (game.players.white && game.players.black && game.status === 'waiting') {
      game.status = 'active'
      this.startGameTimer(gameId)
      console.log(`🚀 Game started: ${gameId}`)
    }

    console.log(`👤 Player ${playerName} joined game ${gameId} as ${assignedColor}`)
    return { success: true, color: assignedColor, game }
  }

  makeMove(gameId: string, socketId: string, move: any, newFen: string): { success: boolean; game?: ServerGameState } {
    const game = this.games.get(gameId)
    if (!game || game.status !== 'active') {
      return { success: false }
    }

    // Verify it's the player's turn
    const playerColor = this.getPlayerColor(gameId, socketId)
    if (!playerColor || playerColor !== game.turn) {
      return { success: false }
    }

    // Update game state
    game.fen = newFen
    game.moveHistory.push({
      ...move,
      timestamp: Date.now(),
      timeSpent: this.calculateTimeSpent(game)
    })
    game.turn = game.turn === 'white' ? 'black' : 'white'
    game.lastActivity = Date.now()

    // Handle timer
    this.switchTimer(gameId, game.turn)

    console.log(`♟️ Move made in game ${gameId}: ${move.san}`)
    return { success: true, game }
  }

  resignGame(gameId: string, socketId: string): { success: boolean; game?: ServerGameState } {
    const game = this.games.get(gameId)
    if (!game) {
      return { success: false }
    }

    const resigningColor = this.getPlayerColor(gameId, socketId)
    if (!resigningColor) {
      return { success: false }
    }

    game.status = 'finished'
    game.winner = resigningColor === 'white' ? 'black' : 'white'
    game.endReason = 'resignation'
    game.lastActivity = Date.now()

    this.stopGameTimer(gameId)
    console.log(`🏳️ Game ${gameId}: ${resigningColor} resigned`)
    return { success: true, game }
  }

  private startGameTimer(gameId: string): void {
    const game = this.games.get(gameId)
    if (!game) return

    // Start timer for white (first move)
    game.timer.activePlayer = 'white'
    game.timer.isRunning = true
    game.timer.lastMoveTime = Date.now()

    // Set up interval to update timer every second
    const interval = setInterval(() => {
      this.updateTimer(gameId)
    }, 1000)

    this.timerIntervals.set(gameId, interval)
    console.log(`⏰ Timer started for game ${gameId}`)
  }

  private switchTimer(gameId: string, newActivePlayer: 'white' | 'black'): void {
    const game = this.games.get(gameId)
    if (!game || !game.timer.isRunning) return

    const currentPlayer = game.timer.activePlayer
    const now = Date.now()

    // Add increment to player who just moved
    if (currentPlayer && game.timer.increment > 0) {
      const timeKey = `${currentPlayer}Time` as keyof Pick<GameTimer, 'whiteTime' | 'blackTime'>
      game.timer[timeKey] += game.timer.increment
    }

    // Switch to new player
    game.timer.activePlayer = newActivePlayer
    game.timer.lastMoveTime = now

    // Emit timer update
    this.emit('timerUpdate', gameId, game.timer)
  }

  private updateTimer(gameId: string): void {
    const game = this.games.get(gameId)
    if (!game || !game.timer.isRunning || !game.timer.activePlayer) return

    const timeKey = `${game.timer.activePlayer}Time` as keyof Pick<GameTimer, 'whiteTime' | 'blackTime'>
    
    // Subtract 1 second
    game.timer[timeKey] -= 1

    // Check for timeout
    if (game.timer[timeKey] <= 0) {
      game.timer[timeKey] = 0
      game.status = 'finished'
      game.winner = game.timer.activePlayer === 'white' ? 'black' : 'white'
      game.endReason = 'timeout'
      game.timer.isRunning = false
      
      this.stopGameTimer(gameId)
      this.emit('gameTimeout', gameId, game.timer.activePlayer, game)
      console.log(`⏰ Timeout in game ${gameId}: ${game.timer.activePlayer} ran out of time`)
      return
    }

    // Emit timer update to clients
    this.emit('timerUpdate', gameId, game.timer)
  }

  private stopGameTimer(gameId: string): void {
    const interval = this.timerIntervals.get(gameId)
    if (interval) {
      clearInterval(interval)
      this.timerIntervals.delete(gameId)
    }

    const game = this.games.get(gameId)
    if (game) {
      game.timer.isRunning = false
      game.timer.activePlayer = null
    }

    console.log(`⏰ Timer stopped for game ${gameId}`)
  }

  private calculateTimeSpent(game: ServerGameState): number {
    if (!game.timer.lastMoveTime || !game.timer.activePlayer) return 0
    return Math.floor((Date.now() - game.timer.lastMoveTime) / 1000)
  }

  private parseTimeControl(timeControl: string): { initialTime: number; increment: number } {
    const [minutes, increment] = timeControl.split('+').map(Number)
    return {
      initialTime: minutes * 60,
      increment: increment || 0
    }
  }

  private getPlayerColor(gameId: string, socketId: string): 'white' | 'black' | null {
    const game = this.games.get(gameId)
    if (!game) return null

    if (game.players.white?.socketId === socketId) return 'white'
    if (game.players.black?.socketId === socketId) return 'black'
    return null
  }

  private cleanupInactiveGames(): void {
    const now = Date.now()
    const maxInactiveTime = 30 * 60 * 1000 // 30 minutes

    for (const [gameId, game] of this.games.entries()) {
      if (now - game.lastActivity > maxInactiveTime) {
        this.stopGameTimer(gameId)
        this.games.delete(gameId)
        
        // Clean up player mappings
        if (game.players.white) this.playerToGame.delete(game.players.white.socketId)
        if (game.players.black) this.playerToGame.delete(game.players.black.socketId)
        
        console.log(`🧹 Cleaned up inactive game: ${gameId}`)
      }
    }
  }

  getGame(gameId: string): ServerGameState | undefined {
    return this.games.get(gameId)
  }

  getPlayerGame(socketId: string): ServerGameState | undefined {
    const gameId = this.playerToGame.get(socketId)
    return gameId ? this.games.get(gameId) : undefined
  }

  removePlayer(socketId: string): void {
    const gameId = this.playerToGame.get(socketId)
    if (!gameId) return

    const game = this.games.get(gameId)
    if (!game) return

    // Remove player from game
    if (game.players.white?.socketId === socketId) {
      delete game.players.white
    } else if (game.players.black?.socketId === socketId) {
      delete game.players.black
    }

    this.playerToGame.delete(socketId)

    // If game was active and a player left, end the game
    if (game.status === 'active') {
      game.status = 'finished'
      game.endReason = 'resignation'
      this.stopGameTimer(gameId)
    }

    console.log(`👋 Player ${socketId} removed from game ${gameId}`)
  }
}

export const gameManager = new GameManager() 