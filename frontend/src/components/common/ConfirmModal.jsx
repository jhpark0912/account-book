import { useEffect } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = '확인', cancelText = '취소' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {title}
        </h3>

        {/* 메시지 */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
