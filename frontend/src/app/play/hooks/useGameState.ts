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
    
    setGameState({
      fen: chessInstance.fen(),
      turn: chessInstance.turn() === 'w' ? 'white' : 'black',
      gameOver: chessInstance.isGameOver(),
      winner: chessInstance.isCheckmate() 
        ? (chessInstance.turn() === 'w' ? 'black' : 'white')
        : chessInstance.isDraw() ? 'draw' : undefined,
      check: chessInstance.inCheck(),
      checkmate: chessInstance.isCheckmate(),
      stalemate: chessInstance.isStalemate(),
      threefoldRepetition: chessInstance.isThreefoldRepetition(),
      insufficientMaterial: chessInstance.isInsufficientMaterial(),
      moveHistory: history,
      capturedPieces
    })
  }, [])

  // Reset game
  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game - clearing all captured pieces')
    const newGame = new Chess()
    setGame(newGame)
    updateGameState(newGame)
  }, [updateGameState])

  return {
    game,
    gameState,
    setGame,
    updateGameState,
    resetGame
  }
} 