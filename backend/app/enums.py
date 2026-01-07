from enum import Enum


class AccountType(str, Enum):
    RESERVOIR = "저수지 계좌"
    LIVING = "생활비 계좌"


class TransactionCategory(str, Enum):
    FOOD = "식비"
    TRANSPORTATION = "교통비"
    HOUSING = "주거생활비"
    BEAUTY = "미용비"
    HEALTH = "건강관리비"
    SOCIAL = "사회생활비"
    CULTURE = "문화생활비"
    DDUI = "뚜이"  # Special category, as requested
    UNCATEGORIZED = "미분류"
