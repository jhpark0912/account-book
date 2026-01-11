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


@router.get("/total-assets")
def get_total_assets(account_type: str = None, db: Session = Depends(get_db)):
    """전체 총자산 계산 - 각 계좌별 최신 잔액의 합"""
    # 각 계좌번호별로 가장 최근 거래를 찾기
    # account_number로 그룹화하고 각 그룹의 최신 거래를 가져옴

    # 1. 모든 고유 계좌번호 조회
    query = db.query(models.Transaction.account_number).distinct()
    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)

    account_numbers = [r.account_number for r in query.all() if r.account_number]

    if not account_numbers:
        return {
            "total_assets": 0,
            "account_count": 0,
            "accounts": []
        }

    # 2. 각 계좌별 최신 거래의 잔액 조회
    accounts_info = []
    total_assets = 0

    for account_number in account_numbers:
        # 해당 계좌의 가장 최근 거래 조회
        latest_transaction = db.query(models.Transaction).filter(
            models.Transaction.account_number == account_number
        )

        if account_type:
            latest_transaction = latest_transaction.filter(
                models.Transaction.account_type == account_type
            )

        latest_transaction = latest_transaction.order_by(
            models.Transaction.transaction_date.desc()
        ).first()

        if latest_transaction:
            balance = latest_transaction.balance
            total_assets += balance
            accounts_info.append({
                "account_number": account_number,
                "account_type": latest_transaction.account_type,
                "latest_balance": balance,
                "last_transaction_date": latest_transaction.transaction_date,
                "institution": latest_transaction.institution
            })

    return {
        "total_assets": total_assets,
        "account_count": len(accounts_info),
        "accounts": accounts_info
    }


@router.get("/total-assets/{year_month}")
def get_total_assets_by_month(year_month: str, account_type: str = None, db: Session = Depends(get_db)):
    """특정 월의 총자산 계산 - 해당 월의 각 계좌별 마지막 잔액의 합"""
    # 1. 해당 월에 거래가 있는 모든 고유 계좌번호 조회
    query = db.query(models.Transaction.account_number).filter(
        models.Transaction.year_month == year_month
    ).distinct()

    if account_type:
        query = query.filter(models.Transaction.account_type == account_type)

    account_numbers = [r.account_number for r in query.all() if r.account_number]

    if not account_numbers:
        return {
            "year_month": year_month,
            "total_assets": 0,
            "account_count": 0,
            "accounts": []
        }

    # 2. 각 계좌별 해당 월의 마지막 거래 잔액 조회
    accounts_info = []
    total_assets = 0

    for account_number in account_numbers:
        # 해당 계좌의 해당 월 마지막 거래 조회
        latest_transaction = db.query(models.Transaction).filter(
            models.Transaction.account_number == account_number,
            models.Transaction.year_month == year_month
        )

        if account_type:
            latest_transaction = latest_transaction.filter(
                models.Transaction.account_type == account_type
            )

        latest_transaction = latest_transaction.order_by(
            models.Transaction.transaction_date.desc()
        ).first()

        if latest_transaction:
            balance = latest_transaction.balance
            total_assets += balance
            accounts_info.append({
                "account_number": account_number,
                "account_type": latest_transaction.account_type,
                "latest_balance": balance,
                "last_transaction_date": latest_transaction.transaction_date,
                "institution": latest_transaction.institution
            })

    return {
        "year_month": year_month,
        "total_assets": total_assets,
        "account_count": len(accounts_info),
        "accounts": accounts_info
    }
