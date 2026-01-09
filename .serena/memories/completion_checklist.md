# Task Completion Checklist

작업 완료 시 다음 사항들을 확인하세요:

## Code Quality

### Backend (Python)
- [ ] 모든 엔드포인트에 response_model 지정
- [ ] HTTPException으로 적절한 에러 처리
- [ ] 데이터베이스 세션 의존성 주입 사용 (`Depends(get_db)`)
- [ ] Pydantic 스키마로 입출력 검증
- [ ] 로깅 추가 (INFO/ERROR 레벨)
- [ ] 중복 데이터 체크 로직 확인

### Frontend (React)
- [ ] ESLint 경고 없음 (`npm run lint`)
- [ ] 에러 처리 및 사용자 피드백 제공
- [ ] 로딩 상태 표시
- [ ] axios 인터셉터를 통한 로깅
- [ ] TailwindCSS 스타일 일관성
- [ ] 반응형 디자인 확인 (sm/md/lg)

## Functionality

### Testing
- [ ] Backend 서버 정상 실행 확인 (`http://localhost:8000/health`)
- [ ] Frontend 서버 정상 실행 확인 (`http://localhost:5173`)
- [ ] API 엔드포인트 테스트 (curl 또는 브라우저 DevTools)
- [ ] 브라우저 콘솔 에러 없음 (F12 Console 탭)
- [ ] 네트워크 요청 성공 확인 (F12 Network 탭)

### Features
- [ ] Excel 파일 업로드 및 파싱 동작
- [ ] 중복 거래 필터링 동작
- [ ] 카테고리 자동 분류 동작
- [ ] 거래내역 조회 및 페이지네이션
- [ ] 카테고리 인라인 수정 동작
- [ ] 월별 통계 정확성
- [ ] 카테고리별 통계 및 차트 표시
- [ ] 월 선택 기능 동작

## CORS & Integration
- [ ] CORS 설정 확인 (frontend origin 허용)
- [ ] API 요청 URL 일치 (`http://localhost:8000/api`)
- [ ] 데이터베이스 파일 생성 확인 (`backend/data/account_book.db`)

## User Experience
- [ ] 에러 메시지 한글로 표시
- [ ] 로딩 상태 명확히 표시
- [ ] "다시 시도" 버튼 동작
- [ ] 빈 데이터 상태 메시지 표시
- [ ] 금액 포맷팅 (천 단위 콤마)

## Documentation
- [ ] 새로운 API 엔드포인트는 README.md 업데이트
- [ ] 환경 변수 변경 시 문서화
- [ ] 새로운 카테고리 추가 시 목록 업데이트

## No Breaking Changes
- [ ] 기존 API 엔드포인트 호환성 유지
- [ ] 데이터베이스 스키마 변경 시 마이그레이션 고려
- [ ] 기존 업로드된 파일 처리 가능 여부 확인

## Performance
- [ ] API 응답 시간 확인 (로그에서 확인)
- [ ] 대용량 Excel 파일 처리 테스트
- [ ] 페이지네이션 limit 적절히 설정
