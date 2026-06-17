import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';
import Button from './Button';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon = FileX,
  title = 'Nothing here yet',
  description = 'Get started by taking an action.',
  actionLabel,
  onAction,
  actionIcon,
}) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
