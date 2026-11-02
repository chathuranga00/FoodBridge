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
  Upload,
  MapPin,
  Edit,
  ExternalLink,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { profileApi, foodListingApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS, BUSINESS_TYPES } from '../../utils/constants'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [myListings, setMyListings] = useState([])

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [submittingListing, setSubmittingListing] = useState(false)

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

  // Food Listing Form State
  const [listingForm, setListingForm] = useState({
    title: '',
    description: '',
    foodCategory: 'Prepared Meals',
    suitabilityType: 'HUMAN_CONSUMPTION',
    quantity: '',
    unit: 'portions',
    perishable: true,
    pickupStart: '',
    pickupEnd: '',
    expiryDate: '',
    dietaryFlags: 'Halal, Vegetarian available',
    storageInstructions: 'Keep refrigerated until pickup',
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

        // Also prefill listing pickup address from business address
        setListingForm((prev) => ({
          ...prev,
          pickupAddress: `${profileRes.data.addressLine1 || ''}, ${profileRes.data.city || ''}`,
          latitude: profileRes.data.latitude || 6.9271,
          longitude: profileRes.data.longitude || 79.8612,
        }))

        // If verified, fetch real listings
        if (profileRes.data.verificationStatus === 'VERIFIED') {
          try {
            const listingsRes = await foodListingApi.getMyListings()
            setMyListings(listingsRes.data || [])
          } catch (e) {
            console.error('Failed to load listings', e)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err)
    } finally {
      setLoading(false)
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
      setIsListingModalOpen(true)
    }
  }

  const handleCreateListingSubmit = async (e) => {
    e.preventDefault()
    setSubmittingListing(true)
    try {
      const now = new Date()
      const start = listingForm.pickupStart || new Date(now.getTime() + 30 * 60000).toISOString()
      const end = listingForm.pickupEnd || new Date(now.getTime() + 180 * 60000).toISOString()
      const exp = listingForm.expiryDate || new Date(now.getTime() + 360 * 60000).toISOString()

      const payload = {
        ...listingForm,
        quantity: parseFloat(listingForm.quantity),
        pickupStart: start,
        pickupEnd: end,
        expiryDate: exp,
        latitude: parseFloat(listingForm.latitude),
        longitude: parseFloat(listingForm.longitude),
      }

      await foodListingApi.createListing(payload)
      showToast('Surplus food listing published successfully!', 'success')
      setIsListingModalOpen(false)
      const listingsRes = await foodListingApi.getMyListings()
      setMyListings(listingsRes.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish listing', 'error')
    } finally {
      setSubmittingListing(false)
    }
  }

  const listingColumns = [
    { key: 'title', label: 'Listing Title' },
    { key: 'foodCategory', label: 'Category' },
    {
      key: 'suitabilityType',
      label: 'Suitability (Rule 7)',
      render: (val) => (
        <span className={`badge ${val === 'HUMAN_CONSUMPTION' ? 'badge-emerald' : 'badge-sky'}`}>
          {val === 'HUMAN_CONSUMPTION' ? 'Human Consumption' : 'Animal Feed'}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (_, row) => `${row.quantity} ${row.unit}`,
    },
    {
      key: 'expiryDate',
      label: 'Expires',
      render: (val) => (val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'AVAILABLE' ? 'badge-emerald' : 'badge-amber'}`}>
          {val}
        </span>
      ),
    },
  ]

  if (loading) {
    return <Loader text="Loading business dashboard..." />
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
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
            <CheckCircle2 size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Verified Business Partner ({profile.businessName})
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Your business registration is verified by EcoConnect Admin. Full surplus publishing privileges are active.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-emerald">Verified</span>
            <Button variant="outline" size="sm" icon={<Edit size={14} />} onClick={() => setIsProfileModalOpen(true)}>
              Edit Profile
            </Button>
          </div>
        </div>
      ) : profile.verificationStatus === 'REJECTED' ? (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b' }}>
            <XCircle size={24} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Verification Update Required (Rule 2)
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Admin Reason: "{profile.verificationNotes || 'Please review and re-submit valid registration documents.'}"
              </div>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setIsProfileModalOpen(true)}>
            Update & Resubmit
          </Button>
        </div>
      ) : (
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
                Verification Pending Review (Rule 2)
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Your business details for "{profile.businessName}" (Reg: {profile.registrationNumber}) are under review by FoodBridge admins. Publishing is locked until approved.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-amber">Pending Approval</span>
            <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)}>
              Edit Details
            </Button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Business Surplus Portal</h1>
          <p className="text-sm text-muted">
            {profile?.businessName || user?.fullName} &bull; {profile?.businessType || user?.role} &bull; {profile?.city || 'Sri Lanka'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<Building2 size={16} />} onClick={() => setIsProfileModalOpen(true)}>
            {profile ? 'Business Profile' : 'Setup Profile'}
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handlePublishClick}>
            List Surplus Food
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Active Listings</span>
            <ShoppingBag size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{myListings.length} Active</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Verification Status</span>
            <ShieldCheck size={20} style={{ color: profile?.verificationStatus === 'VERIFIED' ? '#059669' : '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {profile?.verificationStatus || 'NOT_SUBMITTED'}
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Operating District</span>
            <MapPin size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{profile?.district || 'Not Set'}</div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Supporting Doc</span>
            <FileText size={20} style={{ color: profile?.documentUrl ? '#10b981' : '#9ca3af' }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.documentUrl ? 'Uploaded' : 'None'}
          </div>
        </Card>
      </div>

      {/* Active Listings Table */}
      <Card
        title="Surplus Food Listings"
        subtitle="Rule 7: Enforce strict separation between human-edible food and animal feed"
        action={
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={handlePublishClick}>
            Publish Batch
          </Button>
        }
        style={{ marginBottom: '2rem' }}
      >
        <Table
          columns={listingColumns}
          data={myListings}
          emptyMessage="No surplus listings published yet. Click 'Publish Batch' to list surplus food."
        />
      </Card>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={profile ? 'Edit Business Profile' : 'Create Business Profile'}
        subtitle="Businesses must provide registration details and supporting documents for admin verification (Rule 2)."
        maxWidth="750px"
      >
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Business Legal / Trading Name"
              required
              value={profileForm.businessName}
              onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
              placeholder="e.g. Cinnamon Lakeside Kitchen"
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
              label="Business Registration (BR) Number"
              required
              value={profileForm.registrationNumber}
              onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
              placeholder="e.g. PV-00234199 or W/12345"
            />
            <Input
              label="Logo Image URL"
              value={profileForm.logoUrl}
              onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
              helper="Direct link to your business logo"
            />
          </div>

          <Textarea
            label="Business Description & Sustainability Commitment"
            rows={3}
            value={profileForm.description}
            onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
            placeholder="Brief overview of your establishment, daily surplus items, and community goals..."
          />

          <Input
            label="Supporting Document URL (BR Certificate / Health Inspection)"
            required
            value={profileForm.documentUrl}
            onChange={(e) => setProfileForm({ ...profileForm, documentUrl: e.target.value })}
            placeholder="https://.../business-registration-certificate.pdf"
            helper="Admin will inspect this document to verify your business legitimacy (Rule 2)"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Contact Person"
              value={profileForm.contactPerson}
              onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              value={profileForm.contactEmail}
              onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
            />
            <Input
              label="Contact Phone"
              value={profileForm.contactPhone}
              onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
              placeholder="+94 77 123 4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address Line 1"
              required
              value={profileForm.addressLine1}
              onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
              placeholder="Street number and name"
            />
            <Input
              label="Address Line 2 (Optional)"
              value={profileForm.addressLine2}
              onChange={(e) => setProfileForm({ ...profileForm, addressLine2: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={profileForm.city}
              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              placeholder="e.g. Colombo 03"
            />
            <Select
              label="District"
              required
              options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }))}
              value={profileForm.district}
              onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="0.0001"
              required
              value={profileForm.latitude}
              onChange={(e) => setProfileForm({ ...profileForm, latitude: e.target.value })}
            />
            <Input
              label="Longitude"
              type="number"
              step="0.0001"
              required
              value={profileForm.longitude}
              onChange={(e) => setProfileForm({ ...profileForm, longitude: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingProfile}>
              Submit Profile for Admin Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Blocked by Rule 2 Modal */}
      <Modal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Publishing Locked (Platform Rule 2)"
        subtitle="Unverified businesses cannot publish food listings"
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
            <div>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
                Strict Rule 2 Enforcement
              </div>
              <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5 }}>
                To ensure community food safety and prevent bogus donations, <strong>businesses and charities must be admin-VERIFIED before they can publish</strong> surplus food batches or offers.
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            {profile
              ? `Your current verification status is ${profile.verificationStatus}. Our administration team is reviewing your registration documents.`
              : 'You have not submitted a business profile yet. Complete your profile to request verification.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => setIsBlockedModalOpen(false)}>
              Got it
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsBlockedModalOpen(false)
                setIsProfileModalOpen(true)
              }}
            >
              {profile ? 'Review Business Profile' : 'Setup Profile Now'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Food Listing Modal */}
      <Modal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        title="Publish Surplus Food Batch"
        subtitle="Only safe, eligible food may be listed in accordance with Rule 7."
        maxWidth="700px"
      >
        <form onSubmit={handleCreateListingSubmit}>
          <Input
            label="Listing Title"
            required
            value={listingForm.title}
            onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
            placeholder="e.g. 20 Portions Fresh Rice & Curry Trays"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Suitability (Rule 7)"
              required
              options={[
                { value: 'HUMAN_CONSUMPTION', label: 'Human Consumption (Food Grade)' },
                { value: 'ANIMAL_FEED', label: 'Animal Feed Only (Not for Human Edibility)' },
              ]}
              value={listingForm.suitabilityType}
              onChange={(e) => setListingForm({ ...listingForm, suitabilityType: e.target.value })}
            />
            <Input
              label="Food Category"
              required
              value={listingForm.foodCategory}
              onChange={(e) => setListingForm({ ...listingForm, foodCategory: e.target.value })}
              placeholder="e.g. Cooked Meals, Bakery, Produce"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              step="0.1"
              required
              value={listingForm.quantity}
              onChange={(e) => setListingForm({ ...listingForm, quantity: e.target.value })}
              placeholder="e.g. 15"
            />
            <Input
              label="Unit of Measure"
              required
              value={listingForm.unit}
              onChange={(e) => setListingForm({ ...listingForm, unit: e.target.value })}
              placeholder="portions / kg / boxes"
            />
          </div>

          <Textarea
            label="Batch Description & Handling Instructions"
            rows={2}
            value={listingForm.description}
            onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
            placeholder="Describe preparation, ingredients, allergens, or packing..."
          />

          <Input
            label="Pickup Address"
            required
            value={listingForm.pickupAddress}
            onChange={(e) => setListingForm({ ...listingForm, pickupAddress: e.target.value })}
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsListingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingListing}>
              Publish Live Listing
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
