from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base


class Transaction(Base):
    """거래내역 테이블"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(String, nullable=False)  # 거래 일시
    description = Column(String, nullable=False)  # 적요 (거래처명)
    transaction_type = Column(String, nullable=False)  # 거래 유형
    institution = Column(String, nullable=True)  # 거래 기관
    account_number = Column(String, nullable=True)  # 계좌번호
    amount = Column(Float, nullable=False)  # 거래 금액 (음수: 지출, 양수: 수입)
    balance = Column(Float, nullable=False)  # 거래 후 잔액
    memo = Column(String, nullable=True)  # 메모
    category = Column(String, nullable=True)  # 카테고리 (자동 분류 또는 수동 지정)
    year_month = Column(String, nullable=False)  # 년월 (YYYY-MM) - 조회용
    account_type = Column(String, nullable=False, default="생활비")  # 계좌 유형 (생활비, 전체관리통장)


class CategoryMapping(Base):
    """거래처별 카테고리 매핑 테이블"""
    __tablename__ = "category_mappings"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, unique=True, nullable=False)  # 거래처명 키워드
    category = Column(String, nullable=False)  # 카테고리



class CardTransaction(Base):
    """카드 거래내역 테이블 (Samsung Card 등)"""
    __tablename__ = "card_transactions"

    id = Column(Integer, primary_key=True, index=True)
    card_holder = Column(String, nullable=False, index=True)  # 카드 사용자 (업로드 시 지정)
    payment_type = Column(String, nullable=False, index=True)  # 결제 유형 (일시불, 할부)
    transaction_date = Column(String, nullable=False, index=True)  # 거래 일시 (YYYY.MM.DD)
    description = Column(String, nullable=False)  # 가맹점명
    amount = Column(Float, nullable=False)  # 거래 금액 (음수: 지출)
    category = Column(String, nullable=True)  # 카테고리 (자동 분류 또는 수동 지정)
    memo = Column(String, nullable=True)  # 메모
    year_month = Column(String, nullable=False, index=True)  # 년월 (YYYY-MM) - 조회용
    raw_date = Column(String, nullable=False)  # 원본 날짜 (YYYYMMDD)
