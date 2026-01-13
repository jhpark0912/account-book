import { useState } from 'react';
import toast from 'react-hot-toast';
import { transactionAPI } from '../api/accountService';
import { cardTransactionAPI } from '../api/cardTransactionService';
import { ACCOUNT_TYPES } from '../constants/accountTypes';
import { SEMANTIC_COLORS } from '../constants/colors';

function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileType, setFileType] = useState('toss'); // 'toss' or 'samsung'
  const [accountType, setAccountType] = useState(ACCOUNT_TYPES.LIVING);
  const [cardHolder, setCardHolder] = useState(''); // Samsung 카드 소유자

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleAccountTypeChange = (e) => {
    setAccountType(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('파일을 선택해주세요.');
      return;
    }

    if (fileType === 'samsung' && !cardHolder.trim()) {
      toast.error('카드 소유자 이름을 입력해주세요.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      let result;
      if (fileType === 'samsung') {
        result = await cardTransactionAPI.uploadExcel(file, cardHolder.trim());
      } else {
        result = await transactionAPI.uploadExcel(file, accountType);
      }
      
      const successMessage = `업로드 완료! 총 ${result.total_records}건 중 ${result.new_records}건 추가, ${result.duplicate_records}건 중복`;
      setMessage(successMessage);
      toast.success(successMessage);
      setFile(null);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      const errorMessage = `오류: ${error.response?.data?.detail || error.message}`;
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📤 Excel 파일 업로드</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            파일 유형
          </label>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="toss">Toss 은행</option>
            <option value="samsung">Samsung 카드</option>
          </select>
        </div>

        {fileType === 'toss' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              계좌 유형
            </label>
            <select
              value={accountType}
              onChange={handleAccountTypeChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(ACCOUNT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {fileType === 'samsung' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💳 카드 소유자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="예: 박지훈"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              이 카드 명세서의 소유자 이름을 입력하세요
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel 파일
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold shadow-md hover:shadow-lg"
        >
          {uploading ? '⏳ 업로드 중...' : '🚀 업로드'}
        </button>

        {message && (
          <div
            className={`p-4 rounded-lg font-medium transition-all duration-300 ${
              message.includes('오류')
                ? `${SEMANTIC_COLORS.expense.bg} ${SEMANTIC_COLORS.expense.text} border-l-4 ${SEMANTIC_COLORS.expense.border}`
                : `${SEMANTIC_COLORS.success.bg} ${SEMANTIC_COLORS.success.text} border-l-4 ${SEMANTIC_COLORS.success.border}`
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelUpload;
