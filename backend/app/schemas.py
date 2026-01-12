from pydantic import BaseModel
from typing import Optional

from .enums import AccountType


class TransactionBase(BaseModel):
    transaction_date: str
    description: str
    transaction_type: str
    institution: Optional[str] = None
    account_number: Optional[str] = None
    amount: float
    balance: float
    memo: Optional[str] = None
    category: Optional[str] = None
    year_month: str
    account_type: AccountType = AccountType.LIVING


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int

    class Config:
        from_attributes = True



class CardTransactionBase(BaseModel):
    """카드 거래내역 기본 스키마"""
    card_holder: str
    transaction_date: str
    description: str
    amount: float
    category: Optional[str] = None
    memo: Optional[str] = None
    year_month: str
    raw_date: str


class CardTransactionCreate(CardTransactionBase):
    """카드 거래내역 생성 스키마"""
    pass


class CardTransaction(CardTransactionBase):
    """카드 거래내역 전체 스키마"""
    id: int

    class Config:
        from_attributes = True


class CategoryMappingBase(BaseModel):
    keyword: str
    category: str


class CategoryMappingCreate(CategoryMappingBase):
    pass


class CategoryMapping(CategoryMappingBase):
    id: int

    class Config:
        from_attributes = True


class CategoryMappingResponse(CategoryMapping):
    """카테고리 매핑 생성 응답 (업데이트된 거래 수 포함)"""
    updated_transactions_count: int = 0


class UploadResponse(BaseModel):
    message: str
    total_records: int
    new_records: int
    duplicate_records: int


class MonthlyStatistics(BaseModel):
    year_month: str
    total_income: float
    total_expense: float
    net_change: float
    start_balance: float
    end_balance: float
    transaction_count: int


class CategoryStatistics(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float



class UserStatistics(BaseModel):
    """사용자별 통계 스키마"""
    card_holder: str
    total_amount: float
    transaction_count: int
    percentage: float
