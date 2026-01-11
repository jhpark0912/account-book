import { useState, useEffect } from 'react';
import { statisticsAPI, transactionAPI } from '../api/accountService';
import { SEMANTIC_COLORS, GRADIENTS, getAmountColor } from '../constants/colors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ refreshTrigger }) => {
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [previousMonthStats, setPreviousMonthStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [totalAssets, setTotalAssets] = useState(null);
  const [previousMonthAssets, setPreviousMonthAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 월과 이전 월 계산
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getPreviousMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month-2 because month is 1-indexed
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
  };

  // 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 먼저 사용 가능한 월 목록 가져오기
        const availableMonths = await statisticsAPI.getAvailableMonths().catch(() => []);
        
        // 현재 월 계산
        let currentMonth = getCurrentMonth();
        let previousMonth = getPreviousMonth(currentMonth);

        // 현재 월에 데이터가 없으면 가장 최근 월 사용
        if (availableMonths.length > 0 && !availableMonths.includes(currentMonth)) {
          currentMonth = availableMonths[availableMonths.length - 1];
          previousMonth = getPreviousMonth(currentMonth);
        }

        // 병렬로 데이터 가져오기
        const [currentStats, prevStats, recentTxns, assets, prevAssets] = await Promise.all([
          statisticsAPI.getMonthlyStats(currentMonth).catch(() => ({
            year_month: currentMonth,
            total_income: 0,
            total_expense: 0,
            net_change: 0,
            start_balance: 0,
            end_balance: 0,
            transaction_count: 0,
          })),
          statisticsAPI.getMonthlyStats(previousMonth).catch(() => ({
            year_month: previousMonth,
            total_income: 0,
            total_expense: 0,
            net_change: 0,
            start_balance: 0,
            end_balance: 0,
            transaction_count: 0,
          })),
          transactionAPI.getTransactions({ limit: 5, offset: 0 }).catch(() => []),
          statisticsAPI.getTotalAssets().catch(() => ({
            total_assets: 0,
            account_count: 0,
            accounts: []
          })),
          statisticsAPI.getTotalAssetsByMonth(previousMonth).catch(() => ({
            year_month: previousMonth,
            total_assets: 0,
            account_count: 0,
            accounts: []
          })),
        ]);

        setCurrentMonthStats(currentStats);
        setPreviousMonthStats(prevStats);
        setRecentTransactions(recentTxns);
        setTotalAssets(assets);
        setPreviousMonthAssets(prevAssets);

        // 최근 6개월 추이 데이터 생성
        if (availableMonths.length > 0) {
          const last6Months = availableMonths.slice(-6);
          const trendData = await Promise.all(
            last6Months.map(async (month) => {
              try {
                const stats = await statisticsAPI.getMonthlyStats(month);
                return {
                  month: month.substring(5), // "2024-01" -> "01"
                  수입: stats.total_income,
                  지출: stats.total_expense,
                  잔액: stats.end_balance,
                };
              } catch {
                return {
                  month: month.substring(5),
                  수입: 0,
                  지출: 0,
                  잔액: 0,
                };
              }
            })
          );
          setMonthlyTrend(trendData);
        }
      } catch (err) {
        console.error('대시보드 데이터 로드 실패:', err);
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger]);

  // 증감률 계산
  const calculateChangeRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // 금액 포맷팅
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Summary Card 컴포넌트
  const SummaryCard = ({ title, value, icon, trend, color, gradientClass }) => {
    const isPositiveTrend = trend >= 0;
    const trendColor = isPositiveTrend ? 'text-emerald-600' : 'text-rose-600';
    const trendIcon = isPositiveTrend ? '↑' : '↓';

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${color}`}>
              {formatAmount(value)}
              <span className="text-base ml-1">원</span>
            </p>
          </div>
          <div className={`w-12 h-12 ${gradientClass} rounded-full flex items-center justify-center text-white text-2xl`}>
            {icon}
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center text-sm">
            <span className={`font-semibold ${trendColor}`}>
              {trendIcon} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-2">지난달 대비</span>
          </div>
        )}
      </div>
    );
  };

  // 증감 계산
  const netChangeRate = calculateChangeRate(
    currentMonthStats?.net_change || 0,
    previousMonthStats?.net_change || 0
  );

  const incomeChangeRate = calculateChangeRate(
    currentMonthStats?.total_income || 0,
    previousMonthStats?.total_income || 0
  );

  const expenseChangeRate = calculateChangeRate(
    currentMonthStats?.total_expense || 0,
    previousMonthStats?.total_expense || 0
  );

  const totalAssetsChangeRate = calculateChangeRate(
    totalAssets?.total_assets || 0,
    previousMonthAssets?.total_assets || 0
  );

  return (
    <div className="space-y-6">
      {/* 요약 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="총 자산"
          value={totalAssets?.total_assets || 0}
          icon="💰"
          trend={totalAssetsChangeRate}
          color={getAmountColor(totalAssets?.total_assets || 0)}
          gradientClass={GRADIENTS.primary}
        />
        <SummaryCard
          title="이번 달 수입"
          value={currentMonthStats?.total_income || 0}
          icon="📈"
          trend={incomeChangeRate}
          color={SEMANTIC_COLORS.income.text}
          gradientClass={GRADIENTS.success}
        />
        <SummaryCard
          title="이번 달 지출"
          value={currentMonthStats?.total_expense || 0}
          icon="📉"
          trend={expenseChangeRate}
          color={SEMANTIC_COLORS.expense.text}
          gradientClass={GRADIENTS.danger}
        />
        <SummaryCard
          title="순 변화"
          value={currentMonthStats?.net_change || 0}
          icon="💸"
          color={getAmountColor(currentMonthStats?.net_change || 0)}
          gradientClass={GRADIENTS.info}
        />
      </div>

      {/* 최근 거래 & 월별 추이 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 거래 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📝</span>
            최근 거래
          </h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>최근 거래 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id || index}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.transaction_date} · {transaction.category || '미분류'}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${getAmountColor(transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {formatAmount(transaction.amount)}원
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 월별 추이 차트 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            월별 추이 (최근 6개월)
          </h3>
          {monthlyTrend.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>월별 추이 데이터가 없습니다.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                />
                <Tooltip
                  formatter={(value) => `${formatAmount(value)}원`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="수입"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="지출"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: '#f43f5e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
