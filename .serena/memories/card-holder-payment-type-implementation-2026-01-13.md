# Samsung Card: 카드 소유자 선택 + 일시불/할부 구분 구현

## 날짜: 2026-01-13

## ✅ 구현 완료!

Samsung 카드 업로드 시 카드 소유자를 수동으로 선택하고, 일시불/할부 정보를 자동으로 구분하는 기능을 완성했습니다.

---

## 🎯 요구사항

1. **Excel 파일에는 사용자 정보가 없음** - 시트명만 "일시불", "할부"로 구분됨
2. **업로드 시 카드 소유자 선택** - 사용자가 직접 이름을 입력
3. **일시불/할부 정보 저장** - 시트명을 payment_type으로 저장
4. **명확한 UI 표시** - 카드 거래 테이블에 결제 유형 컬럼 추가

---

## 📦 Backend 구현

### 1. Database Model 수정

**파일**: `backend/app/models.py`

```python
class CardTransaction(Base):
    """카드 거래내역 테이블 (Samsung Card 등)"""
    __tablename__ = "card_transactions"

    id = Column(Integer, primary_key=True, index=True)
    card_holder = Column(String, nullable=False, index=True)  # 카드 사용자 (업로드 시 지정)
    payment_type = Column(String, nullable=False, index=True)  # 결제 유형 (일시불, 할부)
    transaction_date = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    memo = Column(String, nullable=True)
    year_month = Column(String, nullable=False, index=True)
    raw_date = Column(String, nullable=False)
```

**변경사항**:
- ✅ `payment_type` 필드 추가 (일시불/할부)
- ✅ `card_holder` 주석 변경 (업로드 시 사용자 지정)

### 2. Schema 수정

**파일**: `backend/app/schemas.py`

```python
class CardTransactionBase(BaseModel):
    """카드 거래내역 기본 스키마"""
    card_holder: str
    payment_type: str  # 결제 유형 (일시불, 할부)
    transaction_date: str
    description: str
    amount: float
    category: Optional[str] = None
    memo: Optional[str] = None
    year_month: str
    raw_date: str
```

### 3. Parser 함수 수정

**파일**: `backend/app/routers/card_transactions.py`

**함수 시그니처 변경**:
```python
def parse_samsung_card_excel(file_path: str, card_holder: str) -> List[dict]:
    """Samsung Card Excel 파일 파싱 (일시불/할부 시트별 처리)

    Args:
        file_path: Excel 파일 경로
        card_holder: 카드 소유자 이름 (업로드 시 사용자가 입력)
    """
```

**Transaction 딕셔너리 변경**:
```python
transaction = {
    "card_holder": card_holder,  # 업로드 시 입력한 사용자
    "payment_type": sheet_name,  # 시트명 (일시불, 할부)
    "transaction_date": trans_date,
    "description": str(row.iloc[2]),
    "amount": -amount,
    "year_month": year_month,
    "raw_date": raw_date
}
```

**Excel 구조**:
- Sheet 0: "일시불" → `payment_type = "일시불"`
- Sheet 1: "할부" → `payment_type = "할부"`
- 컬럼 9: 금액 (숫자)

### 4. Upload API 수정

**파일**: `backend/app/routers/card_transactions.py`

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    card_holder: str = Form(...),  # 필수 Form 파라미터
    db: Session = Depends(get_db)
):
    """Samsung Card Excel 파일 업로드 및 파싱

    Args:
        file: Samsung Card Excel 파일
        card_holder: 카드 소유자 이름 (필수)
    """
    if not card_holder or not card_holder.strip():
        raise HTTPException(status_code=400, detail="카드 소유자 이름을 입력해주세요.")

    # Excel 파싱 (카드 소유자 정보 전달)
    transactions_data = parse_samsung_card_excel(file_path, card_holder.strip())
