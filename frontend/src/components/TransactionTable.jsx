import { useState, useEffect } from 'react';
import { transactionAPI, categoryAPI } from '../api/accountService';
import { ACCOUNT_TYPES } from '../constants/accountTypes';
import { TRANSACTION_CATEGORIES } from '../constants/transactionCategories';
import { getAmountColor, SEMANTIC_COLORS } from '../constants/colors';
import LoadingSkeleton from './common/LoadingSkeleton';
import EmptyState from './common/EmptyState';

function TransactionTable({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES.LIVING);
  const [yearMonth, setYearMonth] = useState(''); // 전체 조회
  const [availableYearMonths, setAvailableYearMonths] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어

  useEffect(() => {
    fetchCategories();
    fetchAvailableYearMonths();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger, accountType, yearMonth]);

  const fetchCategories = async () => {
    try {
      setError(null);
      const result = await categoryAPI.getCategoryList();
      setCategories(result.categories || []);
    } catch (error) {
      console.error('카테고리 목록 불러오기 실패:', error);
      setError(getErrorMessage(error));
    }
  };

  const fetchAvailableYearMonths = async () => {
    try {
      const result = await transactionAPI.getAvailableYearMonths();
      setAvailableYearMonths(result);
    } catch (error) {
      console.error('년-월 목록 불러오기 실패:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { 
        limit: 200,
        account_type: accountType 
      };
      
      // yearMonth가 선택된 경우에만 파라미터 추가
      if (yearMonth) {
        params.year_month = yearMonth;
      }
      
      const data = await transactionAPI.getTransactions(params);
      setTransactions(data);
    } catch (error) {
      console.error('거래내역 불러오기 실패:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (!error.response) {
      return '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (http://localhost:8000)';
    }
    if (error.response.status === 404) {
      return '요청한 데이터를 찾을 수 없습니다.';
    }
    if (error.response.status === 500) {
      return `서버 오류: ${error.response.data?.detail || '알 수 없는 오류'}`;
    }
    return `오류 발생: ${error.message}`;
  };

  const handleCategoryUpdate = async (id) => {
    try {
      await transactionAPI.updateCategory(id, newCategory);
      setEditingId(null);
      fetchTransactions();
    } catch (error) {
      console.error('카테고리 수정 실패:', error);
    }
  };

  const formatAmount = (amount) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString()}원`;
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-rose-500">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">네트워크 오류</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <button
                onClick={() => {
                  setError(null);
                  fetchTransactions();
                  fetchCategories();
                }}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 거래내역</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거래일시</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">적요</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">거래유형</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <LoadingSkeleton type="table-row" count={10} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 검색 필터링
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const description = (transaction.description || '').toLowerCase();
    const institution = (transaction.institution || '').toLowerCase();
    return description.includes(search) || institution.includes(search);
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 거래내역</h2>
      
      {/* 필터 영역 */}
      <div className="mb-4 flex gap-4">
        {/* 계좌 유형 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계좌 유형
          </label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(ACCOUNT_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 년-월 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            조회 기간
          </label>
          <select
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체</option>
            {availableYearMonths.map((ym) => (
              <option key={ym} value={ym}>
                {ym}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="적요 또는 거래기관으로 검색..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">거래처</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">잔액</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <tr key={transaction.id} className={`transition-colors duration-150 ${
                index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 hover:bg-blue-50'
              }`}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.transaction_date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {transaction.transaction_type}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-semibold ${getAmountColor(transaction.amount)}`}>
                  {formatAmount(transaction.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {transaction.balance.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-sm">
                  {editingId === transaction.id ? (
                    <div className="flex gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="">선택</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleCategoryUpdate(transaction.id)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs bg-gray-300 px-2 py-1 rounded"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        setEditingId(transaction.id);
                        setNewCategory(transaction.category || '');
                      }}
                      className="cursor-pointer hover:underline"
                    >
                      {transaction.category || TRANSACTION_CATEGORIES.UNCATEGORIZED}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {transaction.memo || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 빈 데이터 또는 검색 결과 없음 */}
        {transactions.length === 0 ? (
          <EmptyState
            icon="📝"
            message="거래내역이 없습니다"
            description="Excel 파일을 업로드하면 거래 내역을 확인하고 관리할 수 있습니다."
          />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon="🔍"
            message="검색 결과가 없습니다"
            description={`"${searchTerm}"에 해당하는 거래내역을 찾을 수 없습니다. 다른 검색어를 입력해보세요.`}
          />
        ) : null}
      </div>

      {/* 검색 결과 개수 표시 */}
      {transactions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {searchTerm ? (
            <span>
              총 {transactions.length}건 중 <span className="font-semibold text-blue-600">{filteredTransactions.length}건</span> 검색됨
            </span>
          ) : (
            <span>총 {transactions.length}건</span>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionTable;
