import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { statisticsAPI } from '../api/accountService';
import { ACCOUNT_TYPES } from '../constants/accountTypes';
import { SEMANTIC_COLORS } from '../constants/colors';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold text-gray-800">{data.category}</p>
        <p className="text-sm text-gray-600">
          금액: <span className="font-medium">{data.total_amount.toLocaleString()}원</span>
        </p>
        <p className="text-sm text-gray-600">
          비율: <span className="font-medium">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

function Statistics({ refreshTrigger }) {
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES.LIVING);

  useEffect(() => {
    fetchAvailableMonths();
  }, [refreshTrigger, accountType]);

  useEffect(() => {
    if (selectedMonth) {
      fetchStatistics();
    }
  }, [selectedMonth, accountType]);

  const fetchAvailableMonths = async () => {
    try {
      setError(null);
      const result = await statisticsAPI.getAvailableMonths(accountType);
      if (result.months && result.months.length > 0) {
        setAvailableMonths(result.months);
        setSelectedMonth(result.months[0]); // 최신 월 선택
      }
    } catch (error) {
      console.error('월 목록 불러오기 실패:', error);
      setError(getErrorMessage(error));
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [monthly, category] = await Promise.all([
        statisticsAPI.getMonthlyStats(selectedMonth, accountType),
        statisticsAPI.getCategoryStats(selectedMonth, accountType),
      ]);
      setMonthlyStats(monthly);
      setCategoryStats(category);
    } catch (error) {
      console.error('통계 불러오기 실패:', error);
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
                  fetchAvailableMonths();
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
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (availableMonths.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-gray-400">
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg font-semibold mb-2">📊 데이터가 없습니다</p>
          <p className="text-sm">Excel 파일을 업로드해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 계좌 유형 및 월 선택 */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              계좌 유형
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              {Object.values(ACCOUNT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              조회 월 선택
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 월별 통계 */}
      {monthlyStats && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📈 {selectedMonth} 월별 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200 transform hover:scale-105 cursor-default">
              <div className="text-sm text-gray-600 font-medium">💰 시작 잔액</div>
              <div className="text-xl font-bold text-blue-600">
                {monthlyStats.start_balance.toLocaleString()}원
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors duration-200 transform hover:scale-105 cursor-default">
              <div className="text-sm text-gray-600 font-medium">📥 총 수입</div>
              <div className="text-xl font-bold text-green-600">
                +{monthlyStats.total_income.toLocaleString()}원
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors duration-200 transform hover:scale-105 cursor-default">
              <div className="text-sm text-gray-600 font-medium">📤 총 지출</div>
              <div className="text-xl font-bold text-red-600">
                -{monthlyStats.total_expense.toLocaleString()}원
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors duration-200 transform hover:scale-105 cursor-default">
              <div className="text-sm text-gray-600 font-medium">💵 종료 잔액</div>
              <div className="text-xl font-bold text-purple-600">
                {monthlyStats.end_balance.toLocaleString()}원
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105 cursor-default">
            <div className="text-sm text-gray-600 font-medium">📊 순 증감</div>
            <div className={`text-2xl font-bold ${
              monthlyStats.net_change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {monthlyStats.net_change >= 0 ? '+' : ''}
              {monthlyStats.net_change.toLocaleString()}원
            </div>
          </div>
        </div>
      )}

      {/* 카테고리별 통계 */}
      {categoryStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🎯 카테고리별 지출</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_amount"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 테이블 */}
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      카테고리
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      금액
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      비율
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryStats.map((stat, index) => (
                    <tr key={stat.category} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-4 py-2 text-sm">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></span>
                        {stat.category}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium">
                        {stat.total_amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        {stat.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;
