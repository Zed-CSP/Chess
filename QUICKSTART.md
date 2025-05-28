# Chess Master - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Set Up Environment
Create a `.env` file in the root directory:
```bash
# Database Configuration
DATABASE_URL="postgresql://chess_user:chess_password@localhost:5432/chess_master"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"

# Socket.io Configuration
SOCKET_CORS_ORIGIN="http://localhost:3000"

# AI Service Configuration
AI_SERVICE_URL="http://localhost:8001"
STOCKFISH_PATH="/usr/local/bin/stockfish"

# Game Configuration
DEFAULT_TIME_CONTROL="600+5"
MAX_CONCURRENT_GAMES=5
RATING_K_FACTOR=32
```

### 3. Start Development (Choose One)

#### Option A: Docker (Recommended)
```bash
npm run docker:dev
```

#### Option B: Local Development
```bash
# Terminal 1: Start frontend
npm run dev:frontend

# Terminal 2: Start backend (after setting up database)
npm run dev:backend
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8001

## 🛠️ Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
```

### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run db:setup     # Set up database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🎯 Next Steps

1. **Create Your First Game**: Visit http://localhost:3000 and click "Start Playing"
2. **Test AI Integration**: Try playing against the computer
3. **Explore the API**: Check out http://localhost:3001/api/docs (when implemented)
4. **Customize**: Modify the chess board themes and piece sets

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Database Connection Issues**
```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql

# Start Redis (macOS with Homebrew)
brew services start redis
```

**Stockfish Not Found**
```bash
# Install Stockfish (macOS)
brew install stockfish

# Install Stockfish (Ubuntu)
sudo apt-get install stockfish
```

**Node.js Version Issues**
- Ensure you're using Node.js 18+ and npm 9+
- Use `nvm` to manage Node.js versions if needed

### Reset Everything
```bash
npm run clean
npm run setup
```

## 📚 Architecture Overview

```
chess-master/
├── frontend/          # Next.js React app (Port 3000)
├── backend/           # Node.js API server (Port 3001)
├── ai-service/        # Python AI service (Port 8000)
├── shared/            # Shared TypeScript types
└── docker/            # Docker configurations
```

## 🎮 Features Ready to Use

- ✅ Beautiful chess board UI
- ✅ Real-time game state management
- ✅ AI opponent integration
- ✅ Position analysis
- ✅ Modern responsive design
- ✅ TypeScript throughout

## 🔧 Development Tips

1. **Hot Reload**: All services support hot reloading during development
2. **Type Safety**: Shared types ensure consistency across frontend/backend
3. **Database**: Use Prisma Studio (`npm run db:studio`) to view/edit data
4. **Debugging**: Check browser console and terminal logs for issues
5. **API Testing**: Use tools like Postman or curl to test backend endpoints

## 🚀 Ready to Build?

Your chess platform is now ready for development! Start by:

1. Implementing user authentication
2. Adding real-time multiplayer functionality
3. Creating the chess game logic
4. Training your custom AI models

Happy coding! ♔ 