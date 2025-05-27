'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bot, 
  Users, 
  Clock, 
  Zap, 
  Brain, 
  Trophy,
  Play,
  Settings,
  ChevronRight
} from 'lucide-react'

type GameMode = 'human-vs-ai' | 'human-vs-human' | 'quick-match'
type TimeControl = '1+0' | '3+2' | '5+0' | '10+5' | '15+10' | '30+30'
type PlayerColor = 'white' | 'black' | 'random'

interface GameConfig {
  mode: GameMode
  timeControl: TimeControl
  color: PlayerColor
  aiDifficulty?: number
}

export default function GameLobbyPage() {
  const router = useRouter()
  const [config, setConfig] = useState<GameConfig>({
    mode: 'human-vs-ai',
    timeControl: '10+5',
    color: 'white',
    aiDifficulty: 5
  })
  const [isSearching, setIsSearching] = useState(false)

  const timeControls = [
    { value: '1+0', name: 'Bullet', description: '1 minute', icon: Zap },
    { value: '3+2', name: 'Blitz', description: '3 min + 2 sec', icon: Clock },
    { value: '5+0', name: 'Blitz', description: '5 minutes', icon: Clock },
    { value: '10+5', name: 'Rapid', description: '10 min + 5 sec', icon: Brain },
    { value: '15+10', name: 'Rapid', description: '15 min + 10 sec', icon: Brain },
    { value: '30+30', name: 'Classical', description: '30 min + 30 sec', icon: Trophy }
  ]

  const startGame = async () => {
    setIsSearching(true)
    
    try {
      if (config.mode === 'human-vs-ai') {
        // Start AI game immediately
        const params = new URLSearchParams({
          mode: config.mode,
          time: config.timeControl,
          color: config.color === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : config.color,
          difficulty: config.aiDifficulty?.toString() || '5'
        })
        
        router.push(`/play?${params.toString()}`)
      } else if (config.mode === 'human-vs-human') {
        // Create or join a game room
        const response = await fetch('http://localhost:3001/api/games/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeControl: config.timeControl,
            playerColor: config.color
          })
        })
        
        if (response.ok) {
          const { gameId } = await response.json()
          const params = new URLSearchParams({
            mode: config.mode,
            time: config.timeControl,
            color: config.color === 'random' ? (Math.random() > 0.5 ? 'white' : 'black') : config.color,
            gameId
          })
          
          router.push(`/play?${params.toString()}`)
        }
      } else if (config.mode === 'quick-match') {
        // Find a quick match
        const response = await fetch('http://localhost:3001/api/games/quick-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeControl: config.timeControl,
            rating: 1200 // TODO: Get from user profile
          })
        })
        
        if (response.ok) {
          const { gameId, color } = await response.json()
          const params = new URLSearchParams({
            mode: 'human-vs-human',
            time: config.timeControl,
            color,
            gameId
          })
          
          router.push(`/play?${params.toString()}`)
        }
      }
    } catch (error) {
      console.error('Failed to start game:', error)
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Game</h1>
          <p className="text-xl text-gray-600">
            Select your preferred game mode and settings to start playing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Game Mode Selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Game Modes */}
            <div className="game-card">
              <h2 className="text-xl font-semibold mb-4">Game Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* AI Game */}
                <button
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'human-vs-ai' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.mode === 'human-vs-ai'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Bot className={`w-8 h-8 mx-auto mb-2 ${
                    config.mode === 'human-vs-ai' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="font-semibold">Play AI</div>
                  <div className="text-sm text-gray-600">Challenge our AI</div>
                </button>
                
                {/* Human vs Human */}
                <button
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'human-vs-human' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.mode === 'human-vs-human'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${
                    config.mode === 'human-vs-human' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <div className="font-semibold">Create Game</div>
                  <div className="text-sm text-gray-600">Play with a friend</div>
                </button>
                
                {/* Quick Match */}
                <button
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'quick-match' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.mode === 'quick-match'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Zap className={`w-8 h-8 mx-auto mb-2 ${
                    config.mode === 'quick-match' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                  <div className="font-semibold">Quick Match</div>
                  <div className="text-sm text-gray-600">Find opponent</div>
                </button>
              </div>
            </div>

            {/* Time Control */}
            <div className="game-card">
              <h2 className="text-xl font-semibold mb-4">Time Control</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeControls.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => setConfig(prev => ({ ...prev, timeControl: tc.value as TimeControl }))}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      config.timeControl === tc.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <tc.icon className={`w-4 h-4 ${
                        config.timeControl === tc.value ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <span className="font-semibold">{tc.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{tc.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="game-card">
              <h2 className="text-xl font-semibold mb-4">Play As</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setConfig(prev => ({ ...prev, color: 'white' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.color === 'white'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold">White</div>
                </button>
                
                <button
                  onClick={() => setConfig(prev => ({ ...prev, color: 'black' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.color === 'black'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold">Black</div>
                </button>
                
                <button
                  onClick={() => setConfig(prev => ({ ...prev, color: 'random' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.color === 'random'
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold">Random</div>
                </button>
              </div>
            </div>

            {/* AI Difficulty (only for AI games) */}
            {config.mode === 'human-vs-ai' && (
              <div className="game-card">
                <h2 className="text-xl font-semibold mb-4">AI Difficulty</h2>
                <div className="space-y-4">
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
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Beginner</span>
                    <span className="font-semibold">Level {config.aiDifficulty}</span>
                    <span>Master</span>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {config.aiDifficulty <= 3 && "Perfect for learning the basics"}
                    {config.aiDifficulty > 3 && config.aiDifficulty <= 6 && "Good challenge for intermediate players"}
                    {config.aiDifficulty > 6 && config.aiDifficulty <= 8 && "Advanced level for experienced players"}
                    {config.aiDifficulty > 8 && "Master level - extremely challenging"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Summary & Start */}
          <div className="lg:col-span-1">
            <div className="game-card sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Game Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-semibold capitalize">
                    {config.mode === 'human-vs-ai' ? 'vs AI' : 
                     config.mode === 'human-vs-human' ? 'vs Human' : 'Quick Match'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{config.timeControl}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-semibold capitalize">{config.color}</span>
                </div>
                
                {config.mode === 'human-vs-ai' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Level:</span>
                    <span className="font-semibold">{config.aiDifficulty}</span>
                  </div>
                )}
              </div>

              <button
                onClick={startGame}
                disabled={isSearching}
                className="btn btn-primary w-full btn-lg group"
              >
                {isSearching ? (
                  <>
                    <div className="loading-spinner w-5 h-5 mr-2" />
                    {config.mode === 'quick-match' ? 'Finding opponent...' : 'Starting game...'}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    {config.mode === 'human-vs-ai' ? 'Play AI' :
                     config.mode === 'human-vs-human' ? 'Create Game' : 'Find Match'}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {config.mode === 'human-vs-human' && !isSearching && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Share the game link with your friend to play together!
                  </div>
                </div>
              )}

              {config.mode === 'quick-match' && !isSearching && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-800">
                    <strong>Quick Match:</strong> We'll find an opponent with similar rating and time preference.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <Link href="/puzzles" className="btn btn-outline">
              <Brain className="w-4 h-4 mr-2" />
              Solve Puzzles
            </Link>
            <Link href="/tournaments" className="btn btn-outline">
              <Trophy className="w-4 h-4 mr-2" />
              Join Tournament
            </Link>
            <Link href="/analysis" className="btn btn-outline">
              <Settings className="w-4 h-4 mr-2" />
              Analysis Board
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 