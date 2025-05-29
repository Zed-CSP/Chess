import { useState, useEffect, useCallback, useRef } from 'react'
import { GameConfig, GameState, PlayerColor } from '../types'

interface TimerState {
  whiteTime: number
  blackTime: number
  isRunning: boolean
  activePlayer: PlayerColor | null
  lastServerUpdate: number | null
}

interface UseGameTimerReturn {
  whiteTime: number
  blackTime: number
  isRunning: boolean
  activePlayer: PlayerColor | null
  startTimer: (player: PlayerColor) => void
  stopTimer: () => void
  switchTimer: (player: PlayerColor) => void
  resetTimer: () => void
  addIncrement: (player: PlayerColor) => void
  formatTime: (seconds: number) => string
  isTimeUp: (player: PlayerColor) => boolean
  updateFromServer: (serverTimer: any) => void
}

export const useGameTimer = (
  config: GameConfig,
  gameState: GameState,
  onTimeUp: (player: PlayerColor) => void,
  socketRef?: React.MutableRefObject<any>
): UseGameTimerReturn => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Determine if this should be server-authoritative
  const isServerAuthoritative = config.mode === 'human-vs-human'
  
  // Parse time control (e.g., "10+5" -> 600 seconds + 5 increment)
  const parseTimeControl = useCallback((timeControl: string) => {
    const [minutes, increment] = timeControl.split('+').map(Number)
    return {
      initialTime: minutes * 60,
      increment: increment || 0
    }
  }, [])

  const { initialTime, increment } = parseTimeControl(config.timeControl)

  const [timerState, setTimerState] = useState<TimerState>({
    whiteTime: initialTime,
    blackTime: initialTime,
    isRunning: false,
    activePlayer: null,
    lastServerUpdate: null
  })

  // Update timer from server (authoritative for multiplayer games)
  const updateFromServer = useCallback((serverTimer: any) => {
    if (!isServerAuthoritative) return
    
    setTimerState(prev => ({
      ...prev,
      whiteTime: serverTimer.whiteTime,
      blackTime: serverTimer.blackTime,
      isRunning: serverTimer.isRunning,
      activePlayer: serverTimer.activePlayer,
      lastServerUpdate: Date.now()
    }))
  }, [isServerAuthoritative])

  // Local timer functions for AI games
  const startTimer = useCallback((player: PlayerColor) => {
    if (isServerAuthoritative) return
    
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      activePlayer: player,
      lastServerUpdate: Date.now()
    }))
  }, [isServerAuthoritative])

  const stopTimer = useCallback(() => {
    if (isServerAuthoritative) return
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      activePlayer: null
    }))
  }, [isServerAuthoritative])

  const switchTimer = useCallback((newActivePlayer: PlayerColor) => {
    if (isServerAuthoritative) return

    setTimerState(prev => {
      const currentPlayer = prev.activePlayer
      let newState = { ...prev }

      // Add increment to the player who just moved
      if (currentPlayer && increment > 0) {
        const timeKey = `${currentPlayer}Time` as keyof Pick<TimerState, 'whiteTime' | 'blackTime'>
        newState[timeKey] = prev[timeKey] + increment
      }

      return {
        ...newState,
        activePlayer: newActivePlayer,
        lastServerUpdate: Date.now()
      }
    })
  }, [isServerAuthoritative, increment])

  const addIncrement = useCallback((player: PlayerColor) => {
    if (isServerAuthoritative) return
    
    setTimerState(prev => ({
      ...prev,
      [`${player}Time`]: prev[`${player}Time` as keyof Pick<TimerState, 'whiteTime' | 'blackTime'>] + increment
    }))
  }, [increment, isServerAuthoritative])

  // Reset timer to initial state
  const resetTimer = useCallback(() => {
    const { initialTime: currentInitialTime } = parseTimeControl(config.timeControl)
    
    setTimerState({
      whiteTime: currentInitialTime,
      blackTime: currentInitialTime,
      isRunning: false,
      activePlayer: null,
      lastServerUpdate: null
    })
  }, [config.timeControl, parseTimeControl])

  // Format time for display (MM:SS)
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    const sign = seconds < 0 ? '-' : ''
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Check if time is up for a player
  const isTimeUp = useCallback((player: PlayerColor): boolean => {
    const timeKey = `${player}Time` as keyof Pick<TimerState, 'whiteTime' | 'blackTime'>
    return timerState[timeKey] <= 0
  }, [timerState])

  // Simple countdown display for multiplayer (no interpolation)
  useEffect(() => {
    if (isServerAuthoritative) return // Server handles all timing for multiplayer
    
    if (!timerState.isRunning || !timerState.activePlayer || gameState.gameOver) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Simple 1-second countdown for AI games only
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (!prev.activePlayer || !prev.isRunning) return prev

        const timeKey = `${prev.activePlayer}Time` as keyof Pick<TimerState, 'whiteTime' | 'blackTime'>
        const newTime = prev[timeKey] - 1

        // Check for time up
        if (newTime <= 0) {
          onTimeUp(prev.activePlayer!)
          return {
            ...prev,
            [timeKey]: 0,
            isRunning: false,
            activePlayer: null
          }
        }

        return {
          ...prev,
          [timeKey]: newTime
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isServerAuthoritative, timerState.isRunning, timerState.activePlayer, gameState.gameOver, onTimeUp])

  // Update timer when config changes (e.g., from URL params)
  useEffect(() => {
    const { initialTime: newInitialTime } = parseTimeControl(config.timeControl)
    
    setTimerState(prev => ({
      ...prev,
      whiteTime: newInitialTime,
      blackTime: newInitialTime
    }))
  }, [config.timeControl, parseTimeControl])

  // Auto-start timer when game begins (local AI games only)
  useEffect(() => {
    if (isServerAuthoritative) return // Server handles this for multiplayer
    
    if (gameState.moveHistory.length === 0 && !gameState.gameOver) {
      // Game hasn't started yet
      return
    }

    if (gameState.moveHistory.length === 1 && !timerState.isRunning) {
      // First move made, start timer for the next player
      startTimer(gameState.turn)
    }
  }, [gameState.moveHistory.length, gameState.turn, gameState.gameOver, timerState.isRunning, startTimer, isServerAuthoritative])

  // Switch timer when turn changes (local AI games only)
  useEffect(() => {
    if (isServerAuthoritative) return // Server handles this for multiplayer
    
    if (gameState.moveHistory.length > 0 && timerState.isRunning && timerState.activePlayer !== gameState.turn) {
      switchTimer(gameState.turn)
    }
  }, [gameState.turn, gameState.moveHistory.length, timerState.isRunning, timerState.activePlayer, switchTimer, isServerAuthoritative])

  // Stop timer when game ends (local AI games only)
  useEffect(() => {
    if (isServerAuthoritative) return // Server handles this for multiplayer
    
    if (gameState.gameOver) {
      stopTimer()
    }
  }, [gameState.gameOver, stopTimer, isServerAuthoritative])

  // Set up server timer event listeners for multiplayer games
  useEffect(() => {
    if (!isServerAuthoritative || !socketRef?.current) return

    const socket = socketRef.current

    const handleTimerUpdate = (data: { timer: any }) => {
      updateFromServer(data.timer)
    }

    const handleGameTimeout = (data: { timeoutPlayer: string }) => {
      onTimeUp(data.timeoutPlayer as PlayerColor)
    }

    socket.on('timer-update', handleTimerUpdate)
    socket.on('game-timeout', handleGameTimeout)

    return () => {
      socket.off('timer-update', handleTimerUpdate)
      socket.off('game-timeout', handleGameTimeout)
    }
  }, [isServerAuthoritative, socketRef, updateFromServer, onTimeUp])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    whiteTime: timerState.whiteTime,
    blackTime: timerState.blackTime,
    isRunning: timerState.isRunning,
    activePlayer: timerState.activePlayer,
    startTimer,
    stopTimer,
    switchTimer,
    resetTimer,
    addIncrement,
    formatTime,
    isTimeUp,
    updateFromServer
  }
} 