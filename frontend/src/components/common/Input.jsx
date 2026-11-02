export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  required = false,
  disabled = false,
  icon = null,
  className = '',
  ...props
}) {
  const inputId = id || name

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              color: '#94a3b8',
              display: 'flex',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${error ? 'is-invalid' : ''}`}
          style={icon ? { paddingLeft: '2.5rem' } : {}}
          {...props}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  )
}
