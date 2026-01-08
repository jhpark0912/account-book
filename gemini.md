## 요청

- 답변은 항상 한글로 할것

## 프로젝트 구조

- 백엔드는 python (FASTAPI), SQLLite 활용
- 프론트는 react 활용

## 프로젝트 목표

- 엑셀 파일을 첨부해서 해당 파일의 구조에 맞게 데이터 저장
- 저장 된 데이터를 표형태로 보여주고, 카테고리 화 시켜서 데이터 분류
- 업로드 파일 타입은 저수지 계좌, 생활비 계좌로 나눔

## 주요 개선사항

- **`account_type` 및 `category` 데이터 관리 방식 개선:**
  - 기존에 코드 곳곳에 하드코딩된 문자열("생활비", "식비" 등)으로 관리되던 `account_type`과 `category`의 핵심 값들을 중앙에서 관리하는 방식으로 변경하여 코드의 안정성과 유지보수성을 크게 향상시켰습니다.
  - **백엔드:** `enums.py` 파일을 생성하여 `AccountType`과 `TransactionCategory` Enum을 정의했습니다. API 요청 시 이 Enum을 통해 데이터 유효성을 검증하여 잘못된 값이 시스템에 들어오는 것을 방지합니다.
  - **프론트엔드:** `constants` 디렉토리를 생성하고 `accountTypes.js`, `transactionCategories.js` 파일을 추가하여 관련 상수들을 관리합니다. React 컴포넌트들이 이 상수들을 사용하도록 리팩토링하여, 백엔드와 프론트엔드 간의 데이터 일관성을 확보하고 오타로 인한 버그 발생 가능성을 줄였습니다.

## prompt for claude

- When I asked for prompt then make md file in .claude\gemini
- make prompt use english
- 