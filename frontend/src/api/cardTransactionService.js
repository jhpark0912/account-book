import api from './accountService';

// 카드 거래내역 관련 API
export const cardTransactionAPI = {
  // Samsung Card Excel 파일 업로드
  uploadExcel: async (file, cardHolder) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('card_holder', cardHolder);
    const response = await api.post('/card-transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 카드 거래내역 조회
  getTransactions: async (params = {}) => {
    const response = await api.get('/card-transactions/', { params });
    return response.data;
  },

  // 카드 사용자 목록 조회
  getUsers: async () => {
    const response = await api.get('/card-transactions/users');
    return response.data;
  },

  // 사용 가능한 년-월 목록 조회
  getAvailableYearMonths: async () => {
    const response = await api.get('/card-transactions/year-months');
    return response.data;
  },

  // 카드 거래 카테고리/메모 수정
  updateTransaction: async (id, data) => {
    const response = await api.put(`/card-transactions/${id}`, data);
    return response.data;
  },

  // 카드 거래 삭제
  deleteTransaction: async (id) => {
    const response = await api.delete(`/card-transactions/${id}`);
    return response.data;
  },

  // 사용자별 통계
  getUserStats: async (yearMonth = null) => {
    const params = yearMonth ? { year_month: yearMonth } : {};
    const response = await api.get('/card-transactions/statistics/by-user', { params });
    return response.data;
  },

  // 월별 통계
  getMonthlyStats: async (cardHolder = null) => {
    const params = cardHolder ? { card_holder: cardHolder } : {};
    const response = await api.get('/card-transactions/statistics/monthly', { params });
    return response.data;
  },

  // 카테고리별 통계
  getCategoryStats: async (yearMonth = null, cardHolder = null) => {
    const params = {};
    if (yearMonth) params.year_month = yearMonth;
    if (cardHolder) params.card_holder = cardHolder;
    const response = await api.get('/card-transactions/statistics/by-category', { params });
    return response.data;
  },
};

export default cardTransactionAPI;
