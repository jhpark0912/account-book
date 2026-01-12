# Samsung Card 다중 사용자 카드 내역 구현 계획

## 날짜: 2026-01-12

## 📊 Samsung 카드 파일 구조 분석

### 파일 정보
- **파일명**: `samsungcard_20260113.xlsx`
- **시트 구성**: 4개 시트
  1. `이사금` (사용자1) - 49건 거래, 총 933,436원
  2. `엄주` (사용자2) - 1건 거래, 총 82,200원
  3. `해외이용` - 해외 거래 내역
  4. 안내문 시트

### 컬럼 구조
- **Column 0**: 이용일 (날짜, YYYYMMDD 형식, 예: 20251201)
- **Column 1**: 이용구분 (카드 식별자, 예: "** ** 951")
- **Column 2**: 가맹점 (업체명)
- **Column 3**: 이용금액 (콤마 포함 문자열, 예: "1,000")
- **Column 8**: 원 (숫자 금액, 예: 1000)
- 기타: 할부, 회차, 포인트 등

### 특징
- 각 시트 마지막에 합계 행 존재 (Column 0이 빈 값이고 Column 2가 "합계")
- 시트 이름으로 사용자 구분
- 헤더는 row 1에 위치 (skiprows=1 필요)

## 🔄 Toss vs Samsung Card 차이점

| 항목 | Toss | Samsung Card |
|------|------|--------------|
| 시트 구조 | 단일 시트 | 다중 시트 (사용자별) |
| 사용자 구분 | 없음 | 시트 이름으로 구분 |
| 날짜 형식 | YYYY.MM.DD HH:MM:SS | YYYYMMDD |
| 합계 행 | 없음 | 각 시트 마지막에 존재 |
| 파싱 위치 | '거래 일시' 헤더 검색 | 고정 skiprows=1 |

## ✅ 사용자 결정사항

### 1. 데이터 저장 방식
- **결정**: **별도 테이블로 분리**
- 새 테이블 `card_transactions` 생성
- 기존 `transactions` 테이블은 Toss 전용으로 유지

### 2. 파일 형식 구분
- **결정**: **업로드 시 사용자가 선택**
- UI에 드롭다운 추가 (Toss / Samsung Card)

### 3. 통계 화면 표시
- **결정**: 다음 4가지 모두 구현
  1. ✅ 사용자별 파이 차트
  2. ✅ 사용자별 월간 추이 그래프
  3. ✅ 사용자별 카테고리 테이블
  4. ✅ 필터 기능 (사용자 선택)

## 🛠️ 구현 계획

### Backend 작업

#### 1. 새 테이블 생성 (`card_transactions`)
```python
# backend/app/models/card_transaction.py
class CardTransaction(Base):
    __tablename__ = "card_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    card_holder = Column(String, index=True)  # 시트 이름 (사용자명)
    transaction_date = Column(String, index=True)  # YYYY.MM.DD 형식으로 변환
    description = Column(String)  # 가맹점명
    amount = Column(Integer)  # 음수로 저장 (지출)
    year_month = Column(String, index=True)  # YYYY-MM
    category = Column(String, nullable=True)
    memo = Column(String, nullable=True)
    raw_date = Column(String)  # 원본 YYYYMMDD
```

#### 2. Samsung Card 파서 함수
```python
# backend/app/routers/card_transactions.py

def parse_samsung_card_excel(file_path: str) -> List[Dict]:
    """
    Samsung Card Excel 파일 파싱
    - 여러 시트 읽기 (첫 2개 시트만 - 사용자별)
    - 각 시트 이름을 card_holder로 사용
    - 합계 행 제외
    """
    xls = pd.ExcelFile(file_path)
    all_transactions = []
    
    # 첫 2개 시트만 처리 (사용자 시트)
    for sheet_name in xls.sheet_names[:2]:
        df = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=1)
        
        # 합계 행 제외 (Column 0이 NaN인 행)
        df = df[df.iloc[:, 0].notna()]
        
        for _, row in df.iterrows():
            raw_date = str(row.iloc[0])  # YYYYMMDD
            # YYYY.MM.DD 형식으로 변환
            trans_date = f"{raw_date[:4]}.{raw_date[4:6]}.{raw_date[6:8]}"
            year_month = f"{raw_date[:4]}-{raw_date[4:6]}"
            
            transaction = {
                "card_holder": sheet_name,
                "transaction_date": trans_date,
                "description": row.iloc[2],  # 가맹점
                "amount": -int(row.iloc[8]),  # 지출은 음수
                "year_month": year_month,
                "raw_date": raw_date
            }
            all_transactions.append(transaction)
    
    return all_transactions
```

