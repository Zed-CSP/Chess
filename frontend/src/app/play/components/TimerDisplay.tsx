import { Clock } from 'lucide-react'
import { PlayerColor } from '../types'

interface TimerDisplayProps {
  time: number
  isActive: boolean
  player: PlayerColor
  formatTime: (seconds: number) => string
  className?: string
}

export const TimerDisplay = ({ 
  time, 
  isActive, 
  player, 
  formatTime, 
  className = '' 
}: TimerDisplayProps) => {
  const isLowTime = time <= 30
  const isCriticalTime = time <= 10
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Clock className={`w-4 h-4 ${
        isActive ? 'text-green-600' : 'text-gray-400'
      } ${isCriticalTime ? 'animate-pulse' : ''}`} />
      <span className={`font-mono text-lg transition-colors ${
        isActive ? 'text-green-600 font-bold' : 'text-gray-600'
      } ${isLowTime ? 'text-red-600' : ''} ${
        isCriticalTime ? 'animate-pulse text-red-700 font-extrabold' : ''
      }`}>
        {formatTime(time)}
      </span>
      {isActive && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  )
} 