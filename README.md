# 가계부 (Account Book)

토스뱅크 Excel 거래내역을 기반으로 한 가계부 웹 애플리케이션

## 기술 스택

### Backend
- Python 3.8+
- FastAPI
- SQLite
- pandas + openpyxl

### Frontend
- React 18
- Vite
- TailwindCSS
- Recharts
- Axios

## 주요 기능

1. **Excel 파일 업로드**
   - 토스뱅크 거래내역 Excel 파일 업로드
   - 자동 파싱 및 데이터베이스 저장
   - 중복 거래 자동 필터링

2. **카테고리 자동 분류**
   - 거래처명 기반 자동 카테고리 분류
   - 메모 기반 카테고리 태깅
   - 수동 카테고리 수정 가능
   - 카테고리: 식비, 교통비, 주거생활비, 미용비, 건강관리비, 사회생활비, 문화생활비, 뚜이

3. **거래내역 조회**
   - 전체 거래내역 테이블 뷰
   - 카테고리 인라인 수정

4. **월별 통계**
   - 시작/종료 잔액
   - 총 수입/지출
   - 순 증감액

5. **카테고리별 통계**
   - 카테고리별 지출 금액 및 비율
   - 파이 차트 시각화

## 설치 및 실행

### 1. Backend 실행

```bash
# backend 디렉토리로 이동
cd account-book/backend

# 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

Backend API: http://localhost:8000
API 문서: http://localhost:8000/docs

### 2. Frontend 실행

```bash
# frontend 디렉토리로 이동
cd account-book/frontend

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend: http://localhost:5173

## 사용 방법

1. **Excel 파일 업로드**
   - "파일 업로드" 탭에서 토스뱅크 Excel 파일 업로드
   - 자동으로 거래내역이 파싱되고 저장됩니다

2. **거래내역 확인**
   - "거래내역" 탭에서 모든 거래 확인
   - 카테고리 클릭하여 수정 가능

3. **통계 확인**
   - "통계" 탭에서 월별 통계 및 카테고리별 지출 현황 확인
   - 월 선택하여 다른 기간 조회 가능

## 프로젝트 구조

```
account-book/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── transactions.py  # 거래내역 API
│   │   │   ├── categories.py    # 카테고리 API
│   │   │   └── statistics.py    # 통계 API
│   │   ├── main.py              # FastAPI 앱
│   │   ├── database.py          # DB 설정
│   │   ├── models.py            # DB 모델
│   │   └── schemas.py           # Pydantic 스키마
│   ├── data/                    # SQLite DB
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── accountService.js  # API 호출
│   │   ├── components/
│   │   │   ├── ExcelUpload.jsx    # 업로드 컴포넌트
│   │   │   ├── TransactionTable.jsx  # 거래내역 테이블
│   │   │   └── Statistics.jsx     # 통계 컴포넌트
│   │   └── App.jsx
│   └── package.json
└── uploads/                     # 업로드된 Excel 파일
```

## API 엔드포인트

### 거래내역
- `POST /api/transactions/upload` - Excel 파일 업로드
- `GET /api/transactions/` - 거래내역 조회
- `PUT /api/transactions/{id}` - 카테고리 수정
- `DELETE /api/transactions/{id}` - 거래내역 삭제

### 카테고리
- `GET /api/categories/` - 카테고리 매핑 조회
- `GET /api/categories/list` - 사용 가능한 카테고리 목록
- `POST /api/categories/` - 카테고리 매핑 생성
- `DELETE /api/categories/{id}` - 카테고리 매핑 삭제

### 통계
- `GET /api/statistics/monthly/{year_month}` - 월별 통계
- `GET /api/statistics/category/{year_month}` - 카테고리별 통계
- `GET /api/statistics/months` - 조회 가능한 월 목록

## 개발자

개발 기간: 2026-01-07
