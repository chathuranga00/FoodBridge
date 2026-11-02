export default function Loader({
  size = 'md',
  message = 'Loading...',
  fullPage = false,
}) {
  const spinnerSizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(248, 250, 252, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          gap: '1rem',
        }}
      >
        <div className={`spinner ${spinnerSizeClass}`} />
        {message && <p className="text-sm font-semibold text-muted">{message}</p>}
      </div>
    )
  }

  return (
    <div className="page-loader">
      <div className={`spinner ${spinnerSizeClass}`} />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  )
}
