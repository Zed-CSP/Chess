'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Chess, Square } from 'chess.js'
import { io, Socket } from 'socket.io-client'

// Import types
import { GameConfig, Player, PlayerColor } from './types'

// Import hooks
import { useGameState, useAI, useChessMove } from './hooks'

// Import components
import { GameInfo, ChessBoard, GameSidebar } from './components'

export default function ChessGamePage() {
  const searchParams = useSearchParams()
  
  // Core game state
  const { game, gameState, setGame, updateGameState, resetGame } = useGameState()
  
  // Game configuration
  const [config, setConfig] = useState<GameConfig>({
    mode: 'human-vs-human',
    timeControl: '10+5',
    playerColor: 'white'
  })
  
  // Players
  const [players, setPlayers] = useState<{white?: Player, black?: Player}>({})
  
  // UI state
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>('white')
  const [rightClickedSquares, setRightClickedSquares] = useState<{[key: string]: any}>({})
  const [showChat, setShowChat] = useState(false)
  
  // Socket connection
  const socketRef = useRef<Socket | null>(null)
  
  // AI functionality
  const { isThinking, handleAIMove } = useAI(config, updateGameState, setGame)
  
  // Chess move functionality
  const {
    selectedSquare,
    possibleMoves,
    moveFrom,
    onSquareClick,
    onPieceDrop,
    clearSelection
  } = useChessMove(game, gameState, config, updateGameState, setGame, handleAIMove, socketRef)

  // Initialize game configuration from URL params
  useEffect(() => {
    const mode = searchParams.get('mode') as any || 'human-vs-human'
    const timeControl = searchParams.get('time') as any || '10+5'
    const color = searchParams.get('color') as PlayerColor || 'white'
    const gameId = searchParams.get('gameId') || undefined
    const aiDifficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : 5
    
    setConfig({
      mode,
      timeControl,
      playerColor: color,
      gameId,
      aiDifficulty
    })
    
    setBoardOrientation(color)
  }, [searchParams])
  
  // Initialize socket connection
  useEffect(() => {
    if (config.mode === 'human-vs-human' || config.mode === 'spectator') {
      socketRef.current = io('http://localhost:3001')
      
      socketRef.current.on('connect', () => {
        console.log('Connected to game server')
        if (config.gameId) {
          socketRef.current?.emit('join-game', config.gameId)
        }
      })
      
      socketRef.current.on('move-made', handleOpponentMove)
      socketRef.current.on('game-state-update', handleGameStateUpdate)
      socketRef.current.on('player-joined', handlePlayerJoined)
      socketRef.current.on('player-left', handlePlayerLeft)
      
      return () => {
        socketRef.current?.disconnect()
      }
    }
  }, [config])

  // Socket event handlers
  const handleOpponentMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen())
    const madeMove = gameCopy.move(move)
    
    if (madeMove) {
      setGame(gameCopy)
      updateGameState(gameCopy)
    }
  }, [game, updateGameState, setGame])
  
  const handleGameStateUpdate = useCallback((state: any) => {
    console.log('Game state update:', state)
  }, [])
  
  const handlePlayerJoined = useCallback((player: Player) => {
    setPlayers(prev => ({
      ...prev,
      [player.color]: player
    }))
  }, [])
  
  const handlePlayerLeft = useCallback((playerId: string) => {
    setPlayers(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(color => {
        if (updated[color as PlayerColor]?.id === playerId) {
          delete updated[color as PlayerColor]
        }
      })
      return updated
    })
  }, [])

  // Handle AI first move when human plays as black
  useEffect(() => {
    console.log('🔍 Checking AI first move conditions:', {
      mode: config.mode,
      playerColor: config.playerColor,
      turn: gameState.turn,
      moveCount: gameState.moveHistory.length,
      gameOver: gameState.gameOver
    })
    
    if (config.mode === 'human-vs-ai' && 
        config.playerColor === 'black' && 
        gameState.turn === 'white' && 
        gameState.moveHistory.length === 0 &&
        !gameState.gameOver) {
      console.log('🎯 AI should make first move as white!')
      handleAIMove(game)
    } else {
      console.log('⏭️ AI first move conditions not met')
    }
  }, [config.mode, config.playerColor, gameState.turn, gameState.moveHistory.length, gameState.gameOver, game, handleAIMove])

  // Game control handlers
  const handleResetGame = useCallback(() => {
    resetGame()
    clearSelection()
  }, [resetGame, clearSelection])
  
  const handleResignGame = useCallback(() => {
    if (socketRef.current && config.gameId) {
      socketRef.current.emit('resign', { gameId: config.gameId })
    }
  }, [config.gameId])
  
  const handleFlipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }, [])

  const handleToggleChat = useCallback(() => {
    setShowChat(prev => !prev)
  }, [])

  const handleSquareRightClick = useCallback((square: Square) => {
    setRightClickedSquares(prev => ({
      ...prev,
      [square]: prev[square] ? undefined : { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
    }))
  }, [])

  const handleConfigChange = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Game Info */}
          <GameInfo 
            config={config}
            players={players}
            gameState={gameState}
            isThinking={isThinking}
          />
          
          {/* Center - Chess Board */}
          <ChessBoard
            gameState={gameState}
            boardOrientation={boardOrientation}
            selectedSquare={selectedSquare}
            possibleMoves={possibleMoves}
            rightClickedSquares={rightClickedSquares}
            onSquareClick={onSquareClick}
            onPieceDrop={onPieceDrop}
            onSquareRightClick={handleSquareRightClick}
            onFlipBoard={handleFlipBoard}
            onResetGame={handleResetGame}
            onResignGame={handleResignGame}
            onToggleChat={handleToggleChat}
          />
          
          {/* Right Sidebar - Move History & Analysis */}
          <GameSidebar
            gameState={gameState}
            config={config}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>
    </div>
  )
} 