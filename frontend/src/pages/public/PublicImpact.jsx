import { useState, useEffect } from 'react'
import { impactApi } from '../../api/client'
import ImpactAnalyticsView from '../../components/impact/ImpactAnalyticsView'

export default function PublicImpact() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const fetchImpact = async (start = startDate, end = endDate) => {
    setLoading(true)
    try {
      const params = {}
      if (start) params.startDate = start
      if (end) params.endDate = end

      const res = await impactApi.getPlatformSummary(params)
      setData(res.data)
    } catch (err) {
      console.error('Failed to load platform impact stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImpact(startDate, endDate)
  }, [startDate, endDate])

  const handleDateRangeChange = (start, end) => {
    setStartDate(start)
    setEndDate(end)
  }

  const handleExportCsv = () => {
    const url = impactApi.getExportCsvUrl(null, startDate, endDate)
    window.location.href = url
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0 4rem 0' }}>
      <div className="container">
        <ImpactAnalyticsView
          data={data}
          loading={loading}
          isOrganization={false}
          title="National Zero-Waste & Relief Impact"
          subtitle="Real-time, independently verified metrics on surplus food saved, near-expiry retail rescued, and rural humanitarian drives delivered across Sri Lanka."
          onDateRangeChange={handleDateRangeChange}
          onExportCsv={handleExportCsv}
        />
      </div>
    </div>
  )
}

