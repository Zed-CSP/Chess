import { BoardTheme } from '../types'

export interface BoardThemeConfig {
  lightSquareStyle: { backgroundColor: string }
  darkSquareStyle: { backgroundColor: string }
}

export const boardThemes: Record<BoardTheme, BoardThemeConfig> = {
  classic: {
    lightSquareStyle: { backgroundColor: '#F0D9B5' },
    darkSquareStyle: { backgroundColor: '#B58863' }
  },
  wood: {
    lightSquareStyle: { backgroundColor: '#F7E6C7' },
    darkSquareStyle: { backgroundColor: '#8B4513' }
  },
  blue: {
    lightSquareStyle: { backgroundColor: '#E6F3FF' },
    darkSquareStyle: { backgroundColor: '#4A90E2' }
  },
  green: {
    lightSquareStyle: { backgroundColor: '#F0F8E8' },
    darkSquareStyle: { backgroundColor: '#769656' }
  }
}

export const getBoardThemeStyles = (theme: BoardTheme = 'classic'): BoardThemeConfig => {
  return boardThemes[theme]
} 