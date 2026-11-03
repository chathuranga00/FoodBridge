import { useState } from 'react'
import {
  TrendingUp,
  ShoppingBag,
  Heart,
  Store,
  ShieldCheck,
  Download,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Users,
  Leaf,
  CheckCircle2,
  Package,
  RotateCcw,
  Truck,
  Tag,
  Clock,
  Compass,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Button from '../common/Button'
import './ImpactAnalyticsView.css'

const COLORS = ['#059669', '#2563eb', '#e11d48', '#d97706', '#7c3aed', '#0284c7', '#10b981', '#f59e0b']

export default function ImpactAnalyticsView({
  data,
  loading = false,
  isOrganization = false,
  title = 'Verified Impact & Transparency',
  subtitle = 'Real-time verified data reflecting completed actions across Sri Lanka.',
  onDateRangeChange,
  onExportCsv,
}) {
  const [filterPreset, setFilterPreset] = useState('ALL')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setFilterPreset(preset)
    const now = new Date()
    let start = ''
    let end = ''

    if (preset === 'THIS_YEAR') {
      start = `${now.getFullYear()}-01-01`
      end = now.toISOString().split('T')[0]
    } else if (preset === 'LAST_30') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      start = d.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
    } else if (preset === 'LAST_90') {
      const d = new Date()
      d.setDate(d.getDate() - 90)
      start = d.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
    }

    setCustomStart(start)
    setCustomEnd(end)
    if (onDateRangeChange) {
      onDateRangeChange(start || null, end || null)
    }
  }

  const handleCustomApply = () => {
    setFilterPreset('CUSTOM')
    if (onDateRangeChange) {
      onDateRangeChange(customStart || null, customEnd || null)
    }
  }

  const handleReset = () => {
    setFilterPreset('ALL')
    setCustomStart('')
    setCustomEnd('')
    if (onDateRangeChange) {
      onDateRangeChange(null, null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem auto',
          }}
        />
        <p>Loading verified impact records from secure ledger...</p>
      </div>
    )
  }

  // Fallbacks
  const foodKg = data?.foodRescuedKg ?? data?.foodWeightKg ?? 0
  const collections = data?.completedCollections ?? 0
  const groceryRedeemed = data?.groceryProductsRedeemed ?? 0
  const activeBusinesses = data?.activeBusinesses ?? 1
  const completedCampaigns = data?.completedCampaigns ?? 0
  const resources = data?.resourcesDistributed ?? data?.resourcesHandled ?? 0
  const people = data?.peopleSupported ?? 0
  const volunteers = data?.activeVolunteers ?? 0
  const co2 = data?.co2SavingsKg ?? 0
  const meals = data?.mealsProvided ?? 0

  const categoryBreakdown = data?.categoryBreakdown || []
  const monthlyTrends = data?.monthlyTrends || []
  const recentMilestones = data?.recentMilestones || data?.recentActivities || []

  return (
    <div className="impact-dashboard-container">
      {/* 1. Header Card */}
      <div className="impact-header-card">
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} /> Rule 4 Verified & Completed Accounting Only
          </div>
          <h1 className="impact-header-title">{title}</h1>
          <p className="impact-header-subtitle">{subtitle}</p>
        </div>

        <div className="impact-actions-group">
          <Button
            variant="primary"
            onClick={onExportCsv}
            icon={<Download size={16} />}
            style={{ backgroundColor: '#ffffff', color: '#064e3b', fontWeight: 700 }}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            onClick={handlePrint}
            icon={<Printer size={16} />}
            style={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      {/* 2. Date Filter Controls Bar */}
      <div className="impact-filter-bar">
        <div className="filter-pills-row">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Date Range:
          </span>
          <button
            type="button"
            className={`filter-btn-pill ${filterPreset === 'ALL' ? 'active' : ''}`}
            onClick={() => handlePresetChange('ALL')}
          >
            All Time
          </button>
          <button
            type="button"
            className={`filter-btn-pill ${filterPreset === 'THIS_YEAR' ? 'active' : ''}`}
            onClick={() => handlePresetChange('THIS_YEAR')}
          >
            This Year
          </button>
          <button
            type="button"
            className={`filter-btn-pill ${filterPreset === 'LAST_30' ? 'active' : ''}`}
            onClick={() => handlePresetChange('LAST_30')}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className={`filter-btn-pill ${filterPreset === 'LAST_90' ? 'active' : ''}`}
            onClick={() => handlePresetChange('LAST_90')}
          >
            Last 90 Days
          </button>
        </div>

        <div className="custom-date-inputs">
          <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            placeholder="From"
          />
          <span>to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            placeholder="To"
          />
          <Button size="sm" variant="outline" onClick={handleCustomApply}>
            Apply
          </Button>
          {(customStart || customEnd || filterPreset !== 'ALL') && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.78rem',
              }}
              title="Reset Filters"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. 8 Key Performance Indicators (KPI) Grid */}
      <div className="impact-kpi-grid">
        {/* KPI 1: Food Rescued */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">Food Rescued</span>
            <div className="kpi-icon-bubble" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Leaf size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{foodKg.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600 }}>kg</span></div>
          <div className="kpi-sub-badges">
            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
              ~{meals.toLocaleString()} Meals
            </span>
            <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
              ~{co2.toLocaleString()} kg CO2 Saved
            </span>
          </div>
        </div>

        {/* KPI 2: Completed Collections */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">Completed Collections</span>
            <div className="kpi-icon-bubble" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Truck size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{collections.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            100% verified completed logistics
          </div>
        </div>

        {/* KPI 3: Grocery Products Redeemed */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">Grocery Items Saved</span>
            <div className="kpi-icon-bubble" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              <Tag size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{groceryRedeemed.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Near-expiry products discounted & redeemed
          </div>
        </div>

        {/* KPI 4: Active Businesses */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">
              {isOrganization ? 'Agreed Partnerships' : 'Active Businesses'}
            </span>
            <div className="kpi-icon-bubble" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Store size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">
            {isOrganization
              ? (data?.completedPartnerships || 0).toLocaleString()
              : activeBusinesses.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {isOrganization ? 'Completed partnership milestones' : 'Verified food businesses in network'}
          </div>
        </div>

        {/* KPI 5: Completed Campaigns */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">Completed Campaigns</span>
            <div className="kpi-icon-bubble" style={{ background: '#ffe4e6', color: '#be123c' }}>
              <Heart size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{completedCampaigns.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Rural community drives fully delivered
          </div>
        </div>

        {/* KPI 6: Resources Distributed */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">Resources Distributed</span>
            <div className="kpi-icon-bubble" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
              <Package size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{resources.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Water filters, stationery & emergency kits
          </div>
        </div>

        {/* KPI 7: People Supported */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">People Supported</span>
            <div className="kpi-icon-bubble" style={{ background: '#ffedd5', color: '#c2410c' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">{people.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Estimated beneficiaries reached directly
          </div>
        </div>

        {/* KPI 8: Volunteers */}
        <div className="impact-kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-metric-label">
              {isOrganization ? 'Carbon Savings' : 'Verified Volunteers'}
            </span>
            <div className="kpi-icon-bubble" style={{ background: '#ccfbf1', color: '#0f766e' }}>
              <Sparkles size={22} />
            </div>
          </div>
          <div className="kpi-metric-value">
            {isOrganization ? `${co2.toLocaleString()} kg` : volunteers.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {isOrganization ? 'Equivalent greenhouse gases avoided' : 'Active logistics & delivery champions'}
          </div>
        </div>
      </div>

      {/* 4. Interactive Charts Section (Recharts) */}
      <div className="impact-charts-grid">
        {/* Chart 1: Monthly Timeline Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Impact Growth Timeline</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Food rescued (kg) & collection events over time
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="foodRescuedKg"
                    name="Food Rescued (kg)"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorFood)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completedCollections"
                    name="Collections Completed"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCollections)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '5rem', color: 'var(--color-text-muted)' }}>
                No historical trend data recorded for this range.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Category Distribution</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Breakdown of items and aid types
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={11} stroke="#64748b" />
                  <YAxis type="category" dataKey="category" fontSize={11} stroke="#64748b" width={80} />
                  <Tooltip
                    formatter={(val) => [`${val} units/kg`, 'Volume']}
                    contentStyle={{ borderRadius: '8px', fontSize: '0.8rem' }}
                  />
                  <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]}>
                    {categoryBreakdown.slice(0, 5).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No category data for selected filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Rule 4 Zero-Estimate Transparency Guarantee Notice */}
      <div className="transparency-guarantee-card">
        <ShieldCheck size={28} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.35rem 0', color: '#064e3b', fontSize: '0.95rem', fontWeight: 700 }}>
            Independently Auditable Impact Guarantee (Rule 4 Enforcement)
          </h4>
          <p style={{ margin: 0, fontSize: '0.83rem', color: '#166534', lineHeight: 1.5 }}>
            To prevent greenwashing and protect trust across Sri Lanka, FoodBridge operates on a strict zero-estimate policy.
            Only food physically collected by charities, grocery deals confirmed at store counters, and relief packages delivered
            with photographic evidence are counted on this dashboard. Pledges, pending claims, and unredeemed reservations are strictly excluded.
          </p>
        </div>
      </div>

      {/* 6. Recent Verified Milestones Audit Ledger */}
      <div className="milestones-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text)' }}>
              Recent Verified Milestones
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Real-time audit ledger of completed platform activities
            </span>
          </div>
          <span className="badge badge-emerald">Live Audit Feed</span>
        </div>

        {recentMilestones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
            No completed milestones recorded yet in this time frame.
          </div>
        ) : (
          <div>
            {recentMilestones.map((m) => {
              let badgeText = 'Food Rescue'
              let badgeColor = 'badge-emerald'
              if (m.type === 'GROCERY_REDEMPTION') {
                badgeText = 'Grocery Deal'
                badgeColor = 'badge-sky'
              } else if (m.type === 'CAMPAIGN_COMPLETED') {
                badgeText = 'Campaign Goal Met'
                badgeColor = 'badge-rose'
              } else if (m.type === 'RESOURCE_DISTRIBUTED') {
                badgeText = 'Aid Distributed'
                badgeColor = 'badge-purple'
              }

              return (
                <div key={m.id} className="milestone-item">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--color-primary)',
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span className={`badge ${badgeColor}`} style={{ fontSize: '0.7rem' }}>
                        {badgeText}
                      </span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--color-text)' }}>
                        {m.title}
                      </strong>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem' }}>
                      {m.description}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', gap: '0.75rem' }}>
                      <span>🏢 {m.organizationName}</span>
                      {m.district && <span>📍 {m.district}</span>}
                      {m.timestamp && <span>⏰ {new Date(m.timestamp).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
