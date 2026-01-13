from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import pandas as pd
import os
import logging

from .. import models, schemas
from ..database import get_db
from ..enums import TransactionCategory

router = APIRouter(prefix="/card-transactions", tags=["card-transactions"])
logger = logging.getLogger(__name__)


def parse_samsung_card_excel(file_path: str, card_holder: str) -> List[dict]:
    """Samsung Card Excel 파일 파싱 (일시불/할부 시트별 처리)

    Args:
        file_path: Excel 파일 경로
        card_holder: 카드 소유자 이름 (업로드 시 사용자가 입력)
    """
    try:
        xls = pd.ExcelFile(file_path)
        all_transactions = []

        # 첫 2개 시트만 처리 (일시불, 할부)
        sheets_to_process = xls.sheet_names[:2]
        logger.info(f"Processing sheets for user {card_holder}: {sheets_to_process}")

        for sheet_name in sheets_to_process:
            logger.info(f"Parsing sheet: {sheet_name}")
            # skiprows=2: 제목 행과 빈 행 건너뛰기 (Row 0, 1)
            # Row 2가 헤더, Row 3부터 데이터 시작
            df = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=2, header=0)
            
            # 합계 행 제외 (첫 번째 열이 NaN인 행)
            df = df[df.iloc[:, 0].notna()]
            
            for _, row in df.iterrows():
                try:
                    raw_date = str(int(row.iloc[0]))  # YYYYMMDD (숫자로 읽힐 수 있음)
                    
                    # YYYY.MM.DD 형식으로 변환
                    if len(raw_date) == 8:
                        trans_date = f"{raw_date[:4]}.{raw_date[4:6]}.{raw_date[6:8]}"
                        year_month = f"{raw_date[:4]}-{raw_date[4:6]}"
                    else:
                        logger.warning(f"Invalid date format: {raw_date}")
                        continue
                    
                    # Column 9: 원 (금액 - 실제 숫자 값)
                    amount_val = row.iloc[9]
                    
                    # NaN 체크
                    if pd.isna(amount_val):
                        logger.warning(f"Amount is NaN for row: {row.iloc[2]}")
                        continue
                    
                    amount = float(amount_val)
                    
                    transaction = {
                        "card_holder": card_holder,  # 업로드 시 입력한 사용자
                        "payment_type": sheet_name,  # 시트명 (일시불, 할부)
                        "transaction_date": trans_date,
                        "description": str(row.iloc[2]),  # 가맹점
                        "amount": -amount,  # 지출은 음수로 저장
                        "year_month": year_month,
                        "raw_date": raw_date
                    }
                    all_transactions.append(transaction)
                    
                except Exception as e:
                    logger.error(f"Error parsing row in sheet {sheet_name}: {e}", exc_info=True)
                    continue
        
        logger.info(f"Total transactions parsed: {len(all_transactions)}")
        return all_transactions
        
    except Exception as e:
        logger.error(f"Error parsing Samsung Card Excel: {e}", exc_info=True)
        raise ValueError(f"Samsung Card Excel 파싱 오류: {str(e)}")


def auto_categorize(description: str, memo: Optional[str], db: Session) -> Optional[str]:
    """거래처명과 메모를 기반으로 카테고리 자동 분류"""
    # 1. 메모에 카테고리가 명시되어 있는지 확인
    if memo:
        for category in TransactionCategory:
            if category == TransactionCategory.UNCATEGORIZED:
                continue
            if category.value in memo:
                return category.value
    
    # 2. 데이터베이스의 매핑 테이블에서 검색
    mappings = db.query(models.CategoryMapping).all()
    for mapping in mappings:
        if mapping.keyword in description:
            return mapping.category
    
    # 3. 기본값: None (미분류)
    return None


