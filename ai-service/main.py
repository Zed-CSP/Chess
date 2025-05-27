from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import chess
import chess.engine
from stockfish import Stockfish
import asyncio
import os
from loguru import logger

app = FastAPI(
    title="Chess Master AI Service",
    description="AI service for chess analysis and computer opponents",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PositionAnalysis(BaseModel):
    fen: str
    depth: Optional[int] = 15

class AnalysisResponse(BaseModel):
    evaluation: Dict[str, Any]
    best_move: str
    principal_variation: List[str]
    depth: int

class AIMove(BaseModel):
    fen: str
    difficulty: Optional[int] = 1500  # ELO rating
    time_limit: Optional[float] = 1.0  # seconds

class MoveResponse(BaseModel):
    move: str
    evaluation: float
    thinking_time: float

# Global Stockfish instance
stockfish = None

@app.on_event("startup")
async def startup_event():
    global stockfish
    try:
        # Initialize Stockfish engine
        stockfish_path = os.getenv("STOCKFISH_PATH", "/usr/local/bin/stockfish")
        stockfish = Stockfish(path=stockfish_path)
        logger.info("Stockfish engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Stockfish: {e}")
        # Fallback to system stockfish
        try:
            stockfish = Stockfish()
            logger.info("Stockfish initialized with default path")
        except Exception as e2:
            logger.error(f"Failed to initialize Stockfish with default path: {e2}")

@app.get("/")
async def root():
    return {"message": "Chess Master AI Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "stockfish_available": stockfish is not None
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_position(analysis: PositionAnalysis):
    """Analyze a chess position and return the best move with evaluation."""
    if not stockfish:
        raise HTTPException(status_code=503, message="Stockfish engine not available")
    
    try:
        # Validate FEN
        board = chess.Board(analysis.fen)
        if not board.is_valid():
            raise HTTPException(status_code=400, detail="Invalid FEN position")
        
        # Set position in Stockfish
        stockfish.set_fen_position(analysis.fen)
        
        # Set analysis depth
        stockfish.set_depth(analysis.depth)
        
        # Get best move
        best_move = stockfish.get_best_move()
        if not best_move:
            raise HTTPException(status_code=400, detail="No legal moves available")
        
        # Get evaluation
        evaluation = stockfish.get_evaluation()
        
        # Get principal variation
        pv = stockfish.get_top_moves(1)
        principal_variation = []
        if pv:
            # Convert moves to SAN notation
            temp_board = chess.Board(analysis.fen)
            for move_uci in pv[0].get('pv', []):
                try:
                    move = chess.Move.from_uci(move_uci)
                    san_move = temp_board.san(move)
                    principal_variation.append(san_move)
                    temp_board.push(move)
                except:
                    break
        
        return AnalysisResponse(
            evaluation=evaluation,
            best_move=best_move,
            principal_variation=principal_variation,
            depth=analysis.depth
        )
        
    except chess.InvalidMoveError:
        raise HTTPException(status_code=400, detail="Invalid chess position")
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

@app.post("/ai-move", response_model=MoveResponse)
async def get_ai_move(ai_move: AIMove):
    """Get a move from the AI opponent."""
    if not stockfish:
        raise HTTPException(status_code=503, detail="Stockfish engine not available")
    
    try:
        import time
        start_time = time.time()
        
        # Validate FEN
        board = chess.Board(ai_move.fen)
        if not board.is_valid():
            raise HTTPException(status_code=400, detail="Invalid FEN position")
        
        # Set position
        stockfish.set_fen_position(ai_move.fen)
        
        # Adjust engine strength based on difficulty
        # Map ELO rating to Stockfish skill level (0-20)
        skill_level = max(0, min(20, (ai_move.difficulty - 800) // 100))
        stockfish.set_skill_level(skill_level)
        
        # Set time limit
        stockfish.set_time_limit(ai_move.time_limit)
        
        # Get best move
        best_move = stockfish.get_best_move()
        if not best_move:
            raise HTTPException(status_code=400, detail="No legal moves available")
        
        # Get evaluation
        evaluation = stockfish.get_evaluation()
        eval_score = 0
        if evaluation['type'] == 'cp':
            eval_score = evaluation['value'] / 100.0  # Convert centipawns to pawns
        elif evaluation['type'] == 'mate':
            eval_score = 999 if evaluation['value'] > 0 else -999
        
        thinking_time = time.time() - start_time
        
        return MoveResponse(
            move=best_move,
            evaluation=eval_score,
            thinking_time=thinking_time
        )
        
    except chess.InvalidMoveError:
        raise HTTPException(status_code=400, detail="Invalid chess position")
    except Exception as e:
        logger.error(f"AI move error: {e}")
        raise HTTPException(status_code=500, detail="AI move generation failed")

@app.post("/validate-move")
async def validate_move(fen: str, move: str):
    """Validate if a move is legal in the given position."""
    try:
        board = chess.Board(fen)
        move_obj = chess.Move.from_uci(move)
        
        if move_obj in board.legal_moves:
            # Apply the move and return the new position
            board.push(move_obj)
            return {
                "valid": True,
                "new_fen": board.fen(),
                "san": board.san(move_obj),
                "is_check": board.is_check(),
                "is_checkmate": board.is_checkmate(),
                "is_stalemate": board.is_stalemate()
            }
        else:
            return {"valid": False, "error": "Illegal move"}
            
    except Exception as e:
        return {"valid": False, "error": str(e)}

@app.get("/opening-book/{fen}")
async def get_opening_moves(fen: str):
    """Get opening book moves for a position."""
    # This would integrate with an opening book database
    # For now, return a placeholder
    return {
        "moves": [],
        "opening_name": "Unknown",
        "eco_code": ""
    }

@app.post("/game-analysis")
async def analyze_game(pgn: str):
    """Analyze a complete game and provide move-by-move analysis."""
    # This would analyze each move in the game
    # For now, return a placeholder
    return {
        "accuracy": {"white": 85.5, "black": 82.3},
        "moves": [],
        "opening": "Sicilian Defense",
        "result": "1-0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 