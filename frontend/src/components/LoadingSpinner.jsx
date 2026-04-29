/**
 * LoadingSpinner — show during data fetching.
 * Props:
 *   text  - string (optional loading message)
 *   size  - "sm" | "md" | "lg" (default "md")
 *   fullPage - bool (centers in viewport)
 */
const LoadingSpinner = ({ text = "Loading...", size = "md", fullPage = false }) => {
  const cls = `spinner spinner-${size} ${fullPage ? "spinner-full" : ""}`;
  return (
    <div className={cls}>
      <div className="spinner-ring" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

/**
 * Skeleton loader — for list/card loading states
 */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-line wide" />
    <div className="skeleton-line medium" />
    <div className="skeleton-line narrow" />
    <div className="skeleton-footer">
      <div className="skeleton-badge" />
      <div className="skeleton-chip" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="card-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default LoadingSpinner;
