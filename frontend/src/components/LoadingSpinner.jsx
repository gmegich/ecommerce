const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="spinner" role="status" aria-live="polite">
    <span className="spinner__ring" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export default LoadingSpinner;
