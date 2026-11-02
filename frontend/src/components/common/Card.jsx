export default function Card({
  title,
  subtitle,
  badge,
  action,
  footer,
  children,
  className = '',
  style = {},
}) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {(title || badge || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {badge && <span>{badge}</span>}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}

