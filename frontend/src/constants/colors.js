// 의미론적 색상 시스템
// TailwindCSS 클래스를 활용한 일관된 색상 팔레트

export const SEMANTIC_COLORS = {
  // 수입 - 녹색 계열
  income: {
    text: 'text-emerald-600',
    textLight: 'text-emerald-500',
    textDark: 'text-emerald-700',
    bg: 'bg-emerald-50',
    bgHover: 'hover:bg-emerald-100',
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
  },
  
  // 지출 - 빨간색 계열
  expense: {
    text: 'text-rose-600',
    textLight: 'text-rose-500',
    textDark: 'text-rose-700',
    bg: 'bg-rose-50',
    bgHover: 'hover:bg-rose-100',
    border: 'border-rose-200',
    gradient: 'from-rose-500 to-pink-600',
  },
  
  // 정보 - 파란색 계열
  info: {
    text: 'text-blue-600',
    textLight: 'text-blue-500',
    textDark: 'text-blue-700',
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-indigo-600',
  },
  
  // 경고 - 노란색 계열
  warning: {
    text: 'text-amber-600',
    textLight: 'text-amber-500',
    textDark: 'text-amber-700',
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-600',
  },
  
  // 성공 - 초록색 계열
  success: {
    text: 'text-green-600',
    textLight: 'text-green-500',
    textDark: 'text-green-700',
    bg: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    border: 'border-green-200',
    gradient: 'from-green-500 to-emerald-600',
  },
  
  // 중립 - 회색 계열
  neutral: {
    text: 'text-gray-600',
    textLight: 'text-gray-500',
    textDark: 'text-gray-700',
    bg: 'bg-gray-50',
    bgHover: 'hover:bg-gray-100',
    border: 'border-gray-200',
    gradient: 'from-gray-500 to-slate-600',
  },
};

// 카테고리별 색상 매핑
export const CATEGORY_COLORS = {
  '식비': SEMANTIC_COLORS.expense,
  '교통비': SEMANTIC_COLORS.info,
  '주거생활비': SEMANTIC_COLORS.warning,
  '미용비': SEMANTIC_COLORS.neutral,
  '건강관리비': SEMANTIC_COLORS.success,
  '사회생활비': SEMANTIC_COLORS.info,
  '문화생활비': SEMANTIC_COLORS.neutral,
  '뚜이': SEMANTIC_COLORS.expense,
};

// 그라데이션 프리셋
export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-600',
  danger: 'bg-gradient-to-r from-rose-500 to-pink-600',
  info: 'bg-gradient-to-r from-cyan-500 to-blue-600',
  purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
  ocean: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600',
  sunset: 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600',
};

// 금액 색상 (양수/음수)
export const getAmountColor = (amount) => {
  if (amount > 0) return SEMANTIC_COLORS.income.text;
  if (amount < 0) return SEMANTIC_COLORS.expense.text;
  return SEMANTIC_COLORS.neutral.text;
};

// 거래 유형별 색상
export const TRANSACTION_TYPE_COLORS = {
  '입금': SEMANTIC_COLORS.income,
  '출금': SEMANTIC_COLORS.expense,
  '이체': SEMANTIC_COLORS.info,
};
