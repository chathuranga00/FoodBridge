export default function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  rows = 4,
  error,
  hint,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const textareaId = id || name

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-textarea ${error ? 'is-invalid' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  )
}
