import './Badge.css';

export default function Badge({ status, children, size = 'md' }) {
  const statusMap = {
    processing: { label: 'Processing', className: 'badge-processing' },
    ready: { label: 'Ready', className: 'badge-ready' },
    failed: { label: 'Failed', className: 'badge-failed' },
    active: { label: 'Active', className: 'badge-active' },
    info: { label: children, className: 'badge-info' },
  };

  const config = statusMap[status] || statusMap.info;

  return (
    <span className={`badge badge-${size} ${config.className}`}>
      {status === 'processing' && <span className="badge-dot badge-dot-animated" />}
      {status === 'ready' && <span className="badge-dot badge-dot-success" />}
      {status === 'failed' && <span className="badge-dot badge-dot-error" />}
      {children || config.label}
    </span>
  );
}
