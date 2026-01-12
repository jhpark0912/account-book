import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import ExcelUpload from './components/ExcelUpload';
import TransactionTable from './components/TransactionTable';
import Statistics from './components/Statistics';
import CategoryMappingManagement from './components/CategoryMappingManagement';
import { GRADIENTS } from './constants/colors';
import { HiHome, HiUpload, HiViewList, HiChartBar, HiCog } from 'react-icons/hi';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* 헤더 */}
      <header className={`${GRADIENTS.ocean} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            💰 가계부
          </h1>
          <p className="text-blue-100 text-sm mt-1">스마트한 자산 관리의 시작</p>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
              }`}
            >
              <HiHome className="w-5 h-5" />
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
              }`}
            >
              <HiUpload className="w-5 h-5" />
              파일 업로드
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
              }`}
            >
              <HiViewList className="w-5 h-5" />
              거래내역
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
              }`}
            >
              <HiChartBar className="w-5 h-5" />
              통계
            </button>
            <button
              onClick={() => setActiveTab('mappings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'mappings'
                  ? 'border-blue-500 text-blue-600 transform scale-105'
                  : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:scale-105'
              }`}
            >
              <HiCog className="w-5 h-5" />
              카테고리 매핑
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
        {activeTab === 'upload' && <ExcelUpload onUploadSuccess={handleUploadSuccess} />}
        {activeTab === 'transactions' && <TransactionTable refreshTrigger={refreshTrigger} />}
        {activeTab === 'statistics' && <Statistics refreshTrigger={refreshTrigger} />}
        {activeTab === 'mappings' && <CategoryMappingManagement />}
      </main>
    </div>
  );
}

export default App;
