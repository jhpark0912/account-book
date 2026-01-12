// 로딩 스켈레톤 컴포넌트
function LoadingSkeleton({ type = 'default', count = 1 }) {
  // 기본 스켈레톤
  const DefaultSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  // 카드 스켈레톤
  const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  // 테이블 행 스켈레톤
  const TableRowSkeleton = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
    </tr>
  );

  // 리스트 아이템 스켈레톤
  const ListItemSkeleton = () => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-20"></div>
    </div>
  );

  // 차트 스켈레톤
  const ChartSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );

  // 스피너 (기존 로딩과 호환)
  const SpinnerSkeleton = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'table-row':
        return <TableRowSkeleton />;
      case 'list-item':
        return <ListItemSkeleton />;
      case 'chart':
        return <ChartSkeleton />;
      case 'spinner':
        return <SpinnerSkeleton />;
      default:
        return <DefaultSkeleton />;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}

export default LoadingSkeleton;
