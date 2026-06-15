import './Card.css';

export default function Card({ children, className = '', hover = true, padding = true, onClick, ...props }) {
  const classes = [
    'card',
    hover && 'card-hover',
    padding && 'card-padded',
    onClick && 'card-clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
