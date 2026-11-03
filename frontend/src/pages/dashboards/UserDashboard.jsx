import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  MapPin,
  ShoppingBag,
  Heart,
  Award,
  User,
  ArrowRight,
  Tag,
  Copy,
  Check,
  Calendar,
  Clock,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import { groceryApi } from '../../api/client'

export default function UserDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [myReservations, setMyReservations] = useState([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true)
      const res = await groceryApi.getMyReservations()
      setMyReservations(res.data || [])
    } catch (err) {
      console.error('Error loading reservations:', err)
      showToast('Failed to load your reserved coupons', 'error')
    } finally {
      setLoadingReservations(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The stock will be released back to the grocery store.')) {
      return
    }

    try {
      setCancellingId(reservationId)
      await groceryApi.cancelReservation(reservationId)
      showToast('Reservation cancelled. Reserved stock has been released.', 'info')
      fetchReservations()
    } catch (err) {
      console.error('Error cancelling reservation:', err)
      showToast(err.response?.data?.message || 'Failed to cancel reservation', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    showToast(`Code ${code} copied to clipboard!`, 'success')
    setTimeout(() => setCopiedCodeId(null), 2500)
  }

  const activeReservationsCount = myReservations.filter((r) => r.status === 'RESERVED').length

  const userStats = [
    {
      label: 'Active Grocery Deals',
      value: `${activeReservationsCount} Coupons`,
      icon: <Tag size={20} style={{ color: '#059669' }} />,
    },
    { label: 'Active Pledges', value: '2', icon: <Heart size={20} style={{ color: '#e11d48' }} /> },
    { label: 'Volunteer Tasks', value: '5 Done', icon: <Award size={20} style={{ color: '#0284c7' }} /> },
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

  const formatTimeWindow = (start, end) => {
    if (!start || !end) return 'Check store hours'
    try {
      const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const d = new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' })
      return `${d}, ${s} - ${e}`
    } catch {
      return 'Scheduled Window'
    }
  }

  const reservationColumns = [
    {
      key: 'offerTitle',
      label: 'Reserved Product & Store',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{val}</div>
          <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
            <span>{row.businessName}</span>
            <span>•</span>
            <MapPin size={12} />
            <span>{row.pickupAddress || row.businessAddress}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'redemptionCode',
      label: 'Redemption Code',
      render: (code, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: '1rem',
              backgroundColor: '#f1f5f9',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              color: 'var(--color-primary)',
            }}
          >
            {code}
          </span>
          <button
            onClick={() => copyCode(code, row.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copiedCodeId === row.id ? '#059669' : '#64748b',
              padding: '4px',
            }}
            title="Copy redemption code"
          >
            {copiedCodeId === row.id ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      ),
    },
    {
      key: 'totalPrice',
      label: 'Amount to Pay',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--color-primary)' }}>Rs. {Number(val).toLocaleString()}</strong>
          <div className="text-xs text-muted">{row.quantity} unit(s)</div>
        </div>
      ),
    },
    {
      key: 'pickupStart',
      label: 'Collection Window',
      render: (val, row) => (
        <span className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={13} style={{ color: '#0284c7' }} />
          {formatTimeWindow(row.pickupStart, row.pickupEnd)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-amber'
        let text = val
        if (val === 'REDEEMED') {
          badgeClass = 'badge-emerald'
          text = 'Redeemed'
        } else if (val === 'CANCELLED') {
          badgeClass = 'badge-rose'
          text = 'Cancelled'
        } else if (val === 'EXPIRED') {
          badgeClass = 'badge-gray'
          text = 'Expired'
        } else if (val === 'RESERVED') {
          badgeClass = 'badge-sky'
          text = 'Ready for Pickup'
        }
        return <span className={`badge ${badgeClass}`}>{text}</span>
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => {
        if (row.status === 'RESERVED') {
          return (
            <Button
              variant="outline"
              size="sm"
              loading={cancellingId === row.id}
              onClick={() => handleCancelReservation(row.id)}
            >
              Cancel
            </Button>
          )
        }
        return <span className="text-xs text-muted">-</span>
      },
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
        <span
          className="badge"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: 'none',
            marginBottom: '0.75rem',
          }}
        >
          Community User Portal
        </span>
        <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Welcome back, {user?.fullName || 'Community Member'}!
        </h1>
        <p style={{ opacity: 0.95, fontSize: '0.95rem' }}>
          Manage your reserved grocery coupon codes, view community pledges, or browse fresh deals to combat food waste.
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

      {/* Grocery Coupons Section */}
      <Card
        title="My Grocery Deals & Redemption Coupons"
        subtitle="Present your unique code at the store checkout to collect your reserved items"
        badge={
          activeReservationsCount > 0 ? (
            <span className="badge badge-emerald">{activeReservationsCount} Active Deals</span>
          ) : null
        }
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<ShoppingBag size={15} />}
            onClick={() => navigate('/grocery-offers')}
          >
            Browse More Deals
          </Button>
        }
        style={{ marginBottom: '2rem' }}
      >
        {loadingReservations ? (
          <div style={{ padding: '2rem 0' }}>
            <Loader message="Loading your reserved coupons..." />
          </div>
        ) : myReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Tag size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Reserved Coupons Yet
            </h4>
            <p className="text-xs text-muted" style={{ maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
              You haven't reserved any near-date grocery deals yet. Browse discounted goods across Sri Lanka and save up to 70%!
            </p>
            <Button
              size="sm"
              variant="outline"
              icon={<ArrowRight size={15} />}
              onClick={() => navigate('/grocery-offers')}
            >
              Explore Grocery Offers
            </Button>
          </div>
        ) : (
          <Table columns={reservationColumns} data={myReservations} />
        )}
      </Card>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-2 gap-8" style={{ marginBottom: '2rem' }}>
        {/* Food Map Teaser */}
        <Card
          title="Surplus Food & Grocery Map"
          subtitle="Discover real-time surplus donations near your area"
          badge={<span className="badge badge-emerald">Interactive</span>}
          action={<Button size="sm" variant="outline" onClick={() => navigate('/grocery-offers')}>Browse Deals</Button>}
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
            <span className="text-xs text-muted">Active deals & surplus drops in Colombo & Western Province</span>
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
