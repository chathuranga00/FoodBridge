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
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { profileApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS } from '../../utils/constants'

export default function CharityDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const [submittingProfile, setSubmittingProfile] = useState(false)

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    charityName: '',
    registrationNumber: '',
    description: '',
    operatingArea: 'Western Province',
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
          operatingArea: res.data.operatingArea || 'Western Province',
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
      }
    } catch (err) {
      console.error('Failed to load charity profile', err)
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

  const handleCreateCampaignClick = () => {
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
    } else {
      setIsCampaignModalOpen(true)
    }
  }

  const stats = [
    { label: 'Food Rescues Claimed', value: '38 Batches', icon: <ShoppingBag size={20} style={{ color: '#059669' }} /> },
    { label: 'Beneficiaries Served', value: `${profile?.capacityPeople ? profile.capacityPeople * 10 : 1500} People`, icon: <Users size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Verification Status', value: profile?.verificationStatus || 'NOT_SUBMITTED', icon: <ShieldCheck size={20} style={{ color: profile?.verificationStatus === 'VERIFIED' ? '#059669' : '#f59e0b' }} /> },
    { label: 'Verified Impact (Kg)', value: '2,400 kg', icon: <Award size={20} style={{ color: '#10b981' }} /> },
  ]

  const availableListings = [
    { id: '1', business: 'Hilton Colombo Kitchen', title: '50 Cooked Lunch Meal Packs', quantity: '50 Portions', expires: 'Today 3:30 PM', suitability: 'HUMAN_CONSUMPTION' },
    { id: '2', business: 'Keells Super (Union Place)', title: 'Fresh Vegetables & Greens Assortment', quantity: '30 KG', expires: 'Today 6:00 PM', suitability: 'HUMAN_CONSUMPTION' },
    { id: '3', business: 'Perera & Sons Bakery', title: 'Bread Loaves, Buns, Roti', quantity: '60 Units', expires: 'Today 7:00 PM', suitability: 'HUMAN_CONSUMPTION' },
  ]

  const availableColumns = [
    { key: 'business', label: 'Donor Business' },
    { key: 'title', label: 'Listing Title' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'expires', label: 'Pickup Before' },
    {
      key: 'action',
      label: 'Action',
      render: () => (
        <Button size="sm" variant="primary">
          Claim Batch
        </Button>
      ),
    },
  ]

  if (loading) {
    return <Loader text="Loading charity portal..." />
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
                Verified Charity Partner ({profile.charityName})
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Your NGO registration is verified by EcoConnect Admin. Full campaign creation and food rescue claims are active.
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
                Admin Reason: "{profile.verificationNotes || 'Please submit updated NGO registration credentials.'}"
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
                Charity Verification Pending (Rule 2)
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Your charity credentials for "{profile.charityName}" (NGO Reg: {profile.registrationNumber}) are under review by FoodBridge admins. Campaign publishing is locked until approved.
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

      {/* Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Charity Operations Portal</h1>
          <p className="text-sm text-muted">
            {profile?.charityName || user?.fullName} &bull; Operating Area: {profile?.operatingArea || 'Sri Lanka'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<Building2 size={16} />} onClick={() => setIsProfileModalOpen(true)}>
            {profile ? 'Charity Profile' : 'Setup Profile'}
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleCreateCampaignClick}>
            Create New Campaign
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="text-sm text-muted">{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Available Surplus Feed */}
      <Card
        title="Available Human-Edible Surplus (Ready for Pickup)"
        subtitle="Rule 7: Registered charities can claim verified food-grade surplus batches"
        badge={<span className="badge badge-emerald">Live Feed</span>}
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={availableColumns} data={availableListings} />
      </Card>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={profile ? 'Edit Charity Profile' : 'Create Charity Profile'}
        subtitle="NGO and charity profiles require registered legal details and supporting documents (Rule 2)."
        maxWidth="750px"
      >
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Charity / NGO Official Name"
              required
              value={profileForm.charityName}
              onChange={(e) => setProfileForm({ ...profileForm, charityName: e.target.value })}
              placeholder="e.g. Hope Community Kitchen Foundation"
            />
            <Input
              label="NGO Registration Number"
              required
              value={profileForm.registrationNumber}
              onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
              placeholder="e.g. NGO-GA-00921"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Operating Area / Communities Served"
              required
              value={profileForm.operatingArea}
              onChange={(e) => setProfileForm({ ...profileForm, operatingArea: e.target.value })}
              placeholder="e.g. Colombo North, Grandpass & Modara"
            />
            <Input
              label="Estimated Feeding Capacity (People)"
              type="number"
              value={profileForm.capacityPeople}
              onChange={(e) => setProfileForm({ ...profileForm, capacityPeople: e.target.value })}
              placeholder="e.g. 200"
            />
          </div>

          <Textarea
            label="Charity Mission & Description"
            rows={3}
            value={profileForm.description}
            onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
            placeholder="Describe your organization's mission, feeding programs, and target beneficiaries..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Supporting NGO Certificate Document URL"
              required
              value={profileForm.documentUrl}
              onChange={(e) => setProfileForm({ ...profileForm, documentUrl: e.target.value })}
              placeholder="https://.../ngo-certificate.pdf"
              helper="Admin reviews this document to grant verified charity status (Rule 2)"
            />
            <Input
              label="Logo Image URL"
              value={profileForm.logoUrl}
              onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
              placeholder="https://.../logo.png"
            />
          </div>

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
              placeholder="+94 11 234 5678"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address Line 1"
              required
              value={profileForm.addressLine1}
              onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
              placeholder="Building number and street"
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
              placeholder="e.g. Colombo 14"
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
              Submit Charity Profile for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Blocked by Rule 2 Modal */}
      <Modal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
        title="Campaign Publishing Locked (Platform Rule 2)"
        subtitle="Unverified charities cannot launch public campaigns"
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
                To safeguard charitable contributions and maintain trust, <strong>businesses and charities must be admin-VERIFIED before they can publish</strong> campaigns or requests.
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            {profile
              ? `Your charity verification status is currently ${profile.verificationStatus}. Our administration team is reviewing your NGO credentials.`
              : 'You have not submitted a charity profile yet. Please complete your profile to request verification.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" onClick={() => setIsBlockedModalOpen(false)}>
              Understood
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsBlockedModalOpen(false)
                setIsProfileModalOpen(true)
              }}
            >
              {profile ? 'Review Charity Profile' : 'Setup Profile Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
