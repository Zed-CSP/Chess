import { Bot, Users, Eye, Crown } from 'lucide-react'
import { GameConfig, Player, GameState, PlayerColor } from '../types'
import { TimerDisplay } from './TimerDisplay'

interface GameInfoProps {
  config: GameConfig
  players: {white?: Player, black?: Player}
  gameState: GameState
  isThinking: boolean
  whiteTime: number
  blackTime: number
  activeTimer: PlayerColor | null
  formatTime: (seconds: number) => string
}

export const GameInfo = ({ 
  config, 
  players, 
  gameState, 
  isThinking, 
  whiteTime, 
  blackTime, 
  activeTimer, 
  formatTime 
}: GameInfoProps) => {
  return (
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
          
          {/* Timer for Black */}
          <TimerDisplay
            time={blackTime}
            isActive={activeTimer === 'black'}
            player="black"
            formatTime={formatTime}
          />
          
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
          
          {/* Timer for White */}
          <TimerDisplay
            time={whiteTime}
            isActive={activeTimer === 'white'}
            player="white"
            formatTime={formatTime}
          />
          
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
            <div className="text-xs text-gray-600 mb-1">Captured by Black:</div>
            <div className="flex flex-wrap gap-1">
              {gameState.capturedPieces.black.map((piece, index) => (
                <span key={index} className="text-lg">
                  {piece === 'p' ? '♙' : piece === 'r' ? '♖' : piece === 'n' ? '♘' : 
                   piece === 'b' ? '♗' : piece === 'q' ? '♕' : '♔'}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Captured by White:</div>
            <div className="flex flex-wrap gap-1">
              {gameState.capturedPieces.white.map((piece, index) => (
                <span key={index} className="text-lg">
                  {piece === 'p' ? '♟' : piece === 'r' ? '♜' : piece === 'n' ? '♞' : 
                   piece === 'b' ? '♝' : piece === 'q' ? '♛' : '♚'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 