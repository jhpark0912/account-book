# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

### Backend
- **FastAPI** (Python 3.8+) - Web framework
- **SQLAlchemy** - ORM for SQLite database
- **pandas + openpyxl** - Excel file parsing
- **Pydantic** - Data validation and schemas

### Frontend
- **React 18** with **Vite 7** - UI framework and build tool
- **TailwindCSS 3.4** - Styling
- **Recharts 3.6** - Data visualization
- **Axios 1.13** - HTTP client

### Platform
- **Windows** - Development environment (use Windows-specific commands)

## Development Commands

### Backend Setup and Run
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Backend runs on http://localhost:8000
- API docs available at http://localhost:8000/docs
- Database auto-creates at `backend/data/account_book.db`

### Frontend Setup and Run
```bash
cd frontend
npm install
npm run dev        # Dev server on port 5173
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Testing/Debugging
```bash
# Health check
curl http://localhost:8000/health

# Check ports (Windows)
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Test API endpoints
curl http://localhost:8000/api/categories/list
curl "http://localhost:8000/api/transactions/?limit=10"
```

## Architecture

### Backend Architecture (FastAPI)

**Entry Point**: `backend/app/main.py`
- Auto-creates DB tables on startup (`Base.metadata.create_all`)
- Registers routers with `/api` prefix
- Includes request/response logging middleware
- CORS configured for ports 5173 and 3000

**Database Pattern**: SQLAlchemy with dependency injection
- Database session created via `get_db()` dependency
- All endpoints use `db: Session = Depends(get_db)`
- Auto-closes sessions after requests

**Router Structure**: Three main routers in `app/routers/`
1. `transactions.py` - Excel upload, CRUD operations, transaction management
2. `categories.py` - Category mappings (keyword-based auto-categorization)
3. `statistics.py` - Monthly and category-based analytics

**Excel Parsing Logic** (`transactions.py:parse_toss_excel`)
- Finds header row by searching for '거래 일시' column
- Re-parses Excel with correct skiprows
- Extracts: 거래 일시, 적요, 거래 유형, 거래 기관, 계좌번호, 거래 금액, 거래 후 잔액, 메모
- Auto-generates `year_month` field (YYYY-MM format) for filtering

**Auto-categorization Logic** (`transactions.py:auto_categorize`)
- Matches transaction description against `category_mappings` table keywords
- Falls back to memo-based hashtag detection (e.g., "#식비" in memo)
- Returns None if no match found

**Response Pattern**: All endpoints return Pydantic models
- Uses `response_model` parameter in route decorators
- Standard HTTPException for errors

### Frontend Architecture (React)

**Entry Point**: `frontend/src/main.jsx` → `App.jsx`

**Component Structure**:
- `App.jsx` - Tab-based navigation (파일 업로드, 거래내역, 통계)
- `ExcelUpload.jsx` - File upload with FormData
- `TransactionTable.jsx` - Editable table with inline category updates
- `Statistics.jsx` - Monthly stats + category pie chart

**API Client**: `src/api/accountService.js`
- Centralized axios instance with base URL
- Exports separate API objects: `transactionAPI`, `categoryAPI`, `statisticsAPI`
- Request/response interceptors for logging
- Error handling with console logging

**State Management Pattern**:
- Props for parent-child data flow
- `refreshTrigger` pattern for data refreshing after mutations
- Local state (`useState`) for UI interactions
- `useEffect` for data fetching on mount/dependency changes

**Styling Pattern**:
- TailwindCSS utility classes throughout
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Color scheme: blue (primary), red (errors), green (success)

### Database Schema

**transactions** table:
- `id` (PK), `transaction_date`, `description`, `transaction_type`
- `institution`, `account_number`, `amount`, `balance`, `memo`
- `category` (nullable), `year_month` (indexed for filtering)
- Amount convention: positive = income, negative = expense

**category_mappings** table:
- `id` (PK), `keyword` (unique), `category`
- Used for auto-categorization based on merchant name

**Available Categories**: 식비, 교통비, 주거생활비, 미용비, 건강관리비, 사회생활비, 문화생활비, 뚜이

## Key Implementation Patterns

### Backend Patterns

**Duplicate Prevention** (transactions.py:upload_excel):
```python
# Check for duplicates before inserting
existing = db.query(Transaction).filter(
    Transaction.transaction_date == t["transaction_date"],
    Transaction.description == t["description"],
    Transaction.amount == t["amount"]
).first()
```

**Logging Pattern**:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("Info message")
logger.error("Error message", exc_info=True)
```

**Schema Pattern**:
- `ModelBase` - Base fields for creation
- `ModelCreate` - Inherits from Base
- `Model` - Full model with ORM fields, includes `Config` class with `from_attributes = True`

### Frontend Patterns

**Data Fetching Pattern**:
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await api.getData();
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error message');
    }
  };
  fetchData();
}, [dependencies]);
```

**File Upload Pattern** (ExcelUpload.jsx):
```javascript
const formData = new FormData();
formData.append('file', selectedFile);
await transactionAPI.uploadExcel(formData);
```

**Inline Editing Pattern** (TransactionTable.jsx):
```javascript
// Click to edit, select dropdown, auto-save on change
<select onChange={(e) => handleCategoryChange(id, e.target.value)}>
```

## Windows-Specific Commands

Use Windows commands instead of Unix equivalents:
- `dir` instead of `ls`
- `type` instead of `cat`
- `findstr` instead of `grep`
- `venv\Scripts\activate` instead of `source venv/bin/activate`
- `netstat -ano` for port checking
- `tasklist` / `taskkill` for process management

## Important Notes

- **No test suite**: Project currently has no unit tests
- **Single database**: SQLite file at `backend/data/account_book.db`
- **Upload directory**: `backend/uploads/` stores Excel files
- **Date format**: Transactions use string dates (YYYY.MM.DD HH:MM:SS format from Excel)
- **Year-month filtering**: Uses YYYY-MM format string matching
- **Korean UI**: All user-facing text is in Korean


## ./claude/gemini folder

- 해당 폴더를 참조하여 작업한 이후에는 삭제 처리
