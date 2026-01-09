# Frontend Design Improvement Plan

## 작업 일자: 2026-01-09

## 현재 상태 분석

### 기술 스택
- React 18 + Vite 7
- TailwindCSS 3.4
- Recharts 3.6
- 4개 탭: 파일 업로드, 거래내역, 통계, 카테고리 매핑

### 현재 디자인 문제점
1. 시각적 계층 부족 - 모든 카드가 동일한 스타일
2. 색상 팔레트 제한적 (주로 blue, gray만 사용)
3. 타이포그래피 단조로움
4. 인터랙션 피드백 부족 (hover, transition 등)
5. 공백과 여백이 일관되지 않음
6. 데이터 시각화 제한적
7. 모바일 UX 개선 여지

---

## Phase 1: Quick Wins (즉시 적용 가능) ⚡
**예상 시간: 8-10시간**

### 1. 색상 시스템 강화 (1-2시간)
- [ ] 의미론적 색상 정의
  - 수입: emerald/green 계열 (text-emerald-600, bg-emerald-50)
  - 지출: rose/red 계열 (text-rose-600, bg-rose-50)
  - 정보: blue 계열 (text-blue-600, bg-blue-50)
  - 경고: amber/yellow 계열 (text-amber-600, bg-amber-50)
- [ ] 그라데이션 배경 추가 (bg-gradient-to-r)
- [ ] constants/colors.js 파일 생성

### 2. 타이포그래피 개선 (1시간)
- [ ] 타이포그래피 계층 정의
  - 헤더: text-2xl-3xl, font-bold
  - 서브헤더: text-xl-2xl, font-semibold
  - 본문: text-sm-base, font-normal
  - 캡션: text-xs, font-medium
- [ ] 일관된 폰트 스타일 적용

### 3. 헤더 개선 (1시간)
- [ ] App.jsx 헤더 그라데이션 배경 추가
- [ ] 헤더 타이포그래피 개선
- [ ] 아이콘 추가 고려 (react-icons 설치)

### 4. 탭 네비게이션 개선 (1시간)
- [ ] 아이콘 추가 (업로드, 리스트, 차트, 설정)
- [ ] hover 효과 강화
- [ ] transition 애니메이션 추가
- [ ] 활성 탭 하이라이트 개선

### 5. 카드 디자인 개선 (2시간)
- [ ] hover 효과 추가 (transform scale, shadow-lg)
- [ ] 경계선 강조 옵션 (border-l-4 accent)
- [ ] 간격 시스템 통일 (p-6, space-y-6)
- [ ] 모든 컴포넌트에 일관된 카드 스타일 적용

### 6. 테이블 UX 개선 (2-3시간)
- [ ] TransactionTable.jsx 개선
  - 번갈아가는 행 색상 (even:bg-gray-50)
  - 스티키 헤더 (sticky top-0 bg-white)
  - 개선된 hover 효과 (bg-blue-50)
  - 금액 컬럼 색상 강화
- [ ] 모바일 반응형 개선
  - 작은 화면에서 카드 레이아웃으로 전환
  - 중요 정보만 표시

---

## Phase 2: Advanced Features 🚀
**예상 시간: 15-20시간**

### 1. 대시보드 추가 (5-6시간)
- [ ] Dashboard.jsx 컴포넌트 생성
- [ ] 요약 지표 카드
  - 총 자산
  - 이번 달 수입/지출
  - 저번 달 대비 증감
- [ ] 최근 거래 위젯 (최근 5건)
- [ ] 월별 추이 미니 차트
- [ ] App.jsx에 Dashboard 탭 추가 (기본 탭)

### 2. 데이터 시각화 강화 (4-5시간)
- [ ] 월별 수입/지출 라인 차트
- [ ] 카테고리별 트렌드 바 차트
- [ ] 예산 대비 실제 지출 차트
- [ ] 차트 색상 통일
- [ ] 차트 툴팁 개선

### 3. 필터 & 검색 (3-4시간)
- [ ] SearchFilter.jsx 컴포넌트 생성
- [ ] 거래처 검색 기능
- [ ] 금액 범위 필터
- [ ] 날짜 범위 선택기 (react-datepicker 고려)
- [ ] 저장된 필터 기능

### 4. UX 개선 (3-5시간)
- [ ] Loading.jsx 스켈레톤 컴포넌트
- [ ] EmptyState.jsx 빈 상태 컴포넌트
- [ ] Toast.jsx 알림 시스템
- [ ] Modal.jsx 확인 모달
- [ ] 삭제 확인 다이얼로그
- [ ] 성공/실패 피드백 강화

---

## Phase 3: Pro Features 💎
**예상 시간: 20-30시간**

### 1. 다크 모드 (6-8시간)
- [ ] ThemeContext 생성
- [ ] 테마 토글 스위치
- [ ] 모든 컴포넌트 다크 모드 스타일
- [ ] localStorage에 테마 저장
- [ ] 시스템 테마 감지

### 2. 애니메이션 (4-6시간)
- [ ] framer-motion 설치
- [ ] 페이지 전환 애니메이션
- [ ] 리스트 stagger 애니메이션
- [ ] 마이크로 인터랙션 (버튼, 카드)
- [ ] 로딩 애니메이션

### 3. 고급 레이아웃 (6-8시간)
- [ ] 사이드바 네비게이션
- [ ] 브레드크럼 추가
- [ ] 멀티 패널 뷰 (split view)
- [ ] 반응형 사이드바 (모바일에서 drawer)

### 4. 접근성 (4-8시간)
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션
- [ ] Focus visible 스타일
- [ ] 스크린 리더 지원
- [ ] 고대비 모드

---

## 파일 구조 제안

```
frontend/src/
├── components/
│   ├── common/           # 공통 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Loading.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Toast.jsx
│   │   └── Modal.jsx
│   ├── layout/           # 레이아웃
│   │   ├── Header.jsx
│   │   ├── Navigation.jsx
│   │   └── Sidebar.jsx
│   ├── dashboard/        # 대시보드
│   │   ├── Dashboard.jsx
│   │   ├── SummaryCard.jsx
│   │   └── RecentTransactions.jsx
│   └── [기존 컴포넌트들]
├── constants/
│   ├── colors.js         # 색상 시스템
│   └── typography.js     # 타이포그래피
├── contexts/
│   └── ThemeContext.jsx  # 테마 컨텍스트
└── styles/
    └── animations.css    # 커스텀 애니메이션
```

---

## 권장 라이브러리

### Phase 1
- 현재 스택으로 충분

### Phase 2
- `react-icons`: 아이콘 (이미 설치 가능)
- `react-datepicker`: 날짜 선택기
- `recharts`: 이미 사용 중

### Phase 3
- `framer-motion`: 애니메이션
- `react-hot-toast`: 토스트 알림

---

## 다음 단계

사용자에게 질문할 사항:
1. 어떤 Phase부터 시작할까요?
2. 특별히 개선하고 싶은 페이지가 있나요?
3. 디자인 참고 사이트가 있나요?
4. 브랜드 컬러가 있나요?
5. 다크모드가 필요한가요?

---

## 참고사항

- 현재 수정된 파일: transactions.py, accountService.js, TransactionTable.jsx
- Windows 환경에서 작업 중
- 백엔드: FastAPI + SQLite
- 프론트엔드: React 18 + Vite + TailwindCSS
