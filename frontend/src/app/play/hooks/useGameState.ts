import { useState, useCallback } from 'react'
import { Chess, Move, PieceSymbol } from 'chess.js'
import { GameState, PlayerColor } from '../types'

export const useGameState = () => {
  const [game, setGame] = useState<Chess>(new Chess())
  const [gameState, setGameState] = useState<GameState>({
    fen: new Chess().fen(),
    turn: 'white',
    gameOver: false,
    check: false,
    checkmate: false,
    stalemate: false,
    threefoldRepetition: false,
    insufficientMaterial: false,
    resignation: false,
    timeout: false,
    moveHistory: [],
    capturedPieces: { white: [], black: [] }
  })

  // Update game state when chess instance changes
  const updateGameState = useCallback((chessInstance: Chess) => {
    const history = chessInstance.history({ verbose: true })
    const capturedPieces = { white: [] as PieceSymbol[], black: [] as PieceSymbol[] }
    
    console.log('🔍 Calculating captured pieces from history:', history.length, 'moves')
    
    // Calculate captured pieces - attribute to the player who made the capture
    history.forEach((move, index) => {
      if (move.captured) {
        // The player who made the move is the one who captured the piece
        const capturingPlayer = move.color === 'w' ? 'white' : 'black'
        capturedPieces[capturingPlayer].push(move.captured as PieceSymbol)
        console.log(`📦 Move ${index + 1}: ${capturingPlayer} captured ${move.captured} (${move.san})`)
      }
    })
    
    console.log('🏆 Final captured pieces:', capturedPieces)
    
    setGameState(prev => ({
      fen: chessInstance.fen(),
      turn: chessInstance.turn() === 'w' ? 'white' : 'black',
      gameOver: chessInstance.isGameOver() || prev.resignation || prev.timeout,
      winner: chessInstance.isCheckmate() 
        ? (chessInstance.turn() === 'w' ? 'black' : 'white')
        : chessInstance.isDraw() ? 'draw' 
        : prev.resignation ? (prev.winner || undefined)
        : prev.timeout ? (prev.winner || undefined)
        : undefined,
      check: chessInstance.inCheck(),
      checkmate: chessInstance.isCheckmate(),
      stalemate: chessInstance.isStalemate(),
      threefoldRepetition: chessInstance.isThreefoldRepetition(),
      insufficientMaterial: chessInstance.isInsufficientMaterial(),
      resignation: prev.resignation,
      timeout: prev.timeout,
      moveHistory: history,
      capturedPieces
    }))
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game - clearing all captured pieces')
    const newGame = new Chess()
    setGame(newGame)
    setGameState({
      fen: newGame.fen(),
      turn: 'white',
      gameOver: false,
      check: false,
      checkmate: false,
      stalemate: false,
      threefoldRepetition: false,
      insufficientMaterial: false,
      resignation: false,
      timeout: false,
      moveHistory: [],
      capturedPieces: { white: [], black: [] }
    })
  }, [])

  // Resign game
  const resignGame = useCallback((resigningPlayer: PlayerColor) => {
    console.log('🏳️ Game resigned by:', resigningPlayer)
    // Update game state to show resignation
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: resigningPlayer === 'white' ? 'black' : 'white',
      resignation: true
    }))
  }, [])

  // Timeout game
  const timeoutGame = useCallback((timeoutPlayer: PlayerColor) => {
    console.log('⏰ Game timeout by:', timeoutPlayer)
    // Update game state to show timeout
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: timeoutPlayer === 'white' ? 'black' : 'white',
      timeout: true
    }))
  }, [])

  return {
    game,
    gameState,
    setGame,
    updateGameState,
    resetGame,
    resignGame,
    timeoutGame
  }
} 