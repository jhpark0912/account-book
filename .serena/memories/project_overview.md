# Account Book Project Overview

## Purpose
토스뱅크 Excel 거래내역을 기반으로 한 가계부 웹 애플리케이션입니다. 사용자는 Excel 파일을 업로드하여 거래내역을 자동으로 파싱하고, 카테고리별로 분류하며, 월별 통계를 확인할 수 있습니다.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Data Processing**: pandas, openpyxl
- **Validation**: Pydantic

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4
- **Charts**: Recharts 3.6
- **HTTP Client**: Axios 1.13
- **Language**: JavaScript (ES2020+)

## Key Features
1. Excel 파일 업로드 및 자동 파싱
2. 카테고리 자동 분류 (식비, 교통비, 주거생활비, 미용비, 건강관리비, 사회생활비, 문화생활비, 뚜이)
3. 거래내역 조회 및 카테고리 수정
4. 월별 통계 (수입/지출/잔액)
5. 카테고리별 통계 및 파이 차트 시각화

## Development Info
- **Backend Port**: 8000
- **Frontend Port**: 5173
- **API Docs**: http://localhost:8000/docs
- **Platform**: Windows
