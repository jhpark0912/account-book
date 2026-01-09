import { useState } from 'react';
import ExcelUpload from './components/ExcelUpload';
import TransactionTable from './components/TransactionTable';
import Statistics from './components/Statistics';
import CategoryMappingManagement from './components/CategoryMappingManagement';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">가계부</h1>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              파일 업로드
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              거래내역
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              통계
            </button>
            <button
              onClick={() => setActiveTab('mappings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mappings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              카테고리 매핑
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && <ExcelUpload onUploadSuccess={handleUploadSuccess} />}
        {activeTab === 'transactions' && <TransactionTable refreshTrigger={refreshTrigger} />}
        {activeTab === 'statistics' && <Statistics refreshTrigger={refreshTrigger} />}
        {activeTab === 'mappings' && <CategoryMappingManagement />}
      </main>
    </div>
  );
}

export default App;
