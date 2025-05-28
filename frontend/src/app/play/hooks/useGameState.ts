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
    
    // Calculate captured pieces
    history.forEach(move => {
      if (move.captured) {
        const capturedColor = move.color === 'w' ? 'black' : 'white'
        capturedPieces[capturedColor].push(move.captured as PieceSymbol)
      }
    })
    
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