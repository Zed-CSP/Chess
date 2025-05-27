'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Chess, Square, Move, PieceSymbol } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { io, Socket } from 'socket.io-client'
import { 
  Clock, 
  RotateCcw, 
  Flag, 
  MessageSquare, 
  Settings, 
  Eye,
  Bot,
  Users,
  Crown
} from 'lucide-react'

// Game mode types
type GameMode = 'human-vs-human' | 'human-vs-ai' | 'spectator' | 'analysis'
type TimeControl = '1+0' | '3+2' | '5+0' | '10+5' | '15+10' | '30+30'
type PlayerColor = 'white' | 'black'

// Game state interface
interface GameState {
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
interface Player {
  id: string
  name: string
  rating: number
  color: PlayerColor
  timeRemaining: number
  isConnected: boolean
  isAI?: boolean
}

// Game configuration
interface GameConfig {
  mode: GameMode
  timeControl: TimeControl
  playerColor: PlayerColor
  aiDifficulty?: number
  gameId?: string
}

export default function ChessGamePage() {
  const searchParams = useSearchParams()
  
  // Core game state
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
  
  // Game configuration
  const [config, setConfig] = useState<GameConfig>({
    mode: 'human-vs-human',
    timeControl: '10+5',
    playerColor: 'white'
  })
  
  // Players
  const [players, setPlayers] = useState<{white?: Player, black?: Player}>({})
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  
  // UI state
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>('white')
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([])
  const [moveFrom, setMoveFrom] = useState<Square | null>(null)
  const [rightClickedSquares, setRightClickedSquares] = useState<{[key: string]: any}>({})
  const [showChat, setShowChat] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  
  // Socket connection
  const socketRef = useRef<Socket | null>(null)
  
  // Initialize game configuration from URL params
  useEffect(() => {
    const mode = searchParams.get('mode') as GameMode || 'human-vs-human'
    const timeControl = searchParams.get('time') as TimeControl || '10+5'
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
  
  // Handle piece selection and move validation
  const onSquareClick = useCallback((square: Square) => {
    // If it's not the player's turn in multiplayer, ignore clicks
    if (config.mode === 'human-vs-human' && gameState.turn !== config.playerColor) {
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
  }, [game, gameState, config, moveFrom])
  
  // Make a move
  const makeMove = useCallback(async (from: Square, to: Square, promotion?: string) => {
    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({
        from,
        to,
        promotion: promotion as any
      })
      
      if (move) {
        setGame(gameCopy)
        updateGameState(gameCopy)
        
        // Clear selection
        setMoveFrom(null)
        setSelectedSquare(null)
        setPossibleMoves([])
        
        // Send move to server for multiplayer
        if (config.mode === 'human-vs-human' && socketRef.current) {
          socketRef.current.emit('make-move', {
            gameId: config.gameId,
            move: { from, to, promotion }
          })
        }
        
        // Handle AI response
        if (config.mode === 'human-vs-ai' && gameState.turn !== config.playerColor) {
          await handleAIMove(gameCopy)
        }
        
        return true
      }
    } catch (error) {
      console.error('Invalid move:', error)
    }
    return false
  }, [game, gameState, config, updateGameState])
  
  // Handle AI move
  const handleAIMove = useCallback(async (currentGame: Chess) => {
    if (currentGame.isGameOver()) return
    
    setIsThinking(true)
    
    try {
      // Call AI service
      const response = await fetch('http://localhost:8000/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: currentGame.fen(),
          difficulty: config.aiDifficulty || 5
        })
      })
      
      if (response.ok) {
        const { move } = await response.json()
        
        // Add slight delay for realism
        setTimeout(() => {
          const gameCopy = new Chess(currentGame.fen())
          const aiMove = gameCopy.move(move)
          
          if (aiMove) {
            setGame(gameCopy)
            updateGameState(gameCopy)
          }
          
          setIsThinking(false)
        }, 1000 + Math.random() * 2000) // 1-3 second delay
      }
    } catch (error) {
      console.error('AI move failed:', error)
      setIsThinking(false)
    }
  }, [config.aiDifficulty, updateGameState])
  
