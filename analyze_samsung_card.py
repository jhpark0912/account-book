import pandas as pd
import sys
import json

# Read the Samsung card Excel file - first check raw data
df_raw = pd.read_excel('samsungcard_20260113.xlsx', sheet_name=0)
print('=== RAW DATA (first 5 rows) ===')
print(df_raw.head(5))
print('\n')

# Now read with proper header
df = pd.read_excel('samsungcard_20260113.xlsx', sheet_name=0, skiprows=1)

print('Shape:', df.shape)
print('\nColumn names (ASCII representation):')
for i, col in enumerate(df.columns):
    # Convert to ASCII to see pattern
    try:
        ascii_rep = col.encode('utf-8').decode('utf-8')
        print(f'{i}: {ascii_rep}')
    except:
        print(f'{i}: {repr(col)}')

print('\n=== DATA SAMPLE (first 10 rows) ===')
pd.set_option('display.max_columns', None)
pd.set_option('display.width', 200)
print(df.head(10).to_csv(sep='|', index=False))

# Check unique values in what appears to be user column
print('\n=== UNIQUE VALUES IN COLUMN 1 ===')
col1_unique = df.iloc[:, 1].dropna().unique()
for val in col1_unique[:10]:
    print(repr(val))

# Check if there are multiple card users
print('\n=== CHECKING FOR MULTIPLE USERS ===')
print(f'Total unique values in column 1: {len(col1_unique)}')
print(f'Total transactions: {len(df)}')
