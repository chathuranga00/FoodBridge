import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  Heart,
  ShoppingBag,
  Users,
  Award,
  CheckCircle2,
  Plus,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  XCircle,
  Building2,
  FileText,
  MapPin,
  Edit,
  Clock,
  Send,
  PackageCheck,
  Search,
  Phone,
  Image as ImageIcon,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { profileApi, foodListingApi, foodRescueApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS } from '../../utils/constants'

export default function CharityDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  // Navigation tab: 'browse', 'my-requests', 'profile'
  const [activeTab, setActiveTab] = useState('browse')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [availableListings, setAvailableListings] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)

  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [submittingRequest, setSubmittingRequest] = useState(false)

  // Request Form State
  const [requestForm, setRequestForm] = useState({
    quantityRequested: '',
    notes: '',
  })

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    charityName: '',
    registrationNumber: '',
    description: '',
    operatingArea: 'Colombo District',
    logoUrl: '',
    documentUrl: '',
    contactPerson: user?.fullName || '',
    contactEmail: user?.email || '',
    contactPhone: user?.phoneNumber || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: 'Colombo',
    latitude: 6.9271,
    longitude: 79.8612,
    capacityPeople: 150,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await profileApi.getCharityProfile()
      if (res.data) {
        setProfile(res.data)
        setProfileForm({
          charityName: res.data.charityName || '',
          registrationNumber: res.data.registrationNumber || '',
          description: res.data.description || '',
          operatingArea: res.data.operatingArea || 'Colombo District',
          logoUrl: res.data.logoUrl || '',
          documentUrl: res.data.documentUrl || '',
          contactPerson: res.data.contactPerson || user?.fullName || '',
          contactEmail: res.data.contactEmail || user?.email || '',
          contactPhone: res.data.contactPhone || user?.phoneNumber || '',
          addressLine1: res.data.addressLine1 || '',
          addressLine2: res.data.addressLine2 || '',
          city: res.data.city || '',
          district: res.data.district || 'Colombo',
          latitude: res.data.latitude || 6.9271,
          longitude: res.data.longitude || 79.8612,
          capacityPeople: res.data.capacityPeople || 150,
        })

        // If verified, fetch available listings and my requests
        if (res.data.verificationStatus === 'VERIFIED') {
          await loadFeedAndRequests()
        }
      }
    } catch (err) {
      console.error('Failed to load charity profile', err)
    } finally {
      setLoading(false)
    }
  }

  const loadFeedAndRequests = async () => {
    try {
      const [availableRes, requestsRes] = await Promise.all([
        foodListingApi.getAvailable(),
        foodRescueApi.getCharityRequests(),
      ])
      setAvailableListings(availableRes.data || [])
      setMyRequests(requestsRes.data || [])
    } catch (err) {
      console.error('Error fetching available listings or requests', err)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSubmittingProfile(true)
    try {
      const payload = {
        ...profileForm,
        capacityPeople: parseInt(profileForm.capacityPeople, 10) || 100,
        latitude: parseFloat(profileForm.latitude) || 6.9271,
        longitude: parseFloat(profileForm.longitude) || 79.8612,
      }
      const res = await profileApi.updateCharityProfile(payload)
      setProfile(res.data)
      setIsProfileModalOpen(false)
      showToast('Charity profile submitted! Status is PENDING admin review (Rule 2).', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save charity profile', 'error')
    } finally {
      setSubmittingProfile(false)
    }
  }

  const handleOpenRequest = (listing) => {
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
      return
    }
    setSelectedListing(listing)
    setRequestForm({
      quantityRequested: listing.quantity,
      notes: 'Our transport team will arrive with food containers during the pickup window.',
    })
    setIsRequestModalOpen(true)
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    const qty = parseFloat(requestForm.quantityRequested)
    if (!qty || qty <= 0) {
      showToast('Please enter a valid quantity to request.', 'error')
      return
    }

    if (qty > selectedListing.quantity) {
      showToast(`Quantity requested cannot exceed available quantity (${selectedListing.quantity} ${selectedListing.unit}).`, 'error')
      return
    }

    setSubmittingRequest(true)
    try {
      await foodRescueApi.createRequest({
        listingId: selectedListing.id,
        quantityRequested: qty,
        notes: requestForm.notes.trim(),
      })
      showToast(`Request sent to ${selectedListing.businessName}! Status is PENDING restaurant approval.`, 'success')
      setIsRequestModalOpen(false)
      await loadFeedAndRequests()
      setActiveTab('my-requests')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit food rescue request', 'error')
    } finally {
      setSubmittingRequest(false)
    }
  }

  // Filter available listings by search term
  const filteredListings = availableListings.filter((l) => {
    const term = searchTerm.toLowerCase()
    return (
      l.title?.toLowerCase().includes(term) ||
      l.businessName?.toLowerCase().includes(term) ||
      l.foodCategory?.toLowerCase().includes(term) ||
      l.pickupAddress?.toLowerCase().includes(term)
    )
  })

  // Columns for My Requests Table
  const requestColumns = [
    {
      key: 'listingTitle',
      label: 'Food Listing',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {row.listingImageUrl ? (
            <img
              src={row.listingImageUrl}
              alt={row.listingTitle}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--color-bg-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              <ImageIcon size={18} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700 }}>{row.listingTitle}</div>
            <div className="text-xs text-muted">Claimed: {row.quantityRequested} {row.listingUnit}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'businessName',
      label: 'Donor Establishment',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.businessName}</div>
          {row.businessPhone && <div className="text-xs text-muted">📞 {row.businessPhone}</div>}
        </div>
      ),
    },
    {
      key: 'pickupAddress',
      label: 'Pickup Address & Window',
      render: (_, row) => (
        <div className="text-xs">
          <div style={{ fontWeight: 500 }}>{row.pickupAddress}</div>
          <div className="text-muted">
            Until: {row.pickupEnd ? new Date(row.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-amber'
        let label = 'Pending Restaurant Review'
        if (val === 'ACCEPTED') {
          badgeClass = 'badge-sky'
          label = 'Reserved - Ready for Pickup!'
        } else if (val === 'COLLECTED') {
          badgeClass = 'badge-emerald'
          label = 'Collected & Rescued'
        } else if (val === 'REJECTED') {
          badgeClass = 'badge-rose'
          label = 'Declined'
        }
        return <span className={`badge ${badgeClass}`}>{label}</span>
      },
    },
    {
      key: 'notes',
      label: 'Instructions / Notes',
      render: (val) => <span className="text-xs text-muted">{val || 'None'}</span>,
    },
  ]

  const totalRescuedBatches = myRequests.filter((r) => r.status === 'COLLECTED').length
  const activeReservedBatches = myRequests.filter((r) => r.status === 'ACCEPTED').length

  if (loading) {
    return <Loader text="Loading charity operations portal..." />
  }

  return (
    <div>
      {/* Verification Status Banner (Rule 2) */}
      {!profile ? (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e' }}>
            <AlertCircle size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Charity Profile Incomplete (Rule 2)
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Please set up your charity profile and upload your NGO registration certificate to request admin verification.
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsProfileModalOpen(true)}>
            Complete Profile Now
          </Button>
        </div>
      ) : profile.verificationStatus === 'VERIFIED' ? (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
            <CheckCircle2 size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Verified Charity Organization ({profile.charityName})
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                NGO Reg: {profile.registrationNumber} &bull; Authorized to claim human-edible surplus and distribute relief meals
              </div>
            </div>
          </div>
          <span className="badge badge-emerald">Verified</span>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e' }}>
            <AlertCircle size={22} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                NGO Verification Pending (Rule 2)
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                Your charity credentials are under review by FoodBridge admins. Claiming surplus batches is locked until approved.
              </div>
            </div>
          </div>
          <span className="badge badge-amber">Pending Admin Review</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Charity Food Rescue</h1>
          <p className="text-sm text-muted">
            {profile?.charityName || user?.fullName} &bull; Operating Area: {profile?.operatingArea || 'Sri Lanka'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            icon={<Building2 size={16} />}
            onClick={() => setIsProfileModalOpen(true)}
          >
            {profile ? 'Edit Charity Profile' : 'Setup Profile'}
          </Button>
          <Button
            variant="primary"
            icon={<ShoppingBag size={16} />}
            onClick={() => setActiveTab('browse')}
          >
            Browse Food Surplus
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Available Batches</span>
            <ShoppingBag size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{availableListings.length} Live</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Reserved for Pickup</span>
            <Clock size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeReservedBatches} Batches</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Rescued Batches</span>
            <PackageCheck size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalRescuedBatches} Claimed</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Daily Beneficiaries</span>
            <Users size={20} style={{ color: '#e11d48' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {profile?.capacityPeople ? `${profile.capacityPeople} People` : '150 People'}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'browse' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'browse' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag size={18} />
          Browse Available Food ({availableListings.length})
        </button>

        <button
          onClick={() => setActiveTab('my-requests')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'my-requests' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'my-requests' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Clock size={18} />
          My Requests ({myRequests.length})
          {activeReservedBatches > 0 && (
            <span
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              {activeReservedBatches} Ready
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Browse Available Food */}
      {activeTab === 'browse' && (
        <div>
          {/* Search bar */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Input
                placeholder="Search surplus by food name, category, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear Filter
              </Button>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No Available Food Listings Right Now
                </div>
                <p className="text-sm text-muted">
                  Restaurants publish surplus after lunch and dinner shifts. All listings strictly enforce Rule 7 (Human Food Only) and auto-expire once collection windows close.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {listing.imageUrl && (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      style={{
                        width: '100%',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                      }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-emerald">Human Edible (Rule 7)</span>
                    <span className="badge badge-sky">{listing.foodCategory}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    {listing.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-700)', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Donor: {listing.businessName}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                    {listing.description || 'Freshly prepared surplus wholesome meals, packed for safe transport.'}
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--color-bg-alt)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <div><strong>Quantity:</strong> {listing.quantity} {listing.unit}</div>
                    <div><strong>Pickup Location:</strong> {listing.pickupAddress}</div>
                    <div style={{ color: '#0369a1', fontWeight: 600 }}>
                      <strong>Pickup Before:</strong> {listing.pickupEnd ? new Date(listing.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    icon={<Send size={15} />}
                    onClick={() => handleOpenRequest(listing)}
                  >
                    Request Food Rescue Batch
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Requests View */}
      {activeTab === 'my-requests' && (
        <Card
          title="Charity Rescue Requests"
          subtitle="Track food rescue requests sent to restaurants. Once approved (RESERVED), proceed to the restaurant for pickup. Restaurant marks COLLECTED upon handoff."
        >
          <Table
            columns={requestColumns}
            data={myRequests}
            emptyMessage="You have not requested any surplus food batches yet. Browse available food to send requests."
          />
        </Card>
      )}

      {/* Modal: Send Food Rescue Request */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title={`Request Food Rescue: ${selectedListing?.title}`}
        subtitle={`From ${selectedListing?.businessName} • Maximum available: ${selectedListing?.quantity} ${selectedListing?.unit}`}
        maxWidth="550px"
      >
        <form onSubmit={handleRequestSubmit}>
          <Input
            label={`Quantity to Claim (${selectedListing?.unit})`}
            type="number"
            step="0.1"
            required
            value={requestForm.quantityRequested}
            onChange={(e) => setRequestForm({ ...requestForm, quantityRequested: e.target.value })}
            max={selectedListing?.quantity}
            helper={`Available: up to ${selectedListing?.quantity} ${selectedListing?.unit}`}
          />

          <Textarea
            label="Pickup Logistics & Vehicle Arrival Details"
            required
            rows={3}
            value={requestForm.notes}
            onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
            placeholder="e.g. Volunteer van arriving at 4:15 PM with insulated hot boxes."
            helper="Help the restaurant coordinate with their kitchen dispatch staff"
          />

          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              fontSize: '0.825rem',
              color: '#1e40af',
              marginTop: '1rem',
            }}
          >
            <strong>Collection Window Notice:</strong> If approved, this listing becomes RESERVED exclusively for your organization. Please ensure pickup is completed before the window closes.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingRequest}>
              Send Rescue Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Profile Setup/Edit */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={profile ? 'Edit Charity Profile' : 'Create Charity Profile'}
        subtitle="NGO registration is required to claim food surplus (Rule 2)."
        maxWidth="720px"
      >
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Charity / NGO Official Name"
              required
              value={profileForm.charityName}
              onChange={(e) => setProfileForm({ ...profileForm, charityName: e.target.value })}
            />
            <Input
              label="NGO Registration Number"
              required
              value={profileForm.registrationNumber}
              onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Operating Area"
              required
              value={profileForm.operatingArea}
              onChange={(e) => setProfileForm({ ...profileForm, operatingArea: e.target.value })}
            />
            <Input
              label="Feeding Capacity (People)"
              type="number"
              value={profileForm.capacityPeople}
              onChange={(e) => setProfileForm({ ...profileForm, capacityPeople: e.target.value })}
            />
          </div>
          <Input
            label="Supporting NGO Certificate Document URL"
            required
            value={profileForm.documentUrl}
            onChange={(e) => setProfileForm({ ...profileForm, documentUrl: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={profileForm.city}
              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
            />
            <Select
              label="District"
              required
              options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }))}
              value={profileForm.district}
              onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingProfile}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Blocked by Rule 2 */}
      <Modal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Food Rescue Claims Locked (Platform Rule 2)"
        subtitle="Only admin-verified charities can claim food surplus"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
              Platform Rule 2 requires that <strong>charities must be admin-VERIFIED before they can claim</strong> surplus food. This guarantees that meals are handed over to legitimate community kitchens.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => setIsBlockedModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsBlockedModalOpen(false)
                setIsProfileModalOpen(true)
              }}
            >
              Review Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
