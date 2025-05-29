import { Settings } from 'lucide-react'
import { GameState, GameConfig, BoardTheme } from '../types'

interface GameSidebarProps {
  gameState: GameState
  config: GameConfig
  onConfigChange: (newConfig: Partial<GameConfig>) => void
}

export const GameSidebar = ({ gameState, config, onConfigChange }: GameSidebarProps) => {
  const handleThemeChange = (theme: BoardTheme) => {
    onConfigChange({ boardTheme: theme })
  }

  return (
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
            <select 
              className="form-input text-sm"
              value={config.boardTheme || 'classic'}
              onChange={(e) => handleThemeChange(e.target.value as BoardTheme)}
            >
              <option value="classic">Classic</option>
              <option value="wood">Wood</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
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
                onChange={(e) => onConfigChange({
                  aiDifficulty: parseInt(e.target.value)
                })}
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
  )
} 