# UI/UX 개선 분석 및 실행 계획 (2026-01-12)

## 현재 상태 분석

### 완료된 항목 (Phase 1)
✅ Dashboard 구현 완료 (요약 카드, 최근 거래, 월별 추이 차트)
✅ 색상 시스템 구축 (constants/colors.js)
✅ react-icons 통합
✅ 타이포그래피 개선
✅ 헤더 및 탭 네비게이션 개선
✅ 카드 디자인 hover 효과
✅ 테이블 UX 개선

### 현재 기술 스택
- Frontend: React 18 + Vite 7 + TailwindCSS 3.4 + Recharts 3.6
- Backend: FastAPI + SQLite + SQLAlchemy
- Icons: react-icons/hi

### 백엔드 API 엔드포인트
**Transactions:**
- POST /upload
- GET / (list with pagination)
- GET /{id}
- PUT /{id}
- DELETE /{id}
- GET /year-months/list

**Statistics:**
- GET /monthly/{year_month}
- GET /category/{year_month}
- GET /months
- GET /total-assets
- GET /total-assets/{year_month}

**Categories:**
- GET / (list all)
- POST / (create)
- PUT /{id}
- DELETE /{id}
- GET /list

### 개선이 필요한 영역
1. 사용자 피드백 (현재 alert 사용)
2. 로딩 상태 (스피너만 있음)
3. Empty State (기본적)
4. 삭제 확인 없음
5. 검색/필터 기능 부족

---

## Phase A - Quick UX Improvements (진행 중)
**목표: 백엔드 수정 없이 즉시 UX 개선**
**소요 시간: 4-6시간**

### 1. Toast 알림 시스템
- 라이브러리: react-hot-toast
- 현재 문제: alert() 사용으로 구식 UX
- 개선: 성공/실패/정보 toast 알림

### 2. 로딩 스켈레톤
- 현재: 스피너만 표시
- 개선: 스켈레톤 UI로 콘텐츠 로딩 상태 표시
- 적용 위치: Dashboard, TransactionTable, Statistics

### 3. 삭제 확인 모달
- 현재: 즉시 삭제
- 개선: 확인 모달로 실수 방지
- 적용: 거래 삭제, 카테고리 매핑 삭제

### 4. Empty State 개선
- 현재: 단순 텍스트
- 개선: 아이콘 + 안내 메시지 + 액션 버튼
- 적용: 모든 데이터 없음 상태

### 5. 거래내역 검색 기능
- 클라이언트 사이드 검색
- 거래처/적요 실시간 필터링
- TransactionTable에 검색바 추가

---

## Phase B - Essential Features (대기)
**백엔드 개발 필요**

### 1. 예산 관리 시스템
- 백엔드: Budget 모델 (category, month, amount)
- API: CRUD + 진행률 조회
- 프론트: 예산 설정 UI + Dashboard 진행률 표시

### 2. 고급 필터 시스템
- 백엔드: 금액 범위, 적요 검색 쿼리 파라미터
- 프론트: FilterPanel 컴포넌트
- react-datepicker 추가

### 3. CSV 내보내기
- 프론트엔드만: xlsx 라이브러리
- 거래내역, 월별 통계 다운로드

---

## Phase C - Polish (대기)
**UI/UX 고도화**

### 1. 다크모드
- ThemeContext + localStorage
- 시스템 테마 감지
- 모든 컴포넌트 다크 스타일

### 2. 모바일 최적화
- 터치 제스처
- 작은 화면 레이아웃
- Drawer 네비게이션

### 3. 애니메이션
- framer-motion
- 페이지 전환
- 리스트 stagger

---

## 장기 아이디어
1. 반복 거래 감지 (AI/ML)
2. 태그 시스템 (#여행, #선물)
3. 영수증 이미지 첨부
4. 비교 뷰 (여러 월)
5. 저축 목표 설정
6. 예산 초과 알림

---

## 파일 구조 계획

```
frontend/src/
├── components/
│   ├── common/           # Phase A에서 생성
│   │   ├── Toast.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── EmptyState.jsx
│   │   └── SearchBar.jsx
│   └── [기존 컴포넌트들]
```

---

## 다음 단계
Phase A 완료 후 Phase B 백엔드 개발 여부 결정
