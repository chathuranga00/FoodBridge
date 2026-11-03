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
  FileText,
  ShieldCheck,
  Camera,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import { groceryApi, contributionApi } from '../../api/client'

export default function UserDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [myReservations, setMyReservations] = useState([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)

  // Campaign Contributions State
  const [myContributions, setMyContributions] = useState([])
  const [loadingContributions, setLoadingContributions] = useState(true)
  const [selectedContributionInstructions, setSelectedContributionInstructions] = useState(null)
  const [selectedContributionEvidence, setSelectedContributionEvidence] = useState(null)

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

  const fetchContributions = async () => {
    try {
      setLoadingContributions(true)
      const res = await contributionApi.getMyContributions()
      setMyContributions(res.data || [])
    } catch (err) {
      console.error('Error loading contributions:', err)
    } finally {
      setLoadingContributions(false)
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchContributions()
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
  const activePledgesCount = myContributions.filter((c) => c.status === 'PLEDGED' || c.status === 'CONFIRMED').length

  const userStats = [
    {
      label: 'Active Grocery Deals',
      value: `${activeReservationsCount} Coupons`,
      icon: <Tag size={20} style={{ color: '#059669' }} />,
    },
    {
      label: 'My Campaign Pledges',
      value: `${activePledgesCount} Active`,
      icon: <Heart size={20} style={{ color: '#e11d48' }} />,
    },
    { label: 'Volunteer Tasks', value: '5 Done', icon: <Award size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Sustainability Points', value: '420 pts', icon: <ShoppingBag size={20} style={{ color: '#b45309' }} /> },
  ]

  const pledgeColumns = [
    {
      key: 'campaignTitle',
      label: 'Campaign & District',
      render: (val, row) => (
        <div>
          <button
            onClick={() => navigate(`/campaigns/${row.campaignId}`)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {val}
          </button>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.3rem', marginTop: '2px' }}>
            <span>{row.charityName}</span>
            <span>•</span>
            <MapPin size={11} style={{ color: '#dc2626' }} />
            <span>{row.campaignDistrict} District</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contributionType',
      label: 'Contribution Type & Items',
      render: (type, row) => (
        <div>
          <span
            className={`badge ${
              type === 'MONETARY_PLEDGE'
                ? 'badge-sky'
                : type === 'FOOD_ITEMS'
                ? 'badge-amber'
                : 'badge-emerald'
            }`}
            style={{ fontSize: '0.7rem', marginBottom: '3px' }}
          >
            {type === 'MONETARY_PLEDGE' ? 'Money Pledge' : type === 'FOOD_ITEMS' ? 'Food Supplies' : 'Other Resources'}
          </span>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {row.quantity} {row.unit || 'units'}
            {row.monetaryAmount ? ` (Rs. ${Number(row.monetaryAmount).toLocaleString()})` : ''}
          </div>
          {row.itemDescription && (
            <div className="text-xs text-muted" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.itemDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status (Rule 5)',
      render: (status) => {
        let badgeClass = 'badge-amber'
        let text = 'Pledged (Awaiting Receipt)'
        if (status === 'CONFIRMED') {
          badgeClass = 'badge-sky'
          text = 'Receipt Confirmed'
        } else if (status === 'DISTRIBUTED') {
          badgeClass = 'badge-emerald'
          text = 'Distributed with Evidence!'
        } else if (status === 'REJECTED' || status === 'CANCELLED') {
          badgeClass = 'badge-rose'
          text = status
        }
        return <span className={`badge ${badgeClass}`}>{text}</span>
      },
    },
    {
      key: 'createdAt',
      label: 'Pledge Date',
      render: (val) => (
        <span className="text-xs text-muted">
          {val ? new Date(val).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions & Evidence',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<FileText size={12} />}
            onClick={() => setSelectedContributionInstructions(row)}
          >
            Instructions
          </Button>
          {row.status === 'DISTRIBUTED' && row.distributionEvidenceUrl && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Camera size={12} />}
              onClick={() => setSelectedContributionEvidence(row)}
            >
              Proof
            </Button>
          )}
        </div>
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
        title="My Campaign Contributions (Rule 5 & Rule 8)"
        subtitle="100% Direct aid without payment processing. Pledges are confirmed directly by recipient charities and tracked through distribution evidence."
        badge={
          myContributions.length > 0 ? (
            <span className="badge badge-sky">{myContributions.length} Pledges</span>
          ) : null
        }
        action={
          <Button
            size="sm"
            variant="primary"
            icon={<Heart size={14} />}
            onClick={() => navigate('/campaigns')}
          >
            Browse Campaigns
          </Button>
        }
        style={{ marginBottom: '2rem' }}
      >
        {loadingContributions ? (
          <div style={{ padding: '2rem 0' }}>
            <Loader message="Loading your pledged contributions..." />
          </div>
        ) : myContributions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <Heart size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              No Community Contributions Yet
            </h4>
            <p className="text-xs text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              Support a verified rural school or family in need with clean water, books, or food supplies. Zero transaction cuts.
            </p>
            <Button
              size="sm"
              variant="outline"
              icon={<ArrowRight size={15} />}
              onClick={() => navigate('/campaigns')}
            >
              Browse Verified Campaigns
            </Button>
          </div>
        ) : (
          <Table columns={pledgeColumns} data={myContributions} />
        )}
      </Card>

      {/* Modal: Agreed Payment & Handover Instructions */}
      <Modal
        isOpen={!!selectedContributionInstructions}
        onClose={() => setSelectedContributionInstructions(null)}
        title={`Charity Instructions: ${selectedContributionInstructions?.campaignTitle}`}
        subtitle={`Organizing Charity: ${selectedContributionInstructions?.charityName}`}
        maxWidth="600px"
      >
        {selectedContributionInstructions && (
          <div>
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5 }}>
                <strong>Zero Payment Processing Notice:</strong> FoodBridge does not deduct fees or act as a financial intermediary. Please follow the charity's instructions below to complete your direct contribution.
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Bank Deposit & Transfer Instructions
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#334155',
                }}
              >
                {selectedContributionInstructions.paymentInstructions || 'Direct bank transfer details provided upon contacting the charity.'}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                Physical Handover & Drop-off Location
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#334155',
                }}
              >
                {selectedContributionInstructions.handoverInstructions || 'Please coordinate physical delivery directly with the charity.'}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                fontSize: '0.825rem',
                color: '#1e40af',
                marginBottom: '1.5rem',
              }}
            >
              <div><strong>Charity Contact:</strong> {selectedContributionInstructions.charityContactPerson || selectedContributionInstructions.charityName}</div>
              <div><strong>Phone:</strong> {selectedContributionInstructions.charityContactPhone || 'Available on request'}</div>
              <div><strong>Email:</strong> {selectedContributionInstructions.charityContactEmail || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => setSelectedContributionInstructions(null)}>
                Understood & Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Distribution Proof & Evidence */}
      <Modal
        isOpen={!!selectedContributionEvidence}
        onClose={() => setSelectedContributionEvidence(null)}
        title="Field Distribution Evidence & Proof"
        subtitle={`Delivered by ${selectedContributionEvidence?.charityName} for ${selectedContributionEvidence?.campaignTitle}`}
        maxWidth="600px"
      >
        {selectedContributionEvidence && (
          <div>
            {selectedContributionEvidence.distributionEvidenceUrl && (
              <div
                style={{
                  height: '240px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '1.25rem',
                }}
              >
                <img
                  src={selectedContributionEvidence.distributionEvidenceUrl}
                  alt="Field Distribution Proof"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}

            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', marginBottom: '0.25rem' }}>
                Handover Confirmed & Distributed
              </div>
              <p style={{ fontSize: '0.85rem', color: '#14532d', margin: 0, lineHeight: 1.5 }}>
                {selectedContributionEvidence.distributionNotes || 'Handed over directly to vulnerable beneficiaries in the field.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
              <span>
                Delivered: {selectedContributionEvidence.distributedAt ? new Date(selectedContributionEvidence.distributedAt).toLocaleDateString() : 'Recently'}
              </span>
              {selectedContributionEvidence.distributionEvidenceUrl && (
                <a
                  href={selectedContributionEvidence.distributionEvidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <ExternalLink size={13} /> View Full File
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