@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    card_holder: str = Form(...),
    db: Session = Depends(get_db)
):
    """Samsung Card Excel 파일 업로드 및 파싱

    Args:
        file: Samsung Card Excel 파일
        card_holder: 카드 소유자 이름 (필수)
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")

    if not card_holder or not card_holder.strip():
        raise HTTPException(status_code=400, detail="카드 소유자 이름을 입력해주세요.")
    
    # 파일 저장
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    try:
        # Excel 파싱 (카드 소유자 정보 전달)
        transactions_data = parse_samsung_card_excel(file_path, card_holder.strip())
        
        new_records = 0
        duplicate_records = 0
        
        for trans_data in transactions_data:
            # 중복 체크 (같은 카드소유자, 결제유형, 날짜, 금액, 가맹점)
            existing = db.query(models.CardTransaction).filter(
                models.CardTransaction.card_holder == trans_data["card_holder"],
                models.CardTransaction.payment_type == trans_data["payment_type"],
                models.CardTransaction.transaction_date == trans_data["transaction_date"],
                models.CardTransaction.amount == trans_data["amount"],
                models.CardTransaction.description == trans_data["description"]
            ).first()
            
            if existing:
                duplicate_records += 1
                continue
            
            # 카테고리 자동 분류
            category = auto_categorize(
                trans_data["description"],
                trans_data.get("memo"),
                db
            )
            trans_data["category"] = category
            trans_data["memo"] = None  # 기본값
            
            # DB에 저장
            db_transaction = models.CardTransaction(**trans_data)
            db.add(db_transaction)
            new_records += 1
        
        db.commit()
        
        return schemas.UploadResponse(
            message="업로드 완료",
            total_records=len(transactions_data),
            new_records=new_records,
            duplicate_records=duplicate_records
        )
    
    except Exception as e:
        logger.error(f"File processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"파일 처리 중 오류 발생: {str(e)}")


@router.get("/", response_model=List[schemas.CardTransaction])
def get_card_transactions(
    card_holder: Optional[str] = None,
    year_month: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """카드 거래내역 조회"""
    query = db.query(models.CardTransaction)
    
    if card_holder:
        query = query.filter(models.CardTransaction.card_holder == card_holder)
    if year_month:
        query = query.filter(models.CardTransaction.year_month == year_month)
    if category:
        query = query.filter(models.CardTransaction.category == category)
    
    transactions = query.order_by(
        models.CardTransaction.transaction_date.desc()
    ).offset(offset).limit(limit).all()
    
    return transactions


@router.get("/users", response_model=List[str])
def get_card_holders(db: Session = Depends(get_db)):
    """카드 사용자 목록 조회"""
    users = db.query(models.CardTransaction.card_holder)\
        .distinct()\
        .order_by(models.CardTransaction.card_holder)\
        .all()
    return [user[0] for user in users]


@router.get("/year-months", response_model=List[str])
def get_available_year_months(db: Session = Depends(get_db)):
    """사용 가능한 년월 목록 조회"""
    year_months = db.query(models.CardTransaction.year_month)\
        .distinct()\
        .order_by(models.CardTransaction.year_month.desc())\
        .all()
    return [ym[0] for ym in year_months]


@router.put("/{transaction_id}", response_model=schemas.CardTransaction)
def update_card_transaction_category(
    transaction_id: int,
    category: Optional[str] = None,
    memo: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """카드 거래 카테고리/메모 수정"""
    transaction = db.query(models.CardTransaction).filter(
        models.CardTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="거래내역을 찾을 수 없습니다.")
    
    if category is not None:
        transaction.category = category
    if memo is not None:
        transaction.memo = memo
    
    db.commit()
    db.refresh(transaction)
    return transaction




@router.get("/statistics/by-user", response_model=List[schemas.UserStatistics])
def get_user_statistics(
    year_month: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """사용자별 통계 조회"""
    query = db.query(
        models.CardTransaction.card_holder,
        func.sum(models.CardTransaction.amount).label('total_amount'),
        func.count(models.CardTransaction.id).label('transaction_count')
    )
    
    if year_month:
        query = query.filter(models.CardTransaction.year_month == year_month)
    
    results = query.group_by(models.CardTransaction.card_holder).all()
    
    # 총 금액 계산 (비율 계산용)
    total = sum(abs(r.total_amount) for r in results)
    
    return [
        schemas.UserStatistics(
            card_holder=r.card_holder,
            total_amount=r.total_amount,
            transaction_count=r.transaction_count,
            percentage=abs(r.total_amount) / total * 100 if total > 0 else 0
        )
        for r in results
    ]


@router.get("/statistics/monthly", response_model=List[dict])
def get_monthly_statistics(
    card_holder: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """월별 통계 조회 (사용자별 분류 가능)"""
    query = db.query(
        models.CardTransaction.year_month,
        models.CardTransaction.card_holder,
        func.sum(models.CardTransaction.amount).label('total_amount'),
        func.count(models.CardTransaction.id).label('transaction_count')
    )
    
    if card_holder:
        query = query.filter(models.CardTransaction.card_holder == card_holder)
    
    results = query.group_by(
        models.CardTransaction.year_month,
        models.CardTransaction.card_holder
    ).order_by(models.CardTransaction.year_month.desc()).all()
    
    return [
        {
            "year_month": r.year_month,
            "card_holder": r.card_holder,
            "total_amount": r.total_amount,
            "transaction_count": r.transaction_count
        }
        for r in results
    ]


@router.get("/statistics/by-category", response_model=List[dict])
def get_category_statistics(
    year_month: Optional[str] = None,
    card_holder: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """카테고리별 통계 조회 (사용자별 분류 가능)"""
    query = db.query(
        models.CardTransaction.category,
        models.CardTransaction.card_holder,
        func.sum(models.CardTransaction.amount).label('total_amount'),
        func.count(models.CardTransaction.id).label('transaction_count')
    )
    
    if year_month:
        query = query.filter(models.CardTransaction.year_month == year_month)
    if card_holder:
        query = query.filter(models.CardTransaction.card_holder == card_holder)
    
    # category가 None인 경우도 포함
    results = query.group_by(
        models.CardTransaction.category,
        models.CardTransaction.card_holder
    ).all()
    
    # 총 금액 계산 (비율 계산용)
    total = sum(abs(r.total_amount) for r in results)
    
    return [
        {
            "category": r.category or "미분류",
            "card_holder": r.card_holder,
            "total_amount": r.total_amount,
            "transaction_count": r.transaction_count,
            "percentage": abs(r.total_amount) / total * 100 if total > 0 else 0
        }
        for r in results
    ]


@router.delete("/{transaction_id}")
def delete_card_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """카드 거래 삭제"""
    transaction = db.query(models.CardTransaction).filter(
        models.CardTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="거래내역을 찾을 수 없습니다.")
    
    db.delete(transaction)
    db.commit()
    return {"message": "삭제 완료"}
