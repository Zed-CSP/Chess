# Chess Game Page - Refactored Structure

## Overview
The chess game page has been refactored from a single large file into a modular, maintainable structure with clear separation of concerns.

## File Structure

```
frontend/src/app/play/
├── page.tsx                 # Main page component (orchestrates everything)
├── types.ts                 # Shared TypeScript types
├── README.md               # This documentation
├── hooks/
│   ├── index.ts            # Hook exports
│   ├── useGameState.ts     # Core chess game state management
│   ├── useAI.ts            # AI move handling and communication
│   └── useChessMove.ts     # Move validation and piece interaction
└── components/
    ├── index.ts            # Component exports
    ├── GameInfo.tsx        # Left sidebar - game mode, players, captured pieces
    ├── ChessBoard.tsx      # Center - chess board and game controls
    └── GameSidebar.tsx     # Right sidebar - move history and settings
```

## Architecture

### 🎯 Separation of Concerns

1. **Types** (`types.ts`)
   - All TypeScript interfaces and types
   - Shared across components and hooks
   - Single source of truth for data structures

2. **Hooks** (`hooks/`)
   - **`useGameState`**: Core chess game logic, FEN management, move history
   - **`useAI`**: AI communication, move processing, thinking state
   - **`useChessMove`**: Move validation, piece selection, drag & drop

3. **Components** (`components/`)
   - **`GameInfo`**: Player information, game mode display, captured pieces
   - **`ChessBoard`**: Chess board rendering, game status, controls
   - **`GameSidebar`**: Move history, settings, analysis tools

4. **Main Page** (`page.tsx`)
   - Orchestrates all hooks and components
   - Handles URL parameters and routing
   - Manages socket connections
   - Coordinates between different concerns

### 🔄 Data Flow

```
URL Params → Main Page → Hooks → Components
     ↓           ↓         ↓         ↓
  Config    Socket IO   Game State  UI Updates
```

### 🎮 Key Features

- **Modular Design**: Each file has a single responsibility
- **Reusable Hooks**: Game logic can be reused in other components
- **Type Safety**: Full TypeScript coverage with shared types
- **Clean Imports**: Index files for organized imports
- **Debugging**: Comprehensive console logging for AI moves
- **Performance**: Optimized with useCallback and proper dependencies

### 🚀 Benefits

1. **Maintainability**: Easy to find and modify specific functionality
2. **Testability**: Each hook and component can be tested independently
3. **Reusability**: Hooks can be used in other chess-related components
4. **Readability**: Clear structure makes code easier to understand
5. **Scalability**: Easy to add new features without bloating existing files

### 🔧 Development

- **Adding Features**: Create new hooks or components as needed
- **Debugging**: Check browser console for detailed AI move logs
- **Testing**: Each module can be unit tested independently
- **Styling**: Components use Tailwind CSS classes

### 📝 Notes

- All debugging logs are prefixed with emojis for easy identification
- AI moves are logged with detailed step-by-step information
- Socket connections are managed in the main page component
- Game state is centralized and flows down to components 