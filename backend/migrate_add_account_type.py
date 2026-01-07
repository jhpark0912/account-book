"""
데이터베이스 마이그레이션: account_type 컬럼 추가

이 스크립트는 기존 transactions 테이블에 account_type 컬럼을 추가합니다.
"""

import sqlite3
import os

# 데이터베이스 경로
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "data", "account_book.db")

def migrate():
    """account_type 컬럼 추가 마이그레이션"""
    
    # 데이터베이스 파일이 존재하는지 확인
    if not os.path.exists(DATABASE_PATH):
        print(f"❌ 데이터베이스 파일을 찾을 수 없습니다: {DATABASE_PATH}")
        return
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # 1. 기존 컬럼 확인
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"현재 transactions 테이블의 컬럼: {columns}")
        
        # 2. account_type 컬럼이 이미 있는지 확인
        if 'account_type' in columns:
            print("✅ account_type 컬럼이 이미 존재합니다.")
            return
        
        # 3. account_type 컬럼 추가
        print("account_type 컬럼 추가 중...")
        cursor.execute("""
            ALTER TABLE transactions 
            ADD COLUMN account_type TEXT NOT NULL DEFAULT '생활비'
        """)
        
        conn.commit()
        print("✅ account_type 컬럼이 성공적으로 추가되었습니다!")
        
        # 4. 결과 확인
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"업데이트된 컬럼 목록: {columns}")
        
    except sqlite3.Error as e:
        print(f"❌ 마이그레이션 실패: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("데이터베이스 마이그레이션 시작")
    print("=" * 60)
    migrate()
    print("=" * 60)
    print("마이그레이션 완료")
    print("=" * 60)
