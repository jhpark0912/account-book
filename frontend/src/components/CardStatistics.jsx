import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { cardTransactionAPI } from '../api/cardTransactionService';
import LoadingSkeleton from './common/LoadingSkeleton';
import EmptyState from './common/EmptyState';

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold text-gray-800">{data.name || data.card_holder}</p>
        <p className="text-sm text-gray-600">
          금액: <span className="font-medium">{Math.abs(data.value || data.total_amount).toLocaleString()}원</span>
        </p>
        {data.percentage !== undefined && (
          <p className="text-sm text-gray-600">
            비율: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

function CardStatistics({ refreshTrigger }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  // 통계 데이터
  const [userStats, setUserStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    fetchMetadata();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth, selectedUser, refreshTrigger]);

  const fetchMetadata = async () => {
    try {
      const [users, months] = await Promise.all([
        cardTransactionAPI.getUsers(),
        cardTransactionAPI.getAvailableYearMonths()
      ]);
      setAvailableUsers(users);
      setAvailableMonths(months);
      if (months.length > 0 && !selectedMonth) {
        setSelectedMonth(months[0]);
      }
    } catch (error) {
      console.error('메타데이터 로드 실패:', error);
    }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userStatsData, monthlyStatsData, categoryStatsData] = await Promise.all([
        cardTransactionAPI.getUserStats(selectedMonth),
        cardTransactionAPI.getMonthlyStats(selectedUser),
        cardTransactionAPI.getCategoryStats(selectedMonth, selectedUser)
      ]);

      setUserStats(userStatsData);
      setMonthlyStats(monthlyStatsData);
      setCategoryStats(categoryStatsData);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (!error.response) {
      return '백엔드 서버에 연결할 수 없습니다.';
    }
    return `오류 발생: ${error.message}`;
  };

  // 월별 통계를 라인 차트 형식으로 변환
  const prepareMonthlyChartData = () => {
    const groupedByMonth = {};
    monthlyStats.forEach(stat => {
      if (!groupedByMonth[stat.year_month]) {
        groupedByMonth[stat.year_month] = { month: stat.year_month };
      }
      groupedByMonth[stat.year_month][stat.card_holder] = Math.abs(stat.total_amount);
    });
    return Object.values(groupedByMonth).sort((a, b) => a.month.localeCompare(b.month));
  };

  // 카테고리 × 사용자 매트릭스 준비
  const prepareCategoryMatrix = () => {
    const matrix = {};
    const users = new Set();

    categoryStats.forEach(stat => {
      if (!matrix[stat.category]) {
        matrix[stat.category] = {};
      }
      matrix[stat.category][stat.card_holder] = Math.abs(stat.total_amount);
      users.add(stat.card_holder);
    });

    return { matrix, users: Array.from(users) };
  };

  // 사용자별 파이 차트 데이터
  const userPieData = userStats.map(stat => ({
    name: stat.card_holder,
    value: Math.abs(stat.total_amount),
    percentage: stat.percentage
  }));

  const monthlyChartData = prepareMonthlyChartData();
  const { matrix: categoryMatrix, users: matrixUsers } = prepareCategoryMatrix();

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={1} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-rose-500">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">{error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchStatistics();
            }}
            className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400">
        <EmptyState
          icon="📊"
          message="카드 통계 데이터가 없습니다"
          description="Samsung 카드 파일을 업로드하면 사용자별 통계와 카테고리별 분석을 확인할 수 있습니다."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
        <h2 className="text-xl font-bold mb-4 text-gray-800">📊 통계 필터</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              조회 월
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">전체</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카드 사용자 (카테고리별 필터용)
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">전체</option>
              {availableUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 사용자별 파이 차트 */}
      {userPieData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">👥 사용자별 지출 비율</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {userStats.map((stat, index) => (
                <div
                  key={stat.card_holder}
                  className="p-4 rounded-lg border-l-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: COLORS[index % COLORS.length] }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">{stat.card_holder}</div>
                      <div className="text-sm text-gray-500">{stat.transaction_count}건</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-600">
                        {Math.abs(stat.total_amount).toLocaleString()}원
                      </div>
                      <div className="text-sm text-gray-500">{stat.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 월간 추이 그래프 */}
      {monthlyChartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📈 월간 지출 추이</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {availableUsers.map((user, index) => (
                  <Line
                    key={user}
                    type="monotone"
                    dataKey={user}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 카테고리 × 사용자 매트릭스 테이블 */}
      {Object.keys(categoryMatrix).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🎯 카테고리별 사용자 지출</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    카테고리
                  </th>
                  {matrixUsers.map((user) => (
                    <th
                      key={user}
                      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                    >
                      {user}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    합계
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(categoryMatrix).map(([category, users]) => {
                  const total = Object.values(users).reduce((sum, val) => sum + val, 0);
                  return (
                    <tr key={category} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {category}
                      </td>
                      {matrixUsers.map((user) => (
                        <td
                          key={user}
                          className="px-4 py-3 text-sm text-right text-gray-600"
                        >
                          {users[user] ? users[user].toLocaleString() + '원' : '-'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm text-right font-bold text-purple-600">
                        {total.toLocaleString()}원
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-900">총계</td>
                  {matrixUsers.map((user) => {
                    const userTotal = Object.values(categoryMatrix).reduce(
                      (sum, categories) => sum + (categories[user] || 0),
                      0
                    );
                    return (
                      <td
                        key={user}
                        className="px-4 py-3 text-sm text-right text-purple-700"
                      >
                        {userTotal.toLocaleString()}원
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-sm text-right text-purple-900">
                    {Object.values(categoryMatrix)
                      .flatMap((users) => Object.values(users))
                      .reduce((sum, val) => sum + val, 0)
                      .toLocaleString()}원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardStatistics;
