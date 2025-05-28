#!/usr/bin/env python3
"""
Test script to verify AI service dependencies and setup
"""

def test_imports():
    """Test that all required packages can be imported"""
    try:
        import fastapi
        print("✓ FastAPI imported successfully")
    except ImportError as e:
        print(f"✗ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn imported successfully")
    except ImportError as e:
        print(f"✗ Uvicorn import failed: {e}")
        return False
    
    try:
        import chess
        print("✓ Python-chess imported successfully")
    except ImportError as e:
        print(f"✗ Python-chess import failed: {e}")
        return False
    
    try:
        from stockfish import Stockfish
        print("✓ Stockfish package imported successfully")
    except ImportError as e:
        print(f"✗ Stockfish package import failed: {e}")
        return False
    
    return True

def test_stockfish_engine():
    """Test that Stockfish engine can be initialized"""
    try:
        from stockfish import Stockfish
        
        # Try with system stockfish
        try:
            stockfish = Stockfish()
            print("✓ Stockfish engine initialized with default path")
            return True
        except Exception as e:
            print(f"✗ Stockfish default path failed: {e}")
        
        # Try with homebrew path
        try:
            stockfish = Stockfish(path="/opt/homebrew/bin/stockfish")
            print("✓ Stockfish engine initialized with homebrew path")
            return True
        except Exception as e:
            print(f"✗ Stockfish homebrew path failed: {e}")
        
        return False
        
    except Exception as e:
        print(f"✗ Stockfish engine test failed: {e}")
        return False

def test_chess_functionality():
    """Test basic chess functionality"""
    try:
        import chess
        
        # Create a board
        board = chess.Board()
        print(f"✓ Chess board created: {board.fen()}")
        
        # Test a move
        move = chess.Move.from_uci("e2e4")
        board.push(move)
        print(f"✓ Move executed: {board.fen()}")
        
        return True
        
    except Exception as e:
        print(f"✗ Chess functionality test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing AI Service Setup...")
    print("=" * 40)
    
    success = True
    
    print("\n1. Testing imports...")
    success &= test_imports()
    
    print("\n2. Testing Stockfish engine...")
    success &= test_stockfish_engine()
    
    print("\n3. Testing chess functionality...")
    success &= test_chess_functionality()
    
    print("\n" + "=" * 40)
    if success:
        print("✓ All tests passed! AI service should work correctly.")
    else:
        print("✗ Some tests failed. Please check the errors above.")
    
    print("=" * 40) 