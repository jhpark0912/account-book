# Project Structure

```
account-book/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── routers/           # API Route Handlers
│   │   │   ├── transactions.py    # 거래내역 API
│   │   │   ├── categories.py      # 카테고리 API
│   │   │   └── statistics.py      # 통계 API
│   │   ├── main.py            # FastAPI app & CORS
│   │   ├── database.py        # SQLAlchemy setup
│   │   ├── models.py          # DB models
│   │   └── schemas.py         # Pydantic schemas
│   ├── data/                  # SQLite database
│   │   └── account_book.db
│   ├── uploads/               # Uploaded Excel files
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── accountService.js  # Axios API client
│   │   ├── components/
│   │   │   ├── ExcelUpload.jsx    # 파일 업로드
│   │   │   ├── TransactionTable.jsx  # 거래내역 테이블
│   │   │   └── Statistics.jsx     # 통계 차트
│   │   ├── App.jsx            # Main app with tabs
│   │   └── main.jsx           # React entry point
│   ├── public/                # Static assets
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   └── eslint.config.js       # ESLint configuration
│
├── uploads/                   # Shared upload directory
└── README.md                  # Project documentation
```

## API Endpoints

### Transactions
- `POST /api/transactions/upload` - Excel 파일 업로드
- `GET /api/transactions/` - 거래내역 조회 (쿼리: year_month, category, skip, limit)
- `GET /api/transactions/{id}` - 특정 거래내역 조회
- `PUT /api/transactions/{id}` - 카테고리 수정
- `DELETE /api/transactions/{id}` - 거래내역 삭제

### Categories
- `GET /api/categories/` - 카테고리 매핑 조회
- `GET /api/categories/list` - 사용 가능한 카테고리 목록
- `POST /api/categories/` - 카테고리 매핑 생성
- `PUT /api/categories/{id}` - 카테고리 매핑 수정
- `DELETE /api/categories/{id}` - 카테고리 매핑 삭제

### Statistics
- `GET /api/statistics/monthly/{year_month}` - 월별 통계
- `GET /api/statistics/category/{year_month}` - 카테고리별 통계
- `GET /api/statistics/months` - 조회 가능한 월 목록

## Database Schema

### transactions
- id (PK)
- transaction_date (String)
- description (String) - 거래처명
- transaction_type (String)
- institution (String, nullable)
- account_number (String, nullable)
- amount (Float) - 양수: 수입, 음수: 지출
- balance (Float)
- memo (String, nullable)
- category (String, nullable)
- year_month (String) - YYYY-MM format

### category_mappings
- id (PK)
- keyword (String, unique) - 거래처명 키워드
- category (String) - 매핑할 카테고리
