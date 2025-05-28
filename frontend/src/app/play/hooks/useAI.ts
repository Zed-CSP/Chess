import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { GameConfig } from '../types'

export const useAI = (config: GameConfig, updateGameState: (game: Chess) => void, setGame: (game: Chess) => void) => {
  const [isThinking, setIsThinking] = useState(false)

  // Handle AI move
  const handleAIMove = useCallback(async (currentGame: Chess) => {
    if (currentGame.isGameOver()) return
    
    console.log('🤖 AI move requested for position:', currentGame.fen())
    setIsThinking(true)
    
    try {
      // Call AI service through backend proxy
      const response = await fetch('http://localhost:3001/api/ai/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen: currentGame.fen(),
          difficulty: (config.aiDifficulty || 5) * 200 + 800 // Convert 1-10 scale to ELO rating
        })
      })
      
      console.log('🌐 AI service response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 AI service response data:', data)
        const { move } = data
        
        if (!move) {
          console.error('❌ No move returned from AI service')
          setIsThinking(false)
          return
        }
        
        console.log('🎯 AI suggested move:', move)
        
        // Apply move immediately for testing (remove delay)
        const gameCopy = new Chess(currentGame.fen())
        console.log('🔄 Attempting to apply AI move:', move, 'to position:', gameCopy.fen())
        
        const aiMove = gameCopy.move(move)
        
        if (aiMove) {
          console.log('✅ AI move applied successfully:', aiMove)
          console.log('🆕 New game state:', gameCopy.fen())
          setGame(gameCopy)
          updateGameState(gameCopy)
        } else {
          console.error('❌ Failed to apply AI move:', move)
        }
        
        setIsThinking(false)
      } else {
        console.error('❌ AI service returned error status:', response.status)
        setIsThinking(false)
      }
    } catch (error) {
      console.error('❌ AI move failed:', error)
      setIsThinking(false)
    }
  }, [config.aiDifficulty, updateGameState, setGame])

  return {
    isThinking,
    handleAIMove
  }
} 