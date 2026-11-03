export default function Table({
  columns = [],
  data = [],
  keyField = 'id',
  emptyMessage = 'No records found',
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="table-responsive" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 0.75rem auto' }} />
        <p className="text-sm text-muted">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || col.label || col.header || idx} style={col.headerStyle || {}}>
                {col.label || col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={row[keyField] || index}>
                {columns.map((col, colIdx) => {
                  const val = col.key ? row[col.key] : row
                  return (
                    <td key={col.key || col.label || col.header || colIdx} style={col.cellStyle || {}}>
                      {col.render ? col.render(val, row, index) : (val !== undefined && val !== null ? String(val) : '')}
                    </td>
                  )
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

