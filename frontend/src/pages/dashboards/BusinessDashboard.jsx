import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  ShoppingBag,
  TrendingUp,
  Tag,
  ShieldCheck,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  MapPin,
  Edit,
  ExternalLink,
  ClipboardList,
  Check,
  X,
  PackageCheck,
  Calendar,
  AlertTriangle,
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
import { SRI_LANKA_DISTRICTS, BUSINESS_TYPES } from '../../utils/constants'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  // Navigation tab: 'listings', 'requests', 'profile'
  const [activeTab, setActiveTab] = useState('listings')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [collectionRequests, setCollectionRequests] = useState([])

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [submittingListing, setSubmittingListing] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    businessType: user?.role === 'GROCERY' ? 'GROCERY' : 'RESTAURANT',
    registrationNumber: '',
    description: '',
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
  })

  // Food Listing Form State with Food-Safety Checkbox
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    foodCategory: 'Prepared Meals',
    suitabilityType: 'HUMAN_CONSUMPTION',
    quantity: '',
    unit: 'portions',
    perishable: true,
    foodSafetyConfirmed: false,
    pickupStart: '',
    pickupEnd: '',
    expiryDate: '',
    dietaryFlags: 'Halal, Cooked Today',
    storageInstructions: 'Keep in temperature-controlled holding',
    pickupAddress: '',
    latitude: 6.9271,
    longitude: 79.8612,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const profileRes = await profileApi.getBusinessProfile()
      if (profileRes.data) {
        setProfile(profileRes.data)
        setProfileForm({
          businessName: profileRes.data.businessName || '',
          businessType: profileRes.data.businessType || 'RESTAURANT',
          registrationNumber: profileRes.data.registrationNumber || '',
          description: profileRes.data.description || '',
          logoUrl: profileRes.data.logoUrl || '',
          documentUrl: profileRes.data.documentUrl || '',
          contactPerson: profileRes.data.contactPerson || user?.fullName || '',
          contactEmail: profileRes.data.contactEmail || user?.email || '',
          contactPhone: profileRes.data.contactPhone || user?.phoneNumber || '',
          addressLine1: profileRes.data.addressLine1 || '',
          addressLine2: profileRes.data.addressLine2 || '',
          city: profileRes.data.city || '',
          district: profileRes.data.district || 'Colombo',
          latitude: profileRes.data.latitude || 6.9271,
          longitude: profileRes.data.longitude || 79.8612,
        })

        setListingForm((prev) => ({
          ...prev,
          pickupAddress: `${profileRes.data.addressLine1 || ''}, ${profileRes.data.city || ''}`,
          latitude: profileRes.data.latitude || 6.9271,
          longitude: profileRes.data.longitude || 79.8612,
        }))

        // Load listings and collection requests if verified
        if (profileRes.data.verificationStatus === 'VERIFIED') {
          await loadListingsAndRequests()
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err)
    } finally {
      setLoading(false)
    }
  }

  const loadListingsAndRequests = async () => {
    try {
      const [listingsRes, requestsRes] = await Promise.all([
        foodListingApi.getMyListings(),
        foodRescueApi.getRestaurantRequests(),
      ])
      setMyListings(listingsRes.data || [])
      setCollectionRequests(requestsRes.data || [])
    } catch (err) {
      console.error('Error fetching listings or requests', err)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSubmittingProfile(true)
    try {
      const payload = {
        ...profileForm,
        latitude: parseFloat(profileForm.latitude) || 6.9271,
        longitude: parseFloat(profileForm.longitude) || 79.8612,
      }
      const res = await profileApi.updateBusinessProfile(payload)
      setProfile(res.data)
      setIsProfileModalOpen(false)
      showToast('Business profile submitted! Status is PENDING admin review (Rule 2).', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save business profile', 'error')
    } finally {
      setSubmittingProfile(false)
    }
  }

  const handlePublishClick = () => {
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
    } else {
      // Set reasonable pickup and expiry window defaults
      const now = new Date()
      const start = new Date(now.getTime() + 15 * 60000).toISOString().slice(0, 16)
      const end = new Date(now.getTime() + 180 * 60000).toISOString().slice(0, 16)
      const exp = new Date(now.getTime() + 300 * 60000).toISOString().slice(0, 16)

      setListingForm((prev) => ({
        ...prev,
        pickupStart: start,
        pickupEnd: end,
        expiryDate: exp,
        foodSafetyConfirmed: false,
      }))
      setIsListingModalOpen(true)
    }
  }

  const handleCreateListingSubmit = async (e) => {
    e.preventDefault()
    if (!listingForm.foodSafetyConfirmed) {
      showToast('You must confirm food-safety compliance before publishing (Rule 7).', 'error')
      return
    }

    setSubmittingListing(true)
    try {
      const payload = {
        ...listingForm,
        quantity: parseFloat(listingForm.quantity),
        pickupStart: new Date(listingForm.pickupStart).toISOString(),
        pickupEnd: new Date(listingForm.pickupEnd).toISOString(),
        expiryDate: new Date(listingForm.expiryDate).toISOString(),
        latitude: parseFloat(listingForm.latitude),
        longitude: parseFloat(listingForm.longitude),
      }

      await foodListingApi.createListing(payload)
      showToast('Surplus food listing published live! Charities can now request it.', 'success')
      setIsListingModalOpen(false)
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish food listing', 'error')
    } finally {
      setSubmittingListing(false)
    }
  }

  const handleApproveRequest = async (request) => {
    setProcessingAction(true)
    try {
      await foodRescueApi.decideRequest(request.id, {
        decision: 'APPROVE',
        reason: 'Confirmed. Ready for charity collection within pickup window.',
      })
      showToast(`Approved request from ${request.charityName}! Listing is now RESERVED.`, 'success')
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve request', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleOpenReject = (request) => {
    setSelectedRequest(request)
    setRejectReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async (e) => {
    e.preventDefault()
    setProcessingAction(true)
    try {
      await foodRescueApi.decideRequest(selectedRequest.id, {
        decision: 'REJECT',
        reason: rejectReason.trim() || 'Unavailable for collection at the requested time.',
      })
      showToast(`Declined request from ${selectedRequest.charityName}. Listing remains AVAILABLE.`, 'warning')
      setIsRejectModalOpen(false)
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject request', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleMarkCollected = async (request) => {
    setProcessingAction(true)
    try {
      await foodRescueApi.markCollected(request.id)
      showToast(`Food rescue marked COLLECTED! Verified ActivityRecord and ImpactRecord created (Rule 4).`, 'success')
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark collection', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  // Columns for Food Listings Table
  const listingColumns = [
    {
      key: 'title',
      label: 'Listing & Photo',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt={row.title}
              style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'var(--color-bg-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              <ImageIcon size={20} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700 }}>{row.title}</div>
            <div className="text-xs text-muted">{row.foodCategory} &bull; {row.unit}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (_, row) => <strong>{row.quantity} {row.unit}</strong>,
    },
    {
      key: 'suitabilityType',
      label: 'Suitability (Rule 7)',
      render: (val) => (
        <span className={`badge ${val === 'HUMAN_CONSUMPTION' ? 'badge-emerald' : 'badge-sky'}`}>
          {val === 'HUMAN_CONSUMPTION' ? 'Human Edible' : 'Animal Feed'}
        </span>
      ),
    },
    {
      key: 'pickupEnd',
      label: 'Collection Window',
      render: (_, row) => (
        <div className="text-xs">
          <div>From: {row.pickupStart ? new Date(row.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ASAP'}</div>
          <div>Until: {row.pickupEnd ? new Date(row.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Evening'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-emerald'
        if (val === 'RESERVED') badgeClass = 'badge-sky'
        if (val === 'COLLECTED') badgeClass = 'badge-emerald'
        if (val === 'EXPIRED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{val}</span>
      },
    },
  ]

  // Columns for Collection Requests Table
  const requestColumns = [
    {
      key: 'listingTitle',
      label: 'Food Listing',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.listingTitle}</div>
          <div className="text-xs text-muted">Requested: {row.quantityRequested} {row.listingUnit}</div>
        </div>
      ),
    },
    {
      key: 'charityName',
      label: 'Requesting Charity',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.charityName}</div>
          <div className="text-xs text-muted">Reg: {row.charityRegistrationNumber || 'NGO'}</div>
          {row.charityContactPhone && <div className="text-xs text-muted">📞 {row.charityContactPhone}</div>}
        </div>
      ),
    },
    {
      key: 'notes',
      label: 'Pickup Notes',
      render: (val) => <span className="text-xs">{val || 'No special instructions'}</span>,
    },
    {
      key: 'status',
      label: 'Request Status',
      render: (val) => {
        let badgeClass = 'badge-amber'
        if (val === 'ACCEPTED') badgeClass = 'badge-sky'
        if (val === 'COLLECTED') badgeClass = 'badge-emerald'
        if (val === 'REJECTED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{val}</span>
      },
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => {
        if (row.status === 'PENDING') {
          return (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Button
                size="sm"
                variant="primary"
                icon={<Check size={13} />}
                onClick={() => handleApproveRequest(row)}
                loading={processingAction}
              >
                Approve & Reserve
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<X size={13} />}
                onClick={() => handleOpenReject(row)}
                loading={processingAction}
              >
                Decline
              </Button>
            </div>
          )
        }
        if (row.status === 'ACCEPTED') {
          return (
            <Button
              size="sm"
              variant="primary"
              icon={<PackageCheck size={14} />}
              onClick={() => handleMarkCollected(row)}
              loading={processingAction}
            >
              Mark Collected
            </Button>
          )
        }
        return <span className="text-xs text-muted">Completed</span>
      },
    },
  ]

  const pendingRequestsCount = collectionRequests.filter((r) => r.status === 'PENDING').length
  const activeReservationsCount = collectionRequests.filter((r) => r.status === 'ACCEPTED').length

  if (loading) {
    return <Loader text="Loading restaurant food rescue portal..." />
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
                Profile Incomplete (Rule 2)
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Please set up your business profile and upload your Business Registration (BR) certificate to request admin verification.
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
                Verified Food Donor ({profile.businessName})
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                Admin verified establishment &bull; Full publishing and food rescue privileges active
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
                Verification Pending Review (Rule 2)
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                Your business details are under review by FoodBridge admins. Publishing food listings is locked until approved.
              </div>
            </div>
          </div>
          <span className="badge badge-amber">Pending Admin Review</span>
        </div>
      )}

      {/* Header and Quick Actions */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Restaurant Food Rescue</h1>
          <p className="text-sm text-muted">
            {profile?.businessName || user?.fullName} &bull; {profile?.city || 'Sri Lanka'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            icon={<Building2 size={16} />}
            onClick={() => setIsProfileModalOpen(true)}
          >
            {profile ? 'Edit Business Profile' : 'Setup Profile'}
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handlePublishClick}
          >
            Create Food Listing
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Active Listings</span>
            <ShoppingBag size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {myListings.filter((l) => l.status === 'AVAILABLE').length} Available
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Pending Requests</span>
            <ClipboardList size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {pendingRequestsCount} Pending
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Reserved Pickups</span>
            <Clock size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {activeReservationsCount} Reserved
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Completed Rescues</span>
            <PackageCheck size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {collectionRequests.filter((r) => r.status === 'COLLECTED').length} Collected
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'listings' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'listings' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag size={18} />
          My Food Listings ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'requests' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ClipboardList size={18} />
          Collection Requests ({collectionRequests.length})
          {pendingRequestsCount > 0 && (
            <span
              style={{
                backgroundColor: '#f59e0b',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Food Listings View */}
      {activeTab === 'listings' && (
        <Card
          title="Restaurant Surplus Food Listings"
          subtitle="Listings automatically expire after their collection window. Only safe, unexpired surplus may be published."
          action={
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={handlePublishClick}>
              New Listing
            </Button>
          }
        >
          <Table
            columns={listingColumns}
            data={myListings}
            emptyMessage="No food listings published yet. Click 'Create Food Listing' to list daily surplus."
          />
        </Card>
      )}

      {/* Tab 2: Collection Requests View */}
      {activeTab === 'requests' && (
        <Card
          title="Charity Collection Requests"
          subtitle="Review requests from verified charities. Approving a request marks the listing RESERVED. Once picked up, mark COLLECTED to record kg impact."
          badge={
            pendingRequestsCount > 0 ? (
              <span className="badge badge-amber">{pendingRequestsCount} Awaiting Decision</span>
            ) : null
          }
        >
          <Table
            columns={requestColumns}
            data={collectionRequests}
            emptyMessage="No collection requests received yet from charities."
          />
        </Card>
      )}

      {/* Modal: Create Food Listing with Food-Safety Confirmation */}
      <Modal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        title="Create Restaurant Food Surplus Listing"
        subtitle="Restaurants must specify collection window and confirm food-safety standards before publishing."
        maxWidth="720px"
      >
        <form onSubmit={handleCreateListingSubmit}>
          <Input
            label="Listing Title / Food Item Name"
            required
            value={listingForm.title}
            onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
            placeholder="e.g. 40 Trays Vegetable & Egg Fried Rice"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Photo URL"
              value={listingForm.imageUrl}
              onChange={(e) => setListingForm({ ...listingForm, imageUrl: e.target.value })}
              placeholder="https://.../food-photo.jpg"
              helper="High-quality image of the packaged surplus"
            />
            <Input
              label="Food Category"
              required
              value={listingForm.foodCategory}
              onChange={(e) => setListingForm({ ...listingForm, foodCategory: e.target.value })}
              placeholder="e.g. Cooked Meals, Bakery, Produce"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quantity"
              type="number"
              step="0.1"
              required
              value={listingForm.quantity}
              onChange={(e) => setListingForm({ ...listingForm, quantity: e.target.value })}
              placeholder="e.g. 30"
            />
            <Input
              label="Unit of Measure"
              required
              value={listingForm.unit}
              onChange={(e) => setListingForm({ ...listingForm, unit: e.target.value })}
              placeholder="portions / kg / boxes"
            />
            <Select
              label="Suitability (Rule 7)"
              required
              options={[
                { value: 'HUMAN_CONSUMPTION', label: 'Human Consumption (Food-Grade)' },
                { value: 'ANIMAL_FEED', label: 'Animal Feed Only' },
              ]}
              value={listingForm.suitabilityType}
              onChange={(e) => setListingForm({ ...listingForm, suitabilityType: e.target.value })}
            />
          </div>

          <Textarea
            label="Preparation Details & Ingredients"
            rows={2}
            value={listingForm.description}
            onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
            placeholder="Prepared at 1:00 PM for lunch buffet, safely packed in foil containers..."
          />

          {/* Collection Window Fields */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-alt)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              margin: '1rem 0',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--color-primary-600)' }} />
              Collection Window & Expiry Constraints
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Pickup Start"
                type="datetime-local"
                required
                value={listingForm.pickupStart}
                onChange={(e) => setListingForm({ ...listingForm, pickupStart: e.target.value })}
              />
              <Input
                label="Pickup End (Auto-Expire)"
                type="datetime-local"
                required
                value={listingForm.pickupEnd}
                onChange={(e) => setListingForm({ ...listingForm, pickupEnd: e.target.value })}
              />
              <Input
                label="Food Expiry Date/Time"
                type="datetime-local"
                required
                value={listingForm.expiryDate}
                onChange={(e) => setListingForm({ ...listingForm, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Pickup Location & Dispatch Address"
            required
            value={listingForm.pickupAddress}
            onChange={(e) => setListingForm({ ...listingForm, pickupAddress: e.target.value })}
            placeholder="e.g. Kitchen Backdoor Dispatch, 2 Sir Chittampalam A Gardiner Mawatha"
          />

          {/* REQUIRED FOOD-SAFETY CONFIRMATION CHECKBOX */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginTop: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                required
                checked={listingForm.foodSafetyConfirmed}
                onChange={(e) => setListingForm({ ...listingForm, foodSafetyConfirmed: e.target.checked })}
                style={{
                  width: '18px',
                  height: '18px',
                  marginTop: '0.2rem',
                  accentColor: 'var(--color-primary-600)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ fontSize: '0.85rem', color: '#065f46', lineHeight: 1.5 }}>
                <strong>Required Food-Safety Confirmation (Rule 7):</strong> I hereby certify that this food was prepared under certified hygienic conditions, held at safe temperatures, and is wholesome and completely safe for consumption. I understand that listings automatically expire after the collection window.
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsListingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingListing}>
              Publish Food Listing
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Decline Request Reason */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Decline Request from ${selectedRequest?.charityName}`}
        subtitle="Explain why this request cannot be fulfilled at this time."
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmReject}>
          <Textarea
            label="Reason for Declining"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Pickup schedule conflicts with restaurant kitchen closing."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={processingAction}>
              Confirm Decline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Profile Setup/Edit */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={profile ? 'Edit Business Profile' : 'Create Business Profile'}
        subtitle="Admin verification is required before publishing food listings (Rule 2)."
        maxWidth="720px"
      >
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Business Name"
              required
              value={profileForm.businessName}
              onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
            />
            <Select
              label="Business Type"
              required
              options={BUSINESS_TYPES}
              value={profileForm.businessType}
              onChange={(e) => setProfileForm({ ...profileForm, businessType: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              required
              value={profileForm.registrationNumber}
              onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
            />
            <Input
              label="Supporting BR Document URL"
              required
              value={profileForm.documentUrl}
              onChange={(e) => setProfileForm({ ...profileForm, documentUrl: e.target.value })}
            />
          </div>
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
        title="Publishing Locked (Platform Rule 2)"
        subtitle="Only admin-verified establishments can publish surplus food listings"
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
              Platform Rule 2 requires that <strong>businesses must be admin-VERIFIED before they can publish</strong> food surplus listings. Please check back once administrators review your submitted BR documents.
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
