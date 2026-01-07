from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.get("/", response_model=List[schemas.CategoryMapping])
def get_category_mappings(db: Session = Depends(get_db)):
    """카테고리 매핑 전체 조회"""
    return db.query(models.CategoryMapping).all()


@router.post("/", response_model=schemas.CategoryMapping)
def create_category_mapping(
    mapping: schemas.CategoryMappingCreate,
    db: Session = Depends(get_db)
):
    """카테고리 매핑 생성"""
    # 중복 체크
    existing = db.query(models.CategoryMapping).filter(
        models.CategoryMapping.keyword == mapping.keyword
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="이미 등록된 키워드입니다.")

    db_mapping = models.CategoryMapping(**mapping.dict())
    db.add(db_mapping)
    db.commit()
    db.refresh(db_mapping)
    return db_mapping


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
