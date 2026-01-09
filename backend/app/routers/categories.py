from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..enums import TransactionCategory

router = APIRouter()


import logging

logger = logging.getLogger(__name__)


def apply_mapping_to_existing_transactions(
    db: Session,
    keyword: str,
    category: str
) -> int:
    """
    새로운 카테고리 매핑을 기존 거래에 적용
    
    Args:
        db: 데이터베이스 세션
        keyword: 검색할 키워드
        category: 적용할 카테고리
        
    Returns:
        업데이트된 거래 수
    """
    logger.info(f"Starting auto-categorization: keyword='{keyword}', category='{category}'")
    
    # 먼저 키워드를 포함하는 모든 거래 찾기
    all_matching = db.query(models.Transaction).filter(
        models.Transaction.description.ilike(f"%{keyword}%")
    ).all()
    logger.info(f"Found {len(all_matching)} transactions matching keyword '{keyword}'")
    
    # category가 NULL이거나 "미분류"인 거래만 필터링
    transactions = [t for t in all_matching 
                    if t.category is None or t.category == TransactionCategory.UNCATEGORIZED.value]
    
    null_count = len([t for t in all_matching if t.category is None])
    uncategorized_count = len([t for t in all_matching if t.category == TransactionCategory.UNCATEGORIZED.value])
    logger.info(f"Of these, {null_count} have NULL category and {uncategorized_count} have '미분류' category")
    logger.info(f"Total {len(transactions)} transactions will be updated")
    
    # 카테고리 업데이트
    updated_count = 0
    for transaction in transactions:
        logger.debug(f"Updating transaction {transaction.id}: '{transaction.description}' (old: {transaction.category}) -> category='{category}'")
        transaction.category = category
        updated_count += 1
    
    if updated_count > 0:
        db.commit()
        logger.info(f"Applied mapping '{keyword}' -> '{category}': {updated_count} transactions updated")
    else:
        logger.info(f"No transactions updated for mapping '{keyword}' -> '{category}'")
    
    return updated_count


@router.get("/", response_model=List[schemas.CategoryMapping])
def get_category_mappings(db: Session = Depends(get_db)):
    """카테고리 매핑 전체 조회"""
    return db.query(models.CategoryMapping).all()


@router.post("/", response_model=schemas.CategoryMappingResponse)
def create_category_mapping(
    mapping: schemas.CategoryMappingCreate,
    db: Session = Depends(get_db)
):
    """카테고리 매핑 생성 및 기존 거래 자동 분류"""
    # 중복 체크
    existing = db.query(models.CategoryMapping).filter(
        models.CategoryMapping.keyword == mapping.keyword
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="이미 등록된 키워드입니다.")

    # 매핑 생성
    db_mapping = models.CategoryMapping(**mapping.dict())
    db.add(db_mapping)
    db.commit()
    db.refresh(db_mapping)
    
    # 기존 거래에 매핑 적용
    updated_count = apply_mapping_to_existing_transactions(
        db=db,
        keyword=mapping.keyword,
        category=mapping.category
    )
    
    # 응답 생성
    response = schemas.CategoryMappingResponse(
        id=db_mapping.id,
        keyword=db_mapping.keyword,
        category=db_mapping.category,
        updated_transactions_count=updated_count
    )
    
    return response


@router.put("/{mapping_id}", response_model=schemas.CategoryMapping)
def update_category_mapping(
    mapping_id: int,
    category: str,
    db: Session = Depends(get_db)
):
    """카테고리 매핑 수정"""
    mapping = db.query(models.CategoryMapping).filter(models.CategoryMapping.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="매핑을 찾을 수 없습니다.")

    mapping.category = category
    db.commit()
    db.refresh(mapping)
    return mapping


@router.delete("/{mapping_id}")
def delete_category_mapping(mapping_id: int, db: Session = Depends(get_db)):
    """카테고리 매핑 삭제"""
    mapping = db.query(models.CategoryMapping).filter(models.CategoryMapping.id == mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="매핑을 찾을 수 없습니다.")

    db.delete(mapping)
    db.commit()
    return {"message": "삭제 완료"}


@router.get("/list")
def get_category_list():
    """사용 가능한 카테고리 목록"""
    return {
        "categories": [
            "식비",
            "교통비",
            "주거생활비",
            "미용비",
            "건강관리비",
            "사회생활비",
            "문화생활비",
            "뚜이"
        ]
    }