  // Socket event handlers
  const handleOpponentMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen())
    const madeMove = gameCopy.move(move)
    
    if (madeMove) {
      setGame(gameCopy)
      updateGameState(gameCopy)
    }
  }, [game, updateGameState])
  
  const handleGameStateUpdate = useCallback((state: any) => {
    // Handle game state updates from server
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
  
  // Piece drag and drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    // Check if it's a valid move
    const move = game.moves({ square: sourceSquare, verbose: true })
      .find(m => m.to === targetSquare)
    
    if (move) {
      makeMove(sourceSquare, targetSquare, move.promotion)
      return true
    }
    
    return false
  }, [game, makeMove])
  
  // Reset game
  const resetGame = useCallback(() => {
    const newGame = new Chess()
    setGame(newGame)
    updateGameState(newGame)
    setMoveFrom(null)
    setSelectedSquare(null)
    setPossibleMoves([])
  }, [updateGameState])
  
  // Resign game
  const resignGame = useCallback(() => {
    if (socketRef.current && config.gameId) {
      socketRef.current.emit('resign', { gameId: config.gameId })
    }
    // Handle local resignation
  }, [config.gameId])
  
  // Flip board
  const flipBoard = useCallback(() => {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Game Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Game Mode Indicator */}
            <div className="game-card">
              <div className="flex items-center space-x-2 mb-3">
                {config.mode === 'human-vs-ai' && <Bot className="w-5 h-5 text-blue-600" />}
                {config.mode === 'human-vs-human' && <Users className="w-5 h-5 text-green-600" />}
                {config.mode === 'spectator' && <Eye className="w-5 h-5 text-purple-600" />}
                <span className="font-semibold capitalize">
                  {config.mode.replace('-', ' ')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Time Control: {config.timeControl}
              </div>
            </div>
            
            {/* Players */}
            <div className="space-y-3">
              {/* Black Player */}
              <div className="player-info">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {players.black?.name || (config.mode === 'human-vs-ai' && config.playerColor === 'white' ? 'AI' : 'Waiting...')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {players.black?.rating || (config.mode === 'human-vs-ai' ? `AI Level ${config.aiDifficulty}` : '---')}
                  </div>
                </div>
                {isThinking && gameState.turn === 'black' && config.mode === 'human-vs-ai' && (
                  <div className="loading-spinner w-4 h-4" />
                )}
              </div>
              
              {/* White Player */}
              <div className="player-info">
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-gray-800" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {players.white?.name || (config.mode === 'human-vs-ai' && config.playerColor === 'black' ? 'AI' : 'You')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {players.white?.rating || (config.mode === 'human-vs-ai' ? `AI Level ${config.aiDifficulty}` : '1200')}
                  </div>
                </div>
                {isThinking && gameState.turn === 'white' && config.mode === 'human-vs-ai' && (
                  <div className="loading-spinner w-4 h-4" />
                )}
              </div>
            </div>
            
            {/* Captured Pieces */}
            <div className="game-card">
              <h3 className="font-semibold mb-3">Captured Pieces</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Black captured:</div>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.black.map((piece, index) => (
                      <span key={index} className="text-lg">
                        {piece === 'p' ? '♟' : piece === 'r' ? '♜' : piece === 'n' ? '♞' : 
                         piece === 'b' ? '♝' : piece === 'q' ? '♛' : '♚'}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">White captured:</div>
                  <div className="flex flex-wrap gap-1">
                    {gameState.capturedPieces.white.map((piece, index) => (
                      <span key={index} className="text-lg">
                        {piece === 'p' ? '♙' : piece === 'r' ? '♖' : piece === 'n' ? '♘' : 
                         piece === 'b' ? '♗' : piece === 'q' ? '♕' : '♔'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center - Chess Board */}
          <div className="lg:col-span-2">
            <div className="game-card p-4">
              {/* Game Status */}
              <div className="mb-4 text-center">
                {gameState.gameOver ? (
                  <div className="text-lg font-semibold">
                    {gameState.checkmate && (
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
                  onSquareRightClick={(square) => {
                    setRightClickedSquares(prev => ({
                      ...prev,
                      [square]: prev[square] ? undefined : { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
                    }))
                  }}
                />
              </div>
              
              {/* Game Controls */}
              <div className="flex justify-center space-x-2 mt-4">
                <button
                  onClick={flipBoard}
                  className="btn btn-ghost btn-sm"
                  title="Flip board"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={resetGame}
                  className="btn btn-secondary btn-sm"
                  disabled={gameState.moveHistory.length === 0}
                >
                  New Game
                </button>
                
                {!gameState.gameOver && (
                  <button
                    onClick={resignGame}
                    className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Resign
                  </button>
                )}
                
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="btn btn-ghost btn-sm"
                  title="Toggle chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Move History & Analysis */}
          <div className="lg:col-span-1 space-y-4">
            {/* Move History */}
            <div className="game-card">
              <h3 className="font-semibold mb-3">Move History</h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {gameState.moveHistory.length === 0 ? (
                  <div className="text-gray-500 text-sm">No moves yet</div>
                ) : (
                  gameState.moveHistory.map((move, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{Math.floor(index / 2) + 1}.</span>
                      <span className="font-mono">{move.san}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Game Settings */}
            <div className="game-card">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="w-4 h-4" />
                <h3 className="font-semibold">Settings</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="form-label">Board Theme</label>
                  <select className="form-input text-sm">
                    <option>Classic</option>
                    <option>Wood</option>
                    <option>Blue</option>
                    <option>Green</option>
                  </select>
                </div>
                
                {config.mode === 'human-vs-ai' && (
                  <div>
                    <label className="form-label">AI Difficulty</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={config.aiDifficulty || 5}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        aiDifficulty: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-600 text-center">
                      Level {config.aiDifficulty || 5}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 