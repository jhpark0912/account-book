"""
계좌 유형 데이터 마이그레이션 스크립트

기존에 'LIVING', 'RESERVOIR'로 저장된 account_type 값을
'생활비 계좌', '저수지 계좌'로 변환합니다.
"""

import sys
import os
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import SQLALCHEMY_DATABASE_URL
from app.models import Transaction
from app.enums import AccountType

def migrate_account_types():
    """account_type 컬럼의 값을 Enum 이름에서 Enum 값으로 변환"""

    # 데이터베이스 연결
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 현재 데이터 확인
        print("=== 마이그레이션 전 데이터 확인 ===")
        result = db.execute(text("SELECT DISTINCT account_type FROM transactions"))
        current_types = [row[0] for row in result]
        print(f"현재 account_type 값들: {current_types}")

        # 각 Enum 이름을 Enum 값으로 변환
        mapping = {
            "LIVING": AccountType.LIVING.value,      # "LIVING" -> "생활비 계좌"
            "RESERVOIR": AccountType.RESERVOIR.value  # "RESERVOIR" -> "저수지 계좌"
        }

        updated_count = 0
        for old_value, new_value in mapping.items():
            # 해당 값이 존재하는지 확인
            count_result = db.execute(
                text("SELECT COUNT(*) FROM transactions WHERE account_type = :old_value"),
                {"old_value": old_value}
            )
            count = count_result.scalar()

            if count > 0:
                print(f"\n'{old_value}' -> '{new_value}' 변환 중... (총 {count}건)")

                # 업데이트 실행
                db.execute(
                    text("UPDATE transactions SET account_type = :new_value WHERE account_type = :old_value"),
                    {"old_value": old_value, "new_value": new_value}
                )
                updated_count += count
                print(f"✓ 완료")

        # 변경사항 커밋
        db.commit()

        # 마이그레이션 후 데이터 확인
        print("\n=== 마이그레이션 후 데이터 확인 ===")
        result = db.execute(text("SELECT DISTINCT account_type FROM transactions"))
        new_types = [row[0] for row in result]
        print(f"변환된 account_type 값들: {new_types}")

        print(f"\n총 {updated_count}건의 레코드가 업데이트되었습니다.")

    except Exception as e:
        print(f"오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("계좌 유형 데이터 마이그레이션을 시작합니다...\n")
    migrate_account_types()
    print("\n마이그레이션이 완료되었습니다!")
