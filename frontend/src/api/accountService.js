import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    // 에러 상세 정보 수집
    const errorInfo = {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    };

    console.error('[API Response Error]', errorInfo);

    // 네트워크 연결 오류
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('⚠️ 요청 타임아웃: 서버가 응답하지 않습니다.');
      } else if (error.message === 'Network Error') {
        console.error('⚠️ 네트워크 오류: 백엔드 서버(http://localhost:8000)가 실행 중인지 확인하세요.');
      }
    }

    // HTTP 상태 코드별 처리
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 404:
          console.error('⚠️ 404: 요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          console.error('⚠️ 500: 서버 내부 오류가 발생했습니다.');
          break;
        case 400:
          console.error('⚠️ 400: 잘못된 요청입니다.');
          break;
      }
    }

    return Promise.reject(error);
  }
);

// 거래내역 관련 API
export const transactionAPI = {
  // Excel 파일 업로드
  uploadExcel: async (file, accountType = '생활비') => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/transactions/upload?account_type=${encodeURIComponent(accountType)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 거래내역 조회
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions/', { params });
    return response.data;
  },

  // 거래내역 카테고리 수정
  updateCategory: async (id, category) => {
    const response = await api.put(`/transactions/${id}?category=${encodeURIComponent(category)}`);
    return response.data;
  },

  // 거래내역 삭제
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // 사용 가능한 년-월 목록 조회
  getAvailableYearMonths: async () => {
    const response = await api.get('/transactions/year-months/list');
    return response.data;
  },
};

// 카테고리 관련 API
export const categoryAPI = {
  // 카테고리 목록
  getCategoryList: async () => {
    const response = await api.get('/categories/list');
    return response.data;
  },

  // 카테고리 매핑 조회
  getMappings: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  // 카테고리 매핑 생성
  createMapping: async (keyword, category) => {
    const response = await api.post('/categories/', { keyword, category });
    return response.data;
  },

  // 카테고리 매핑 수정
  updateMapping: async (id, keyword, category) => {
    const response = await api.put(`/categories/${id}`, { keyword, category });
    return response.data;
  },

  // 카테고리 매핑 삭제
  deleteMapping: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// 통계 관련 API
export const statisticsAPI = {
  // 월별 통계
  getMonthlyStats: async (yearMonth, accountType = null) => {
    const params = accountType ? { account_type: accountType } : {};
    const response = await api.get(`/statistics/monthly/${yearMonth}`, { params });
    return response.data;
  },

  // 카테고리별 통계
  getCategoryStats: async (yearMonth, accountType = null) => {
    const params = accountType ? { account_type: accountType } : {};
    const response = await api.get(`/statistics/category/${yearMonth}`, { params });
    return response.data;
  },

  // 조회 가능한 월 목록
  getAvailableMonths: async (accountType = null) => {
    const params = accountType ? { account_type: accountType } : {};
    const response = await api.get('/statistics/months', { params });
    return response.data;
  },

  // 전체 총자산 조회 (모든 계좌의 최신 잔액 합계)
  getTotalAssets: async (accountType = null) => {
    const params = accountType ? { account_type: accountType } : {};
    const response = await api.get('/statistics/total-assets', { params });
    return response.data;
  },

  // 특정 월의 총자산 조회 (해당 월의 각 계좌별 마지막 잔액 합계)
  getTotalAssetsByMonth: async (yearMonth, accountType = null) => {
    const params = accountType ? { account_type: accountType } : {};
    const response = await api.get(`/statistics/total-assets/${yearMonth}`, { params });
    return response.data;
  },
};

export default api;
