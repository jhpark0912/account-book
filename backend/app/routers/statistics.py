from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter()


@router.get("/monthly/{year_month}", response_model=schemas.MonthlyStatistics)
def get_monthly_statistics(year_month: str, account_type: str = None, db: Session = Depends(get_db)):
    """월별 통계"""
    query = db.query(models.Transaction).filter(
        models.Transaction.year_month == year_month
    )
    
    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)
    
    transactions = query.order_by(models.Transaction.transaction_date).all()

    if not transactions:
        return schemas.MonthlyStatistics(
            year_month=year_month,
            total_income=0,
            total_expense=0,
            net_change=0,
            start_balance=0,
            end_balance=0,
            transaction_count=0
        )

    # 수입/지출 계산
    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expense = sum(abs(t.amount) for t in transactions if t.amount < 0)

    # 시작 잔액과 종료 잔액
    # 첫 번째 거래의 잔액에서 거래금액을 빼면 시작 잔액
    first_transaction = transactions[0]
    start_balance = first_transaction.balance - first_transaction.amount
    end_balance = transactions[-1].balance

    return schemas.MonthlyStatistics(
        year_month=year_month,
        total_income=total_income,
        total_expense=total_expense,
        net_change=end_balance - start_balance,
        start_balance=start_balance,
        end_balance=end_balance,
        transaction_count=len(transactions)
    )


@router.get("/category/{year_month}", response_model=List[schemas.CategoryStatistics])
def get_category_statistics(year_month: str, account_type: str = None, db: Session = Depends(get_db)):
    """카테고리별 통계 (지출만)"""
    # 카테고리별 지출 합계
    query = db.query(
        models.Transaction.category,
        func.sum(models.Transaction.amount).label("total_amount"),
        func.count(models.Transaction.id).label("transaction_count")
    ).filter(
        models.Transaction.year_month == year_month,
        models.Transaction.amount < 0  # 지출만
    )
    
    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)
    
    results = query.group_by(
        models.Transaction.category
    ).all()

    # 전체 지출 금액
    total_expense = sum(abs(r.total_amount) for r in results)

    # 결과 변환
    statistics = []
    for result in results:
        amount = abs(result.total_amount)
        percentage = (amount / total_expense * 100) if total_expense > 0 else 0

        statistics.append(schemas.CategoryStatistics(
            category=result.category or "미분류",
            total_amount=amount,
            transaction_count=result.transaction_count,
            percentage=round(percentage, 2)
        ))

    # 금액 기준 내림차순 정렬
    statistics.sort(key=lambda x: x.total_amount, reverse=True)

    return statistics


@router.get("/months")
def get_available_months(account_type: str = None, db: Session = Depends(get_db)):
    """조회 가능한 년월 목록"""
    query = db.query(models.Transaction.year_month).distinct()
    
    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)
    
    results = query.all()
    months = sorted([r.year_month for r in results], reverse=True)
    return {"months": months}
