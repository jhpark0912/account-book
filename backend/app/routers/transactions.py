from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import os
from datetime import datetime
import logging

from .. import models, schemas
from ..database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


def parse_toss_excel(file_path: str) -> List[dict]:
    """토스뱅크 Excel 파일 파싱"""
    df = pd.read_excel(file_path)

    # 실제 거래내역이 시작되는 행 찾기 (컬럼명이 '거래 일시'인 행)
    header_row = None
    for idx, row in df.iterrows():
        if '거래 일시' in str(row.values):
            header_row = idx
            break

    if header_row is None:
        raise ValueError("거래 일시 컬럼을 찾을 수 없습니다.")

    # 헤더 설정 및 데이터 추출
    df = pd.read_excel(file_path, skiprows=header_row)
    df.columns = df.iloc[0]
    df = df[1:]  # 헤더 행 제거

    # NaN 제거 및 데이터 정제
    df = df.dropna(subset=['거래 일시', '적요', '거래 금액'])

    transactions = []
    for _, row in df.iterrows():
        try:
            # 날짜 파싱
            transaction_date = str(row['거래 일시'])
            year_month = transaction_date[:7].replace('.', '-')  # "2025.12" -> "2025-12"

            transactions.append({
                "transaction_date": transaction_date,
                "description": str(row['적요']),
                "transaction_type": str(row['거래 유형']),
                "institution": str(row.get('거래 기관', '')) if pd.notna(row.get('거래 기관')) else None,
                "account_number": str(row.get('계좌번호', '')) if pd.notna(row.get('계좌번호')) else None,
                "amount": float(row['거래 금액']),
                "balance": float(row['거래 후 잔액']),
                "memo": str(row.get('메모', '')) if pd.notna(row.get('메모')) else None,
                "year_month": year_month
            })
        except Exception as e:
            logger.error(f"Error parsing row: {e}", exc_info=True)
            continue

    return transactions


def auto_categorize(description: str, memo: str, db: Session) -> str:
    """거래처명과 메모를 기반으로 카테고리 자동 분류"""
    # 1. 메모에 카테고리가 명시되어 있는지 확인
    categories = ["식비", "교통비", "주거생활비", "미용비", "건강관리비", "사회생활비", "문화생활비", "뚜이"]

    if memo:
        for category in categories:
            if category in memo:
                return category

    # 2. 데이터베이스의 매핑 테이블에서 검색
    mappings = db.query(models.CategoryMapping).all()
    for mapping in mappings:
        if mapping.keyword in description:
            return mapping.category

    # 3. 기본 카테고리 반환
    return "미분류"


@router.post("/upload", response_model=schemas.UploadResponse)
async def upload_excel(
    file: UploadFile = File(...),
    account_type: str = "생활비",
    db: Session = Depends(get_db)
):
    """Excel 파일 업로드 및 파싱"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Excel 파일만 업로드 가능합니다.")

    # 파일 저장
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    try:
        # Excel 파싱
        transactions_data = parse_toss_excel(file_path)

        new_records = 0
        duplicate_records = 0

        for trans_data in transactions_data:
            # 중복 체크 (같은 날짜, 금액, 거래처)
            existing = db.query(models.Transaction).filter(
                models.Transaction.transaction_date == trans_data["transaction_date"],
                models.Transaction.amount == trans_data["amount"],
                models.Transaction.description == trans_data["description"]
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
            trans_data["account_type"] = account_type

            # DB에 저장
            db_transaction = models.Transaction(**trans_data)
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
        raise HTTPException(status_code=500, detail=f"파일 처리 중 오류 발생: {str(e)}")


@router.get("/", response_model=List[schemas.Transaction])
def get_transactions(
    year_month: str = None,
    category: str = None,
    account_type: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """거래내역 조회"""
    query = db.query(models.Transaction)

    if year_month:
        query = query.filter(models.Transaction.year_month == year_month)

    if category:
        query = query.filter(models.Transaction.category == category)

    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)

    # 최신순 정렬
    query = query.order_by(models.Transaction.transaction_date.desc())

    return query.offset(skip).limit(limit).all()


@router.get("/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """특정 거래내역 조회"""
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="거래내역을 찾을 수 없습니다.")
    return transaction


@router.put("/{transaction_id}", response_model=schemas.Transaction)
def update_transaction_category(
    transaction_id: int,
    category: str,
    db: Session = Depends(get_db)
):
    """거래내역 카테고리 수정"""
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="거래내역을 찾을 수 없습니다.")

    transaction.category = category
    db.commit()
    db.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """거래내역 삭제"""
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="거래내역을 찾을 수 없습니다.")

    db.delete(transaction)
    db.commit()
    return {"message": "삭제 완료"}
