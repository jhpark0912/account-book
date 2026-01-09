# Suggested Commands for Account Book Project

## Backend Commands (FastAPI)

### Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Run Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Database
- Database file: `backend/data/account_book.db` (auto-created)
- Tables are auto-created on first run via SQLAlchemy

## Frontend Commands (React + Vite)

### Setup
```bash
cd frontend
npm install
```

### Development
```bash
cd frontend
npm run dev        # Start dev server on port 5173
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Testing & Debugging

### Check Server Status
```bash
# Backend health check
curl http://localhost:8000/health

# Check if ports are in use
netstat -ano | findstr :8000    # Backend
netstat -ano | findstr :5173    # Frontend

# Check processes
tasklist | findstr python       # Backend process
tasklist | findstr node         # Frontend process
```

### API Testing
```bash
# Test API endpoints
curl http://localhost:8000/api/categories/list
curl http://localhost:8000/api/statistics/months
curl "http://localhost:8000/api/transactions/?limit=10"
```

## Windows-specific Commands

### File Operations
- `dir` - List directory contents
- `type <file>` - Display file contents
- `copy`, `move`, `del` - File operations
- `mkdir`, `rmdir` - Directory operations

### Search
- `findstr <pattern> <file>` - Search in files (like grep)
- `where <file>` - Find file location (like which)

### Process Management
- `tasklist` - List running processes
- `taskkill /PID <pid>` - Kill process by PID

### Network
- `netstat -ano` - Show network connections
- `ipconfig` - Network configuration
