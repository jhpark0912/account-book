import pandas as pd

# 엑셀 파일 분석
xls = pd.ExcelFile('samsungcard_20260113.xlsx')
print('Sheet names:', xls.sheet_names)

# 첫 번째 시트 분석
df = pd.read_excel('samsungcard_20260113.xlsx', sheet_name=0, header=None)
print(f'\nTotal rows: {len(df)}')
print('\nFirst 10 rows (첫 5개 컬럼만):')
for i in range(min(10, len(df))):
    row_data = df.iloc[i].tolist()[:5]
    print(f'Row {i}: {row_data}')

# skiprows=2로 읽기
print('\n--- skiprows=2로 읽기 ---')
df2 = pd.read_excel('samsungcard_20260113.xlsx', sheet_name=0, skiprows=2, header=0)
print('Columns:', df2.columns.tolist()[:10])
print('\nFirst 3 data rows:')
for i in range(min(3, len(df2))):
    print(f'\nRow {i}:')
    for col in df2.columns[:10]:
        print(f'  {col}: {df2.iloc[i][col]}')
