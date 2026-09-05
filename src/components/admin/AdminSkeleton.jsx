export default function AdminSkeleton({ width = '100%', height = 24, borderRadius = 8, style = {} }) {
  return (
    <div 
      className="skeleton-pulse" 
      style={{ 
        width, 
        height, 
        borderRadius, 
        ...style 
      }} 
    />
  );
}
