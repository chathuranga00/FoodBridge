import { useAuth } from '../../context/AuthContext'
import { MapPin, ShoppingBag, Heart, Award, User, ArrowRight } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'

export default function UserDashboard() {
  const { user } = useAuth()

  const userStats = [
    { label: 'Active Pledges', value: '2', icon: <Heart size={20} style={{ color: '#e11d48' }} /> },
    { label: 'Volunteer Tasks', value: '5 Completed', icon: <Award size={20} style={{ color: '#059669' }} /> },
    { label: 'Local Food Drops', value: '18 Nearby', icon: <MapPin size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Sustainability Points', value: '420 pts', icon: <ShoppingBag size={20} style={{ color: '#b45309' }} /> },
  ]

  const recentPledges = [
    { id: '1', campaign: 'Colombo Flood Relief Kitchen', type: 'Dry Rations (Rice 10kg)', date: '2026-11-01', status: 'CONFIRMED' },
    { id: '2', campaign: 'Kandy Eldercare Feeding Drive', type: 'Monetary Pledge (Rs. 5,000)', date: '2026-10-28', status: 'CONFIRMED' },
    { id: '3', campaign: 'Galle Stray Feeder Network', type: 'Dog Biscuits (5 packets)', date: '2026-10-25', status: 'PENDING_CONFIRMATION' },
  ]

  const pledgeColumns = [
    { key: 'campaign', label: 'Campaign / Initiative' },
    { key: 'type', label: 'Pledge Details' },
    { key: 'date', label: 'Date Pledged' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'CONFIRMED' ? 'badge-emerald' : 'badge-amber'}`}>
          {val === 'CONFIRMED' ? 'Confirmed by Charity' : 'Pending Receipt'}
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <span className="badge badge-emerald" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: 'none', marginBottom: '0.75rem' }}>
          Community User Portal
        </span>
        <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Welcome back, {user?.fullName || 'Community Member'}!
        </h1>
        <p style={{ opacity: 0.95, fontSize: '0.95rem' }}>
          Explore nearby surplus food pickups, volunteer for community rescue tasks, or support verified charity drives in Sri Lanka.
        </p>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {userStats.map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-sm text-muted">{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '2rem' }}>
        {/* Food Map Teaser */}
        <Card
          title="Surplus Food & Grocery Map"
          subtitle="Discover real-time surplus donations near your area"
          badge={<span className="badge badge-emerald">Interactive</span>}
          action={<Button size="sm" variant="outline">Open Full Map</Button>}
        >
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed var(--color-border)',
              gap: '0.5rem',
            }}
          >
            <MapPin size={32} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>OpenStreetMap + Leaflet Ready</span>
            <span className="text-xs text-muted">Showing 18 active pickup spots in Colombo & Western Province</span>
          </div>
        </Card>

        {/* Volunteer Opportunities */}
        <Card
          title="Volunteer Courier Opportunities"
          subtitle="Help transport surplus food from restaurants to charities"
          badge={<span className="badge badge-sky">3 Active Runs</span>}
          action={<Button size="sm" variant="secondary">View All</Button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>Buffet Rescue: Kollupitiya &rarr; Maradana Soup Kitchen</strong>
                <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Urgent (Today 3PM)</span>
              </div>
              <p className="text-xs text-muted">Est. 25kg prepared rice & curry meals. Motorbike or car needed.</p>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>Bakery Surplus: Bambalapitiya &rarr; Children Home</strong>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Scheduled (6PM)</span>
              </div>
              <p className="text-xs text-muted">Est. 40 buns, bread loaves, and pastries.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pledges Table */}
      <Card
        title="My Pledged Contributions"
        subtitle="Rule 5: No payment handling - all donations are confirmed by recipient charities"
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={pledgeColumns} data={recentPledges} />
      </Card>
    </div>
  )
}
