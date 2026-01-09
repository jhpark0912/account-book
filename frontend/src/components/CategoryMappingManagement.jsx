import { useState, useEffect } from 'react';
import { categoryAPI } from '../api/accountService';
import { TRANSACTION_CATEGORIES } from '../constants/transactionCategories';

function CategoryMappingManagement() {
  const [mappings, setMappings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 새 매핑 추가용
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  // 수정용
  const [editingId, setEditingId] = useState(null);
  const [editKeyword, setEditKeyword] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetchMappings();
    fetchCategories();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryAPI.getMappings();
      setMappings(data);
    } catch (error) {
      console.error('매핑 목록 불러오기 실패:', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryAPI.getCategoryList();
      setCategories(result.categories || Object.values(TRANSACTION_CATEGORIES));
    } catch (error) {
      console.error('카테고리 목록 불러오기 실패:', error);
      setCategories(Object.values(TRANSACTION_CATEGORIES));
    }
  };

  const getErrorMessage = (error) => {
    if (!error.response) {
      return '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.';
    }
    if (error.response.status === 400) {
      return error.response.data?.detail || '잘못된 요청입니다.';
    }
    return `오류 발생: ${error.message}`;
  };

  const handleCreate = async () => {
    if (!newKeyword.trim() || !newCategory) {
      alert('키워드와 카테고리를 모두 입력해주세요.');
      return;
    }
    try {
      const response = await categoryAPI.createMapping(newKeyword.trim(), newCategory);
      setNewKeyword('');
      setNewCategory('');
      fetchMappings();
      
      // 업데이트된 거래 수 피드백
      if (response.updated_transactions_count > 0) {
        alert(`매핑이 추가되었고, ${response.updated_transactions_count}개의 기존 거래가 자동으로 분류되었습니다.`);
      } else {
        alert('매핑이 추가되었습니다.');
      }
    } catch (error) {
      console.error('매핑 추가 실패:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleEdit = (mapping) => {
    setEditingId(mapping.id);
    setEditKeyword(mapping.keyword);
    setEditCategory(mapping.category);
  };

  const handleUpdate = async () => {
    if (!editKeyword.trim() || !editCategory) {
      alert('키워드와 카테고리를 모두 입력해주세요.');
      return;
    }
    try {
      await categoryAPI.updateMapping(editingId, editKeyword.trim(), editCategory);
      setEditingId(null);
      fetchMappings();
    } catch (error) {
      console.error('매핑 수정 실패:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await categoryAPI.deleteMapping(id);
      fetchMappings();
    } catch (error) {
      console.error('매핑 삭제 실패:', error);
      alert(getErrorMessage(error));
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditKeyword('');
    setEditCategory('');
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-600 mb-4">
          <p className="font-semibold">오류 발생</p>
          <p>{error}</p>
        </div>
        <button
          onClick={fetchMappings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">카테고리 매핑 관리</h2>
      <p className="text-gray-600 mb-6">
        거래처 키워드와 카테고리를 매핑하여 자동 분류를 설정합니다.
      </p>

      {/* 새 매핑 추가 폼 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-3">새 매핑 추가</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              키워드 (거래처명)
            </label>
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="예: 스타벅스"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              {categories.filter(c => c !== '미분류').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      {/* 매핑 목록 테이블 */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      ) : mappings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          등록된 매핑이 없습니다. 위에서 새 매핑을 추가해주세요.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  키워드
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappings.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-gray-50">
                  {editingId === mapping.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editKeyword}
                          onChange={(e) => setEditKeyword(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.filter(c => c !== '미분류').map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={handleUpdate}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          취소
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mapping.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                          {mapping.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(mapping)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(mapping.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          삭제
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 매핑 개수 표시 */}
      {mappings.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          총 {mappings.length}개의 매핑이 등록되어 있습니다.
        </div>
      )}
    </div>
  );
}

export default CategoryMappingManagement;
