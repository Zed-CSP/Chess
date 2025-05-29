import { useState, useCallback } from 'react'
import { Chess, Square } from 'chess.js'
import { GameConfig, GameState } from '../types'

export const useChessMove = (
  game: Chess,
  gameState: GameState,
  config: GameConfig,
  updateGameState: (game: Chess) => void,
  setGame: (game: Chess) => void,
  handleAIMove: (game: Chess) => Promise<void>,
  socketRef: React.MutableRefObject<any>
) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])
  const [moveFrom, setMoveFrom] = useState<Square | null>(null)

  // Make a move
  const makeMove = useCallback(async (from: Square, to: Square, promotion?: string) => {
    console.log('🎮 Making move:', from, 'to', to)
    try {
      // Use clone() to preserve move history instead of creating from FEN
      const gameCopy = new Chess(game.fen())
      // Rebuild the move history by replaying all moves
      const originalHistory = game.history()
      const tempGame = new Chess()
      originalHistory.forEach(moveStr => {
        tempGame.move(moveStr)
      })
      
      const move = tempGame.move({
        from,
        to,
        promotion: promotion as any
      })
      
      if (move) {
        console.log('✅ Human move applied:', move)
        setGame(tempGame)
        updateGameState(tempGame)
        
        // Clear selection
        setMoveFrom(null)
        setSelectedSquare(null)
        setPossibleMoves([])
        
        // Send move to server for multiplayer
        if (config.mode === 'human-vs-human' && socketRef.current) {
          socketRef.current.emit('make-move', {
            gameId: config.gameId,
            move: { from, to, promotion },
            newFen: tempGame.fen()
          })
        }
        
        // Handle AI response - check if it's now the AI's turn
        if (config.mode === 'human-vs-ai') {
          const currentTurn = tempGame.turn() === 'w' ? 'white' : 'black'
          const isAITurn = currentTurn !== config.playerColor
          
          console.log('🤔 After human move - Current turn:', currentTurn, 'Player color:', config.playerColor, 'Is AI turn:', isAITurn)
          
          if (isAITurn && !tempGame.isGameOver()) {
            console.log('🚀 Triggering AI move...')
            await handleAIMove(tempGame)
          } else {
            console.log('⏸️ Not triggering AI move - Game over:', tempGame.isGameOver(), 'Is AI turn:', isAITurn)
          }
        }
        
        return true
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
    return false
  }, [game, gameState, config, updateGameState, setGame, handleAIMove, socketRef])

  // Handle piece selection and move validation
  const onSquareClick = useCallback((square: Square) => {
    // If it's not the player's turn in multiplayer, ignore clicks
    if (config.mode === 'human-vs-human' && gameState.turn !== config.playerColor) {
      return
    }
    
    // If it's not the player's turn in AI mode, ignore clicks
    if (config.mode === 'human-vs-ai' && gameState.turn !== config.playerColor) {
      return
    }
    
    // If game is over, ignore clicks
    if (gameState.gameOver) return
    
    const piece = game.get(square)
    
    if (!moveFrom) {
      // First click - select piece
      if (piece && piece.color === (gameState.turn === 'white' ? 'w' : 'b')) {
        setMoveFrom(square)
        setSelectedSquare(square)
        const moves = game.moves({ square, verbose: true })
        setPossibleMoves(moves.map(move => move.to as Square))
      }
    } else {
      // Second click - attempt move
      if (square === moveFrom) {
        // Clicking same square - deselect
        setMoveFrom(null)
        setSelectedSquare(null)
        setPossibleMoves([])
      } else {
        // Attempt to make move
        makeMove(moveFrom, square)
      }
    }
  }, [game, gameState, config, moveFrom, makeMove])

  // Piece drag and drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    // If it's not the player's turn in multiplayer, ignore drops
    if (config.mode === 'human-vs-human' && gameState.turn !== config.playerColor) {
      return false
    }
    
    // If it's not the player's turn in AI mode, ignore drops
    if (config.mode === 'human-vs-ai' && gameState.turn !== config.playerColor) {
      return false
    }
    
    // If game is over, ignore drops
    if (gameState.gameOver) return false
    
    // Check if it's a valid move
    const move = game.moves({ square: sourceSquare, verbose: true })
      .find(m => m.to === targetSquare)
    
    if (move) {
      makeMove(sourceSquare, targetSquare, move.promotion)
      return true
    }
    
    return false
  }, [game, gameState, config, makeMove])

  // Clear selection
  const clearSelection = useCallback(() => {
    setMoveFrom(null)
    setSelectedSquare(null)
    setPossibleMoves([])
  }, [])

  return {
    selectedSquare,
    possibleMoves,
    moveFrom,
    makeMove,
    onSquareClick,
    onPieceDrop,
    clearSelection
  }
} 