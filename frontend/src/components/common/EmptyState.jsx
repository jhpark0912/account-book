const EmptyState = ({ 
  icon = '📋', 
  message = '데이터가 없습니다', 
  description,
  actionText,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* 아이콘 */}
      <div className="text-6xl mb-4 opacity-50">
        {icon}
      </div>
      
      {/* 메시지 */}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {message}
      </h3>
      
      {/* 설명 (옵션) */}
      {description && (
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      
      {/* 액션 버튼 (옵션) */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
