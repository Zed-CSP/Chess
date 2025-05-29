import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Square } from 'chess.js'
import { RotateCcw, Flag, MessageSquare } from 'lucide-react'
import { GameState, PlayerColor, GameConfig } from '../types'
import { getBoardThemeStyles } from '../utils/boardThemes'

interface ChessBoardProps {
  gameState: GameState
  config: GameConfig
  boardOrientation: PlayerColor
  selectedSquare: Square | null
  possibleMoves: Square[]
  rightClickedSquares: {[key: string]: any}
  onSquareClick: (square: Square) => void
  onPieceDrop: (sourceSquare: Square, targetSquare: Square, piece: string) => boolean
  onSquareRightClick: (square: Square) => void
  onFlipBoard: () => void
  onResetGame: () => void
  onResignGame: () => void
  onToggleChat: () => void
}

export const ChessBoard = ({
  gameState,
  config,
  boardOrientation,
  selectedSquare,
  possibleMoves,
  rightClickedSquares,
  onSquareClick,
  onPieceDrop,
  onSquareRightClick,
  onFlipBoard,
  onResetGame,
  onResignGame,
  onToggleChat
}: ChessBoardProps) => {
  const themeStyles = getBoardThemeStyles(config.boardTheme)

  return (
    <div className="lg:col-span-2">
      <div className="game-card p-4">
        {/* Game Status */}
        <div className="mb-4 text-center">
          {gameState.gameOver ? (
            <div className="text-lg font-semibold">
              {gameState.resignation && (
                <span className={gameState.winner === 'white' ? 'text-green-600' : 'text-red-600'}>
                  {gameState.winner === 'white' ? 'Black' : 'White'} resigned! {gameState.winner === 'white' ? 'White' : 'Black'} wins
                </span>
              )}
              {gameState.timeout && (
                <span className={gameState.winner === 'white' ? 'text-green-600' : 'text-red-600'}>
                  {gameState.winner === 'white' ? 'Black' : 'White'} ran out of time! {gameState.winner === 'white' ? 'White' : 'Black'} wins
                </span>
              )}
              {gameState.checkmate && !gameState.resignation && !gameState.timeout && (
                <span className={gameState.winner === 'white' ? 'text-green-600' : 'text-red-600'}>
                  Checkmate! {gameState.winner === 'white' ? 'White' : 'Black'} wins
                </span>
              )}
              {gameState.stalemate && <span className="text-yellow-600">Stalemate - Draw</span>}
              {gameState.threefoldRepetition && <span className="text-yellow-600">Draw by repetition</span>}
              {gameState.insufficientMaterial && <span className="text-yellow-600">Draw by insufficient material</span>}
            </div>
          ) : (
            <div className="text-lg">
              <span className={`font-semibold ${gameState.turn === 'white' ? 'text-gray-800' : 'text-gray-600'}`}>
                {gameState.turn === 'white' ? 'White' : 'Black'} to move
              </span>
              {gameState.check && <span className="text-red-600 ml-2">• Check!</span>}
            </div>
          )}
        </div>
        
        {/* Chess Board */}
        <div className="chess-board max-w-lg mx-auto">
          <Chessboard
            position={gameState.fen}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            boardOrientation={boardOrientation}
            customDarkSquareStyle={themeStyles.darkSquareStyle}
            customLightSquareStyle={themeStyles.lightSquareStyle}
            customSquareStyles={{
              ...(selectedSquare && {
                [selectedSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
              }),
              ...possibleMoves.reduce((acc, square) => ({
                ...acc,
                [square]: { backgroundColor: 'rgba(0, 255, 0, 0.3)' }
              }), {}),
              ...rightClickedSquares
            }}
            onSquareRightClick={onSquareRightClick}
          />
        </div>
        
        {/* Game Controls */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={onFlipBoard}
            className="btn btn-ghost btn-sm"
            title="Flip board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={onResetGame}
            className="btn btn-secondary btn-sm"
            disabled={gameState.moveHistory.length === 0}
          >
            New Game
          </button>
          
          {!gameState.gameOver && (
            <button
              onClick={onResignGame}
              className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
            >
              <Flag className="w-4 h-4 mr-1" />
              Resign
            </button>
          )}
          
          <button
            onClick={onToggleChat}
            className="btn btn-ghost btn-sm"
            title="Toggle chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 