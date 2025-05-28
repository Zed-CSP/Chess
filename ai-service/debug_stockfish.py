#!/usr/bin/env python3
"""
Debug script to test Stockfish integration
"""

def test_stockfish():
    try:
        from stockfish import Stockfish
        
        # Initialize Stockfish
        stockfish = Stockfish(path="/opt/homebrew/bin/stockfish")
        print("✓ Stockfish initialized")
        
        # Set a position
        fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        stockfish.set_fen_position(fen)
        print(f"✓ Position set: {fen}")
        
        # Set skill level
        stockfish.set_skill_level(10)
        print("✓ Skill level set")
        
        # Set depth
        stockfish.set_depth(5)
        print("✓ Depth set")
        
        # Get best move
        best_move = stockfish.get_best_move()
        print(f"✓ Best move: {best_move}")
        
        # Get evaluation
        evaluation = stockfish.get_evaluation()
        print(f"✓ Evaluation: {evaluation}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing Stockfish integration...")
    print("=" * 40)
    success = test_stockfish()
    print("=" * 40)
    if success:
        print("✓ Stockfish integration working!")
    else:
        print("✗ Stockfish integration failed!") 