export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  block = false,
  icon = null,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = `btn-${variant}`
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''
  const blockClass = block ? 'btn-block' : ''

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <span className="spinner spinner-sm" style={{ borderTopColor: 'currentColor' }} />
      ) : icon ? (
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}