```

**중복 체크 로직**:
```python
# 중복 체크 (같은 카드소유자, 결제유형, 날짜, 금액, 가맹점)
existing = db.query(models.CardTransaction).filter(
    models.CardTransaction.card_holder == trans_data["card_holder"],
    models.CardTransaction.payment_type == trans_data["payment_type"],
    models.CardTransaction.transaction_date == trans_data["transaction_date"],
    models.CardTransaction.amount == trans_data["amount"],
    models.CardTransaction.description == trans_data["description"]
).first()
```

---

## 🎨 Frontend 구현

### 1. ExcelUpload 컴포넌트

**파일**: `frontend/src/components/ExcelUpload.jsx`

**State 추가**:
```javascript
const [cardHolder, setCardHolder] = useState(''); // Samsung 카드 소유자
```

**카드 소유자 입력 필드**:
```jsx
{fileType === 'samsung' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      💳 카드 소유자 이름 <span className="text-red-500">*</span>
    </label>
    <input
      type="text"
      value={cardHolder}
      onChange={(e) => setCardHolder(e.target.value)}
      placeholder="예: 박지훈"
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
    />
    <p className="mt-1 text-sm text-gray-500">
      이 카드 명세서의 소유자 이름을 입력하세요
    </p>
  </div>
)}
```

**업로드 로직 수정**:
```javascript
const handleUpload = async () => {
  if (!file) {
    toast.error('파일을 선택해주세요.');
    return;
  }

  if (fileType === 'samsung' && !cardHolder.trim()) {
    toast.error('카드 소유자 이름을 입력해주세요.');
    return;
  }

  try {
    let result;
    if (fileType === 'samsung') {
      result = await cardTransactionAPI.uploadExcel(file, cardHolder.trim());
    } else {
      result = await transactionAPI.uploadExcel(file, accountType);
    }
    // ...
  }
}
```

### 2. API Service 수정

**파일**: `frontend/src/api/cardTransactionService.js`

```javascript
export const cardTransactionAPI = {
  // Samsung Card Excel 파일 업로드
  uploadExcel: async (file, cardHolder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('card_holder', cardHolder);  // 카드 소유자 추가
    const response = await api.post('/card-transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // ...
}
```

### 3. CardTransactionTable 컴포넌트

**파일**: `frontend/src/components/CardTransactionTable.jsx`

**테이블 헤더 수정**:
```jsx
<thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
  <tr>
    <th>사용자</th>
    <th>결제유형</th>  {/* 새로 추가 */}
    <th>날짜</th>
    <th>가맹점</th>
    <th>금액</th>
    <th>카테고리</th>
    <th>메모</th>
  </tr>
</thead>
```

**결제유형 컬럼 추가**:
```jsx
<td className="px-4 py-3 text-sm">
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
    transaction.payment_type === '일시불'
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800'
  }`}>
    {transaction.payment_type}
  </span>
</td>
```

---

## 🗄️ Database 처리

**기존 테이블 삭제** (스키마 변경으로 인한):
```bash
python -c "import sqlite3; conn = sqlite3.connect('backend/data/account_book.db'); cursor = conn.cursor(); cursor.execute('DROP TABLE IF EXISTS card_transactions'); conn.commit(); conn.close()"
```

FastAPI 서버 시작 시 새로운 스키마로 자동 재생성됨.

---

## 📊 Excel 파일 구조 분석 결과

**파일**: `samsungcard_20260113.xlsx`

**시트 구성**:
- Sheet 0: "일시불"
- Sheet 1: "할부"
- Sheet 2: "해외이용" (제외)
- Sheet 3: 안내문 (제외)

**컬럼 구조** (skiprows=2):
- 컬럼 0: 이용일 (YYYYMMDD)
- 컬럼 1: 이용구분 (카드 번호 뒷자리 - 사용 안 함)
- 컬럼 2: 가맹점
- 컬럼 3: 이용금액 (문자열, 쉼표 포함)
- 컬럼 9: 원 (숫자 값) ⭐ **현재 사용 중**

**분석 스크립트**: `analyze_excel.py` 사용

---

## 🎯 사용자 경험 흐름

### 1. 업로드 단계
1. "파일 업로드" 탭 클릭
2. 파일 유형: "Samsung 카드" 선택
3. **💳 카드 소유자 이름 입력**: "박지훈" (필수)
4. Excel 파일 선택: `samsungcard_20260113.xlsx`
5. 업로드 버튼 클릭
6. 성공 메시지: "총 100건 중 100건 추가, 0건 중복"

### 2. 조회 단계
1. "카드 내역" 탭 클릭
2. 필터:
   - 카드 사용자: "박지훈" 또는 "전체"
   - 조회 기간: "2025-12"
3. 테이블 확인:
   - **사용자**: 박지훈
   - **결제유형**: 일시불 (초록) / 할부 (주황)
   - 날짜, 가맹점, 금액, 카테고리, 메모

### 3. 통계 확인
1. "카드 통계" 탭 클릭
2. 사용자별 파이 차트에서 "박지훈" 비율 확인
3. 월간 추이 그래프에서 "박지훈" 라인 확인

---

## 🔍 주요 기술적 결정

### 1. 왜 시트명을 payment_type으로?
- Samsung 카드 Excel 파일에서 시트명이 "일시불", "할부"로 명확히 구분됨
- 컬럼에 별도 결제 유형 정보가 없음
- 시트 자체가 결제 유형을 나타냄

### 2. 왜 card_holder를 업로드 시 입력?
- Excel 파일에 카드 소유자 정보가 없음
- 파일명이나 시트명에서 사용자를 추출할 수 없음
- 수동 입력이 가장 명확하고 유연한 방법

### 3. 중복 체크 키
```
(card_holder, payment_type, transaction_date, amount, description)
```
- 같은 사람이 같은 날 같은 가게에서 같은 금액을 일시불/할부 각각 결제할 수 있음
- 따라서 payment_type 포함 필수

### 4. UI 색상 선택
- **일시불**: 초록 (`bg-green-100 text-green-800`) - 즉시 결제 완료
- **할부**: 주황 (`bg-orange-100 text-orange-800`) - 분할 결제

---

## 📝 테스트 방법

### Backend 테스트
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# API 테스트
curl -X POST http://localhost:8000/api/card-transactions/upload \
  -F "file=@samsungcard_20260113.xlsx" \
  -F "card_holder=박지훈"

curl http://localhost:8000/api/card-transactions/?card_holder=박지훈
```

### Frontend 테스트
```bash
cd frontend
npm run dev

# 브라우저에서 http://localhost:5173
# 1. 파일 업로드 탭 → Samsung 카드 → 소유자 입력 → 업로드
# 2. 카드 내역 탭 → 데이터 확인
# 3. 카드 통계 탭 → 사용자별 통계 확인
```

---

## 📁 변경된 파일 전체 목록

### Backend (4개 파일):
1. ✅ `backend/app/models.py` - payment_type 필드 추가
2. ✅ `backend/app/schemas.py` - payment_type 필드 추가
3. ✅ `backend/app/routers/card_transactions.py` - 파서 + API 수정
4. ✅ `backend/data/account_book.db` - card_transactions 테이블 재생성

### Frontend (3개 파일):
5. ✅ `frontend/src/components/ExcelUpload.jsx` - 카드 소유자 입력 추가
6. ✅ `frontend/src/api/cardTransactionService.js` - card_holder 파라미터 추가
7. ✅ `frontend/src/components/CardTransactionTable.jsx` - 결제유형 컬럼 추가

---

## 🚀 다음 단계 (선택 사항)

1. **카드 소유자 프리셋** - 자주 사용하는 이름을 드롭다운으로 제공
2. **결제 유형 필터** - 일시불/할부로 거래내역 필터링
3. **할부 회차 정보** - Excel에서 추출 가능하면 추가
4. **통계 차트** - 일시불 vs 할부 비율 차트
5. **다중 파일 업로드** - 여러 명의 카드 명세서 한 번에 업로드

---

## ✨ 완료 요약

- ✅ Backend: payment_type 필드, card_holder 파라미터 (100%)
- ✅ Frontend: 카드 소유자 입력, 결제유형 표시 (100%)
- ✅ Database: 스키마 변경 완료 (100%)
- ✅ Excel 구조 분석 완료 (100%)
- ✅ 중복 체크 로직 업데이트 (100%)

**상태**: 🎉 **프로덕션 준비 완료!**