#### 3. 새 라우터 엔드포인트
- `POST /api/card-transactions/upload` - Samsung Card 업로드
- `GET /api/card-transactions/` - 조회 (필터: card_holder, year_month)
- `GET /api/card-transactions/users` - 사용자 목록
- `GET /api/card-transactions/statistics/monthly` - 월간 통계
- `GET /api/card-transactions/statistics/by-user` - 사용자별 통계
- `PUT /api/card-transactions/{id}` - 카테고리 수정
- `DELETE /api/card-transactions/{id}` - 삭제

### Frontend 작업

#### 1. ExcelUpload 컴포넌트 수정
```jsx
// 드롭다운 추가
<select onChange={(e) => setFileType(e.target.value)}>
  <option value="toss">Toss 은행</option>
  <option value="samsung">Samsung 카드</option>
</select>

// 업로드 로직 분기
if (fileType === 'samsung') {
  await cardTransactionAPI.uploadExcel(formData);
} else {
  await transactionAPI.uploadExcel(formData);
}
```

#### 2. 새 CardTransactionTable 컴포넌트
- card_holder 컬럼 표시
- 사용자 필터 드롭다운
- 기존 TransactionTable과 유사한 구조

#### 3. CardStatistics 컴포넌트
- **사용자별 파이 차트**: 각 사용자의 총 지출 비율
- **월간 추이 그래프**: 시간축에 사용자별 라인
- **카테고리 테이블**: 행=카테고리, 열=사용자
- **필터**: 사용자 선택, 월 선택

#### 4. App.jsx 탭 추가
```jsx
<Tab>카드 업로드</Tab>
<Tab>카드 내역</Tab>
<Tab>카드 통계</Tab>
```

### API Service 추가
```javascript
// src/api/cardTransactionService.js
export const cardTransactionAPI = {
  uploadExcel: (formData) => api.post('/card-transactions/upload', formData),
  getTransactions: (params) => api.get('/card-transactions/', { params }),
  getUsers: () => api.get('/card-transactions/users'),
  getMonthlyStats: (params) => api.get('/card-transactions/statistics/monthly', { params }),
  getUserStats: (params) => api.get('/card-transactions/statistics/by-user', { params }),
  updateCategory: (id, category) => api.put(`/card-transactions/${id}`, { category }),
  deleteTransaction: (id) => api.delete(`/card-transactions/${id}`)
};
```

## 📝 구현 순서

1. ✅ Samsung Card 파일 구조 분석 완료
2. Backend: CardTransaction 모델 생성
3. Backend: parse_samsung_card_excel 함수 구현
4. Backend: card_transactions 라우터 생성
5. Backend: 통계 엔드포인트 구현
6. Frontend: cardTransactionService.js 생성
7. Frontend: ExcelUpload에 파일 타입 선택 추가
8. Frontend: CardTransactionTable 컴포넌트 생성
9. Frontend: CardStatistics 컴포넌트 생성 (4가지 시각화)
10. Frontend: App.jsx에 탭 추가
11. 테스트: samsungcard_20260113.xlsx로 업로드 테스트
12. 테스트: 통계 화면 동작 확인

## 🔍 주의사항

1. **중복 방지**: 동일한 (card_holder, transaction_date, description, amount) 조합 체크
2. **자동 카테고리 매핑**: 기존 category_mappings 테이블 재사용
3. **금액 부호**: Samsung Card는 모두 지출이므로 음수로 저장
4. **날짜 변환**: YYYYMMDD → YYYY.MM.DD 형식
5. **합계 행 제외**: 파싱 시 빈 날짜 행은 스킵
