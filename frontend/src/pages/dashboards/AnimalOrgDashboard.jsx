import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  Dog,
  MapPin,
  Heart,
  Award,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Building2,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  Users,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Phone,
  Mail,
  Activity,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { animalWelfareApi, foodRescueApi, volunteerApi, impactApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS } from '../../utils/constants'

const DISTRICT_COORDINATES = {
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Gampaha: { lat: 7.084, lng: 79.9943 },
  Kalutara: { lat: 6.5854, lng: 79.9607 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Matale: { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  Galle: { lat: 6.0535, lng: 80.221 },
  Matara: { lat: 5.9549, lng: 80.555 },
  Hambantota: { lat: 6.1429, lng: 81.1212 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Kilinochchi: { lat: 9.3803, lng: 80.377 },
  Mannar: { lat: 8.981, lng: 79.9044 },
  Vavuniya: { lat: 8.7542, lng: 80.4982 },
  Mullaitivu: { lat: 9.2671, lng: 80.8142 },
  Batticaloa: { lat: 7.731, lng: 81.6747 },
  Ampara: { lat: 7.2912, lng: 81.6724 },
  Trincomalee: { lat: 8.5874, lng: 81.2152 },
  Kurunegala: { lat: 7.4863, lng: 80.3623 },
  Puttalam: { lat: 8.0408, lng: 79.8394 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037 },
  Polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  Badulla: { lat: 6.9934, lng: 81.055 },
  Monaragala: { lat: 6.8728, lng: 81.3507 },
  Ratnapura: { lat: 6.6828, lng: 80.4037 },
  Kegalle: { lat: 7.2513, lng: 80.3464 },
}

export default function AnimalOrgDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()

  const TAB_TO_PATH = {
    'locations': '/dashboard/animal-welfare/locations',
    'surplus-feed': '/dashboard/animal-welfare/feed-listings',
    'requirements': '/dashboard/animal-welfare/requirements',
    'volunteers': '/dashboard/animal-welfare/volunteers',
    'impact': '/dashboard/animal-welfare/impact',
  }

  const PATH_TO_TAB = {
    '/dashboard/animal-welfare': 'locations',
    '/dashboard/animal-welfare/': 'locations',
    '/dashboard/animal-welfare/locations': 'locations',
    '/dashboard/animal-welfare/feed-listings': 'surplus-feed',
    '/dashboard/animal-welfare/surplus-feed': 'surplus-feed',
    '/dashboard/animal-welfare/requirements': 'requirements',
    '/dashboard/animal-welfare/campaigns': 'requirements',
    '/dashboard/animal-welfare/contributions': 'requirements',
    '/dashboard/animal-welfare/volunteers': 'volunteers',
    '/dashboard/animal-welfare/impact': 'impact',
  }

  const [activeTab, setActiveTab] = useState(() => PATH_TO_TAB[window.location?.pathname] || 'locations')

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const targetPath = TAB_TO_PATH[tabId] || '/dashboard/animal-welfare'
    if (location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }

  // Synchronize route changes (sidebar clicks) to active tab
  useEffect(() => {
    const cleanPath = (location.pathname || '').replace(/\/+$/, '')
    const matchedTab = PATH_TO_TAB[cleanPath] || PATH_TO_TAB[location.pathname]
    if (matchedTab) {
      setActiveTab(matchedTab)
      loadAllData()
    }
  }, [location.pathname])
  const [loading, setLoading] = useState(true)

  // Data states
  const [profile, setProfile] = useState(null)
  const [locations, setLocations] = useState([])
  const [availableFeed, setAvailableFeed] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [requirements, setRequirements] = useState([])
  const [volunteerDrives, setVolunteerDrives] = useState([])
  const [feedSearchTerm, setFeedSearchTerm] = useState('')

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false)
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false)
  const [selectedFeedItem, setSelectedFeedItem] = useState(null)
  const [editingLocation, setEditingLocation] = useState(null)
  const [editingRequirement, setEditingRequirement] = useState(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    organizationName: '',
    registrationNumber: '',
    animalTypes: 'Dogs, Cats',
    shelterCapacity: 50,
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Colombo',
    district: 'Colombo',
    latitude: 6.9271,
    longitude: 79.8612,
  })

  const [locationForm, setLocationForm] = useState({
    locationName: '',
    animalType: 'Stray Dogs',
    estimatedCount: 20,
    feedingRoutine: 'Daily 6:00 PM',
    district: 'Colombo',
    city: 'Colombo 03',
    addressLine: '',
    latitude: 6.9271,
    longitude: 79.8612,
    urgencyLevel: 'NORMAL',
    notes: '',
  })

  const [claimForm, setClaimForm] = useState({
    quantityRequested: '',
    notes: '',
  })

  const [requirementForm, setRequirementForm] = useState({
    title: '',
    animalTypes: 'Dogs',
    suitableFeedTypes: 'Boiled rice, minced meat scraps, meat broth, commercial dry feed',
    prohibitedItems: 'NO cooked bones, onions, garlic, chocolate, or spoiled foods',
    dailyQuantityNeeded: 25,
    unit: 'kg',
    urgency: 'MEDIUM',
    deliveryOrPickupInstructions: 'Drop off at shelter gate between 2:00 PM and 6:00 PM daily',
  })

  const [volunteerForm, setVolunteerForm] = useState({
    title: '',
    description: '',
    district: 'Colombo',
    city: 'Colombo',
    addressLine: '',
    eventDate: '',
    startTime: '04:00 PM',
    endTime: '07:00 PM',
    estimatedHours: 3.0,
    volunteersNeeded: 4,
    skillsRequired: 'Compassion for animals, stray feeding, water supply replenishment',
    contactPhone: '',
  })

  const isVerified = profile?.verificationStatus === 'VERIFIED'

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    try {
      setLoading(true)

      // 1. Fetch Profile
      try {
        const pRes = await animalWelfareApi.getMyProfile()
        if (pRes.data) {
          setProfile(pRes.data)
          setProfileForm({
            organizationName: pRes.data.organizationName || '',
            registrationNumber: pRes.data.registrationNumber || '',
            animalTypes: pRes.data.animalTypes || 'Dogs, Cats',
            shelterCapacity: pRes.data.shelterCapacity || 50,
            contactPerson: pRes.data.contactPerson || '',
            contactEmail: pRes.data.contactEmail || user?.email || '',
            contactPhone: pRes.data.contactPhone || '',
            addressLine1: pRes.data.addressLine1 || '',
            addressLine2: pRes.data.addressLine2 || '',
            city: pRes.data.city || 'Colombo',
            district: pRes.data.district || 'Colombo',
            latitude: pRes.data.latitude || 6.9271,
            longitude: pRes.data.longitude || 79.8612,
          })
        }
      } catch (err) {
        console.warn('No existing animal org profile found:', err)
      }

      // 2. Fetch Locations
      try {
        const locRes = await animalWelfareApi.getMyLocations()
        setLocations(locRes.data || [])
      } catch (err) {
        console.warn('Failed to load my locations:', err)
      }

      // 3. Fetch Available Surplus Feed & My Requests (Rule 7)
      try {
        const feedRes = await animalWelfareApi.getAvailableFeed()
        setAvailableFeed(feedRes.data || [])

        const reqRes = await foodRescueApi.getAnimalOrgRequests()
        setMyRequests(reqRes.data || [])
      } catch (err) {
        console.warn('Failed to load surplus feed or requests:', err)
      }

      // 4. Fetch Requirements
      try {
        const reqRes = await animalWelfareApi.getMyRequirements()
        setRequirements(reqRes.data || [])
      } catch (err) {
        console.warn('Failed to load feed requirements:', err)
      }

      // 5. Fetch Volunteer Opportunities organized by this org / category ANIMAL_WELFARE
      try {
        const volRes = await volunteerApi.getOpportunities({ category: 'ANIMAL_WELFARE' })
        setVolunteerDrives(volRes.data || [])
      } catch (err) {
        console.warn('Failed to load volunteer drives:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Profile Update
  async function handleSaveProfile(e) {
    e.preventDefault()
    try {
      const res = await animalWelfareApi.updateMyProfile(profileForm)
      setProfile(res.data)
      setIsProfileModalOpen(false)
      showToast('Organization profile updated successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error')
    }
  }

  // Handle Location Registration / Update
  async function handleSaveLocation(e) {
    e.preventDefault()
    if (!isVerified) {
      showToast('Rule 2 Notice: Admin verification is required to publish feeding points.', 'error')
      return
    }

    try {
      if (editingLocation) {
        const res = await animalWelfareApi.updateLocation(editingLocation.id, locationForm)
        setLocations(locations.map((loc) => (loc.id === editingLocation.id ? res.data : loc)))
        showToast('Feeding location updated!', 'success')
      } else {
        const res = await animalWelfareApi.createLocation(locationForm)
        setLocations([res.data, ...locations])
        showToast('New community feeding location registered!', 'success')
      }
      setIsLocationModalOpen(false)
      setEditingLocation(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save location', 'error')
    }
  }

  // Delete Feeding Location
  async function handleDeleteLocation(id) {
    if (!window.confirm('Are you sure you want to remove this feeding location?')) return
    try {
      await animalWelfareApi.deleteLocation(id)
      setLocations(locations.filter((l) => l.id !== id))
      showToast('Feeding location removed.', 'info')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete location', 'error')
    }
  }

  // Handle Feed Claim Request (Rule 7)
  async function handleClaimFeed(e) {
    e.preventDefault()
    if (!selectedFeedItem) return

    if (!isVerified) {
      showToast('Rule 2 Notice: Only admin-VERIFIED animal organizations can request surplus food.', 'error')
      return
    }

    const qty = parseFloat(claimForm.quantityRequested)
    if (!qty || qty <= 0) {
      showToast('Please specify a valid quantity greater than 0', 'error')
      return
    }

    if (qty > selectedFeedItem.quantity) {
      showToast(`Requested quantity cannot exceed available ${selectedFeedItem.quantity} ${selectedFeedItem.unit}`, 'error')
      return
    }

    try {
      const res = await foodRescueApi.createRequest({
        listingId: selectedFeedItem.id,
        quantityRequested: qty,
        notes: claimForm.notes || 'For stray animal feeding colony support',
      })
      setMyRequests([res.data, ...myRequests])
      setIsClaimModalOpen(false)
      setSelectedFeedItem(null)
      setClaimForm({ quantityRequested: '', notes: '' })
      showToast('Feed collection request sent to restaurant!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send feed request', 'error')
    }
  }

  // Handle Post / Update Requirement
  async function handleSaveRequirement(e) {
    e.preventDefault()
    if (!isVerified) {
      showToast('Rule 2 Notice: Admin verification is required to post feed requirements.', 'error')
      return
    }

    try {
      if (editingRequirement) {
        const res = await animalWelfareApi.updateRequirement(editingRequirement.id, requirementForm)
        setRequirements(requirements.map((r) => (r.id === editingRequirement.id ? res.data : r)))
        showToast('Feed requirement updated.', 'success')
      } else {
        const res = await animalWelfareApi.createRequirement(requirementForm)
        setRequirements([res.data, ...requirements])
        showToast('Feed requirement published for donors and restaurants!', 'success')
      }
      setIsRequirementModalOpen(false)
      setEditingRequirement(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save requirement', 'error')
    }
  }

  // Handle Delete Requirement
  async function handleDeleteRequirement(id) {
    if (!window.confirm('Are you sure you want to delete this feed requirement?')) return
    try {
      await animalWelfareApi.deleteRequirement(id)
      setRequirements(requirements.filter((r) => r.id !== id))
      showToast('Requirement removed.', 'info')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete requirement', 'error')
    }
  }

  // Handle Create Volunteer Drive
  async function handleCreateVolunteerDrive(e) {
    e.preventDefault()
    if (!isVerified) {
      showToast('Rule 2 Notice: Admin verification is required to organize volunteer drives.', 'error')
      return
    }

    try {
      const res = await volunteerApi.createOpportunity({
        ...volunteerForm,
        category: 'ANIMAL_WELFARE',
        estimatedHours: parseFloat(volunteerForm.estimatedHours) || 2.0,
        volunteersNeeded: parseInt(volunteerForm.volunteersNeeded, 10) || 2,
        contactEmail: user?.email,
        contactPhone: volunteerForm.contactPhone || profile?.contactPhone,
      })
      setVolunteerDrives([res.data, ...volunteerDrives])
      setIsVolunteerModalOpen(false)
      showToast('Stray feeding volunteer drive posted successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create volunteer drive', 'error')
    }
  }

  // District auto-coordinate updates
  function handleLocationDistrictChange(district) {
    const coords = DISTRICT_COORDINATES[district] || { lat: 6.9271, lng: 79.8612 }
    setLocationForm((prev) => ({
      ...prev,
      district,
      city: prev.city || district,
      latitude: coords.lat,
      longitude: coords.lng,
    }))
  }

  function handleProfileDistrictChange(district) {
    const coords = DISTRICT_COORDINATES[district] || { lat: 6.9271, lng: 79.8612 }
    setProfileForm((prev) => ({
      ...prev,
      district,
      city: prev.city || district,
      latitude: coords.lat,
      longitude: coords.lng,
    }))
  }

  // Filter available feed items
  const filteredFeed = availableFeed.filter((item) => {
    if (!feedSearchTerm) return true
    const term = feedSearchTerm.toLowerCase()
    return (
      item.title?.toLowerCase().includes(term) ||
      item.businessName?.toLowerCase().includes(term) ||
      item.foodCategory?.toLowerCase().includes(term) ||
      item.pickupAddress?.toLowerCase().includes(term)
    )
  })

  // Impact Calculations
  const totalFeedRescuedKg = myRequests
    .filter((r) => r.status === 'COLLECTED')
    .reduce((sum, r) => sum + (parseFloat(r.quantityRequested) || 0), 0)

  const animalsFedEstimate = Math.round(totalFeedRescuedKg / 0.4) // ~0.4 kg per stray animal meal
  const activeSpotsCount = locations.filter((l) => l.isActive).length
  const completedRequestsCount = myRequests.filter((r) => r.status === 'COLLECTED').length

  const stats = [
    {
      label: 'Animal Feed Rescued',
      value: `${totalFeedRescuedKg.toFixed(1)} kg`,
      icon: <Dog size={22} style={{ color: '#ea580c' }} />,
    },
    {
      label: 'Feeding Spots Mapped',
      value: `${activeSpotsCount} Spots`,
      icon: <MapPin size={22} style={{ color: '#059669' }} />,
    },
    {
      label: 'Stray Animals Fed',
      value: `~${animalsFedEstimate} Feedings`,
      icon: <Heart size={22} style={{ color: '#e11d48' }} />,
    },
    {
      label: 'Completed Pickups',
      value: `${completedRequestsCount} Pickups`,
      icon: <Award size={22} style={{ color: '#0284c7' }} />,
    },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader size="lg" message="Loading Animal Welfare Portal..." />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Verification / Rule 2 Notice Banner */}
      {!isVerified && (
        <div
          style={{
            backgroundColor: profile?.verificationStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${profile?.verificationStatus === 'REJECTED' ? '#fecaca' : '#fef3c7'}`,
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <AlertCircle
            size={24}
            style={{
              color: profile?.verificationStatus === 'REJECTED' ? '#ef4444' : '#d97706',
              flexShrink: 0,
              marginTop: '2px',
            }}
          />
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: '0 0 0.35rem 0',
                color: profile?.verificationStatus === 'REJECTED' ? '#991b1b' : '#92400e',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              Platform Rule 2: Account Status — {profile?.verificationStatus || 'UNREGISTERED'}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: profile?.verificationStatus === 'REJECTED' ? '#b91c1c' : '#b45309',
                lineHeight: 1.5,
              }}
            >
              {profile?.verificationStatus === 'PENDING'
                ? 'Your animal welfare organization profile has been submitted and is currently pending verification by EcoConnect administrators. You can browse available surplus feed and prepare feeding location records. Registering public feeding points, posting feed requirements, and claiming surplus food will be unlocked once approved.'
                : profile?.verificationStatus === 'REJECTED'
                ? 'Your organization verification was rejected. Please review your registration details or contact admin support to re-verify.'
                : 'Please complete and submit your animal organization profile to begin the verification review process.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setIsProfileModalOpen(true)}>
            Edit Profile
          </Button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              {profile?.organizationName || 'Animal Welfare Portal'}
            </h1>
            <span
              className={`badge ${
                isVerified ? 'badge-emerald' : profile?.verificationStatus === 'REJECTED' ? 'badge-rose' : 'badge-amber'
              }`}
              style={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              {isVerified ? 'VERIFIED PARTNER' : profile?.verificationStatus || 'PENDING'}
            </span>
          </div>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem', margin: 0 }}>
            {profile?.district ? `${profile.district} District • ` : ''}
            {profile?.animalTypes ? `Supporting: ${profile.animalTypes} • ` : ''}
            Rule 7 Compliant Animal Feed Rescue & Stray Feeding Center
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={<Edit size={16} />} onClick={() => setIsProfileModalOpen(true)}>
            Org Profile
          </Button>
          <Button
            variant="secondary"
            icon={<MapPin size={16} />}
            onClick={() => {
              setEditingLocation(null)
              setLocationForm({
                locationName: '',
                animalType: 'Stray Dogs',
                estimatedCount: 20,
                feedingRoutine: 'Daily 6:00 PM',
                district: profile?.district || 'Colombo',
                city: profile?.city || 'Colombo',
                addressLine: '',
                latitude: profile?.latitude || 6.9271,
                longitude: profile?.longitude || 79.8612,
                urgencyLevel: 'NORMAL',
                notes: '',
              })
              setIsLocationModalOpen(true)
            }}
          >
            Add Feeding Spot
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setVolunteerForm({
                title: '',
                description: '',
                district: profile?.district || 'Colombo',
                city: profile?.city || 'Colombo',
                addressLine: '',
                eventDate: '',
                startTime: '04:00 PM',
                endTime: '07:00 PM',
                estimatedHours: 3.0,
                volunteersNeeded: 4,
                skillsRequired: 'Compassion for animals, stray feeding, water replenishment',
                contactPhone: profile?.contactPhone || '',
              })
              setIsVolunteerModalOpen(true)
            }}
          >
            New Feeding Drive
          </Button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span className="text-sm text-muted">{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('locations')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'locations' ? '3px solid var(--color-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'locations' ? 700 : 500,
            color: activeTab === 'locations' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
          }}
        >
          <MapPin size={16} /> Feeding Locations ({locations.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('surplus-feed')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'surplus-feed' ? '3px solid var(--color-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'surplus-feed' ? 700 : 500,
            color: activeTab === 'surplus-feed' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Dog size={16} /> Surplus Feed Batches ({availableFeed.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('requirements')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requirements' ? '3px solid var(--color-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'requirements' ? 700 : 500,
            color: activeTab === 'requirements' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Info size={16} /> Feed Requirements ({requirements.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('volunteers')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'volunteers' ? '3px solid var(--color-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'volunteers' ? 700 : 500,
            color: activeTab === 'volunteers' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Users size={16} /> Volunteer Feeding Drives ({volunteerDrives.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('impact')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'impact' ? '3px solid var(--color-primary)' : '3px solid transparent',
            fontWeight: activeTab === 'impact' ? 700 : 500,
            color: activeTab === 'impact' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap',
          }}
        >
          <Activity size={16} /> Impact & Pickups
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: Feeding Locations */}
      {/* ========================================================================= */}
      {activeTab === 'locations' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Community Feeding Points</h3>
              <p className="text-sm text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Mapped locations across Sri Lanka where stray animals, dogs, and cats are nourished by community caretakers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" variant="outline" icon={<ExternalLink size={14} />} onClick={() => navigate('/explore?type=FEEDING_LOCATION')}>
                View on Explore Map
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => {
                  setEditingLocation(null)
                  setLocationForm({
                    locationName: '',
                    animalType: 'Stray Dogs',
                    estimatedCount: 20,
                    feedingRoutine: 'Daily 6:00 PM',
                    district: profile?.district || 'Colombo',
                    city: profile?.city || 'Colombo',
                    addressLine: '',
                    latitude: profile?.latitude || 6.9271,
                    longitude: profile?.longitude || 79.8612,
                    urgencyLevel: 'NORMAL',
                    notes: '',
                  })
                  setIsLocationModalOpen(true)
                }}
              >
                Register Spot
              </Button>
            </div>
          </div>

          {locations.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <MapPin size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ margin: '0 0 0.25rem 0' }}>No Feeding Spots Registered Yet</h4>
                <p className="text-sm text-muted" style={{ maxWidth: 450, margin: '0 auto 1.25rem auto' }}>
                  Register stray animal packs, colonies, and feeding coordinates so local volunteers and feed donors can assist.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  Register First Feeding Spot
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {locations.map((loc) => (
                <Card key={loc.id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>{loc.locationName}</h4>
                      <span className="text-sm text-muted">
                        📍 {loc.city ? `${loc.city}, ` : ''}{loc.district} District
                      </span>
                    </div>
                    <span
                      className={`badge ${
                        loc.urgencyLevel === 'HIGH' ? 'badge-rose' : loc.urgencyLevel === 'MEDIUM' ? 'badge-amber' : 'badge-sky'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {loc.urgencyLevel || 'NORMAL'}
                    </span>
                  </div>

                  <div style={{ margin: '0.75rem 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>
                      <strong>Animals:</strong> {loc.estimatedCount ? `~${loc.estimatedCount} ` : ''}{loc.animalType}
                    </div>
                    <div>
                      <strong>Routine:</strong> {loc.feedingRoutine || 'Daily Feeding'}
                    </div>
                    {loc.addressLine && (
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {loc.addressLine}
                      </div>
                    )}
                    {loc.notes && (
                      <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                        "{loc.notes}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Coordinates: {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Edit size={12} />}
                      onClick={() => {
                        setEditingLocation(loc)
                        setLocationForm({
                          locationName: loc.locationName,
                          animalType: loc.animalType,
                          estimatedCount: loc.estimatedCount || 20,
                          feedingRoutine: loc.feedingRoutine || 'Daily 6:00 PM',
                          district: loc.district,
                          city: loc.city || '',
                          addressLine: loc.addressLine || '',
                          latitude: loc.latitude,
                          longitude: loc.longitude,
                          urgencyLevel: loc.urgencyLevel || 'NORMAL',
                          notes: loc.notes || '',
                        })
                        setIsLocationModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      icon={<Trash2 size={12} />}
                      onClick={() => handleDeleteLocation(loc.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Surplus Animal Feed (Rule 7 Separation) */}
      {/* ========================================================================= */}
      {activeTab === 'surplus-feed' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Available Surplus Food & Animal Feed</h3>
              <p className="text-sm text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Strict Rule 7 Partition: Only items marked as <strong>ANIMAL_FEED</strong> or approved by the donor restaurant as <strong>animal-suitable</strong> appear here.
              </p>
            </div>
            <div style={{ width: 280 }}>
              <Input
                placeholder="Search surplus feed..."
                value={feedSearchTerm}
                onChange={(e) => setFeedSearchTerm(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
          </div>

          <Card
            title="Available Animal-Suitable Surplus Batches"
            subtitle="Claim surplus feed for your shelter animals or mapped community stray colonies"
            badge={<span className="badge badge-sky">Rule 7 Partition</span>}
            style={{ marginBottom: '2rem' }}
          >
            {filteredFeed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Dog size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem auto' }} />
                <p className="text-sm text-muted">No surplus animal feed batches currently available in the platform partition.</p>
              </div>
            ) : (
              <Table
                columns={[
                  {
                    key: 'title',
                    label: 'Feed Title & Category',
                    render: (_, row) => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{row.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {row.foodCategory} • {row.pickupAddress}
                        </div>
                      </div>
                    ),
                  },
                  { key: 'businessName', label: 'Donor Business' },
                  {
                    key: 'suitability',
                    label: 'Suitability Type',
                    render: (_, row) => (
                      <span
                        className={`badge ${row.suitabilityType === 'ANIMAL_FEED' ? 'badge-sky' : 'badge-emerald'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {row.suitabilityType === 'ANIMAL_FEED' ? '🐾 Animal Feed Only' : '🍲 Animal-Suitable Human Surplus'}
                      </span>
                    ),
                  },
                  {
                    key: 'quantity',
                    label: 'Available Quantity',
                    render: (_, row) => (
                      <span style={{ fontWeight: 700, color: '#059669' }}>
                        {row.quantity} {row.unit}
                      </span>
                    ),
                  },
                  {
                    key: 'pickupEnd',
                    label: 'Pickup Window',
                    render: (_, row) => (
                      <span style={{ fontSize: '0.8rem' }}>
                        {row.pickupEnd ? new Date(row.pickupEnd).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Today'}
                      </span>
                    ),
                  },
                  {
                    key: 'action',
                    label: 'Action',
                    render: (_, row) => (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedFeedItem(row)
                          setClaimForm({
                            quantityRequested: row.quantity,
                            notes: `Feed collection request for ${profile?.organizationName || 'stray animals'}`,
                          })
                          setIsClaimModalOpen(true)
                        }}
                      >
                        Claim Feed
                      </Button>
                    ),
                  },
                ]}
                data={filteredFeed}
              />
            )}
          </Card>

          {/* Outgoing Requests History */}
          <Card
            title="My Food Collection Requests"
            subtitle="Track outgoing surplus requests sent to donor restaurants"
          >
            {myRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p className="text-sm text-muted">You have not submitted any feed collection requests yet.</p>
              </div>
            ) : (
              <Table
                columns={[
                  { key: 'listingTitle', label: 'Surplus Item' },
                  { key: 'businessName', label: 'Establishment' },
                  {
                    key: 'quantityRequested',
                    label: 'Quantity',
                    render: (_, row) => (
                      <span style={{ fontWeight: 600 }}>
                        {row.quantityRequested} {row.listingUnit}
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    label: 'Request Status',
                    render: (_, row) => {
                      let badgeClass = 'badge-amber'
                      if (row.status === 'ACCEPTED') badgeClass = 'badge-sky'
                      else if (row.status === 'COLLECTED') badgeClass = 'badge-emerald'
                      else if (row.status === 'REJECTED') badgeClass = 'badge-rose'

                      return <span className={`badge ${badgeClass}`}>{row.status}</span>
                    },
                  },
                  {
                    key: 'pickupWindow',
                    label: 'Pickup Window',
                    render: (_, row) => (
                      <span style={{ fontSize: '0.8rem' }}>
                        {row.pickupAddress ? `${row.pickupAddress}` : 'Scheduled with restaurant'}
                      </span>
                    ),
                  },
                  {
                    key: 'createdAt',
                    label: 'Date Sent',
                    render: (_, row) => (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    ),
                  },
                ]}
                data={myRequests}
              />
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Feed Requirements */}
      {/* ========================================================================= */}
      {activeTab === 'requirements' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Published Animal-Feed Requirements</h3>
              <p className="text-sm text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Publish acceptable feed types and prohibited ingredients so food businesses and community donors provide safe nutrition.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingRequirement(null)
                setRequirementForm({
                  title: '',
                  animalTypes: 'Dogs, Cats',
                  suitableFeedTypes: 'Boiled rice, minced meat scraps, mild chicken broth, commercial dog food',
                  prohibitedItems: 'NO cooked small bones, onions, garlic, chocolate, grapes, or expired items',
                  dailyQuantityNeeded: 25,
                  unit: 'kg',
                  urgency: 'MEDIUM',
                  deliveryOrPickupInstructions: 'Drop off at shelter or contact us for pickup',
                })
                setIsRequirementModalOpen(true)
              }}
            >
              Post Requirement
            </Button>
          </div>

          {requirements.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Info size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ margin: '0 0 0.25rem 0' }}>No Feed Requirements Published Yet</h4>
                <p className="text-sm text-muted" style={{ maxWidth: 450, margin: '0 auto 1.25rem auto' }}>
                  Publish what your shelter and stray feeding volunteers need to receive compatible surplus donations.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setIsRequirementModalOpen(true)}
                >
                  Publish First Requirement
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requirements.map((req) => (
                <Card key={req.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{req.title}</h4>
                      <span className="text-sm text-muted">
                        Animals: <strong>{req.animalTypes}</strong> • Daily Need: <strong>{req.dailyQuantityNeeded || 0} {req.unit}</strong>
                      </span>
                    </div>
                    <span
                      className={`badge ${
                        req.urgency === 'CRITICAL' ? 'badge-rose' : req.urgency === 'HIGH' ? 'badge-amber' : 'badge-sky'
                      }`}
                    >
                      Urgency: {req.urgency}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                      <div style={{ fontWeight: 700, color: '#047857', marginBottom: '0.25rem' }}>
                        ✅ Suitable Feed Items:
                      </div>
                      <p style={{ margin: 0, color: '#065f46' }}>{req.suitableFeedTypes}</p>
                    </div>

                    <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                      <div style={{ fontWeight: 700, color: '#b91c1c', marginBottom: '0.25rem' }}>
                        🚫 Prohibited / Harmful Ingredients:
                      </div>
                      <p style={{ margin: 0, color: '#991b1b' }}>{req.prohibitedItems || 'None specified'}</p>
                    </div>
                  </div>

                  {req.deliveryOrPickupInstructions && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <strong>Instructions:</strong> {req.deliveryOrPickupInstructions}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Edit size={12} />}
                      onClick={() => {
                        setEditingRequirement(req)
                        setRequirementForm({
                          title: req.title,
                          animalTypes: req.animalTypes,
                          suitableFeedTypes: req.suitableFeedTypes,
                          prohibitedItems: req.prohibitedItems || '',
                          dailyQuantityNeeded: req.dailyQuantityNeeded || 20,
                          unit: req.unit || 'kg',
                          urgency: req.urgency || 'MEDIUM',
                          deliveryOrPickupInstructions: req.deliveryOrPickupInstructions || '',
                        })
                        setIsRequirementModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      icon={<Trash2 size={12} />}
                      onClick={() => handleDeleteRequirement(req.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Volunteer Coordination */}
      {/* ========================================================================= */}
      {activeTab === 'volunteers' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Volunteer Stray Animal Feeding Drives</h3>
              <p className="text-sm text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Post volunteer sessions to feed stray dogs/cats, distribute fresh water, and support shelter care.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" variant="outline" icon={<ExternalLink size={14} />} onClick={() => navigate('/volunteer-activities?category=ANIMAL_WELFARE')}>
                Public Volunteer Page
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => setIsVolunteerModalOpen(true)}
              >
                Create Feeding Drive
              </Button>
            </div>
          </div>

          {volunteerDrives.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Users size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ margin: '0 0 0.25rem 0' }}>No Volunteer Drives Scheduled</h4>
                <p className="text-sm text-muted" style={{ maxWidth: 450, margin: '0 auto 1.25rem auto' }}>
                  Create feeding rounds and shelter support drives. Citizens across Sri Lanka can register and participate.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setIsVolunteerModalOpen(true)}
                >
                  Create Feeding Drive
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {volunteerDrives.map((drive) => (
                <Card key={drive.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}>{drive.title}</h4>
                    <span className={`badge ${drive.status === 'ACTIVE' ? 'badge-emerald' : 'badge-amber'}`}>
                      {drive.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted" style={{ margin: '0.25rem 0 0.75rem 0', lineHeight: 1.4 }}>
                    {drive.description}
                  </p>

                  <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                    <div>
                      📅 <strong>Date:</strong> {drive.eventDate} ({drive.startTime || 'TBD'} - {drive.endTime || 'TBD'})
                    </div>
                    <div>
                      📍 <strong>Location:</strong> {drive.city || drive.district}, {drive.district}
                    </div>
                    <div>
                      👥 <strong>Volunteers:</strong> {drive.volunteersRegistered} / {drive.volunteersNeeded} signed up
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/volunteer-activities')}
                    >
                      View Attendees & Log Hours
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Impact & Analytics */}
      {/* ========================================================================= */}
      {activeTab === 'impact' && (
        <div>
          <Card
            title="Animal Welfare Impact Accounting (Rule 4)"
            subtitle="Verified completed surplus collections that nourished community animals"
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', margin: '1rem 0' }}>
              <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                <span className="text-sm text-muted">Total Surplus Food Rescued</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c2410c', marginTop: '0.25rem' }}>
                  {totalFeedRescuedKg.toFixed(1)} kg
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9a3412' }}>Diverted from waste to animal care</span>
              </div>

              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #d1fae5' }}>
                <span className="text-sm text-muted">Stray Feedings Provided</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem' }}>
                  ~{animalsFedEstimate} Servings
                </div>
                <span style={{ fontSize: '0.75rem', color: '#065f46' }}>Estimated @ 0.40 kg per animal meal</span>
              </div>

              <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                <span className="text-sm text-muted">Active Feeding Points</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.25rem' }}>
                  {activeSpotsCount} Spots
                </div>
                <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>Publicly verifiable on Explore Map</span>
              </div>
            </div>
          </Card>

          <Card title="Completed Feed Collections">
            {completedRequestsCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p className="text-sm text-muted">No completed collections yet. Once a restaurant marks a pickup as COLLECTED, it is automatically accounted here.</p>
              </div>
            ) : (
              <Table
                columns={[
                  { key: 'listingTitle', label: 'Feed Item' },
                  { key: 'businessName', label: 'Donor Business' },
                  {
                    key: 'quantityRequested',
                    label: 'Weight Rescued',
                    render: (_, r) => <strong>{r.quantityRequested} {r.listingUnit}</strong>,
                  },
                  {
                    key: 'completedAt',
                    label: 'Collection Timestamp',
                    render: (_, r) => r.completedAt ? new Date(r.completedAt).toLocaleString() : 'Completed',
                  },
                  {
                    key: 'status',
                    label: 'Verification Status',
                    render: () => <span className="badge badge-emerald">VERIFIED (Rule 4)</span>,
                  },
                ]}
                data={myRequests.filter((r) => r.status === 'COLLECTED')}
              />
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Edit Profile */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Animal Organization Profile"
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <Input
              label="Organization Name *"
              required
              value={profileForm.organizationName}
              onChange={(e) => setProfileForm({ ...profileForm, organizationName: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Registration Number"
                value={profileForm.registrationNumber}
                onChange={(e) => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
              />
              <Input
                label="Shelter Capacity"
                type="number"
                value={profileForm.shelterCapacity}
                onChange={(e) => setProfileForm({ ...profileForm, shelterCapacity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <Input
              label="Animals Supported (e.g. Stray Dogs, Community Cats)"
              value={profileForm.animalTypes}
              onChange={(e) => setProfileForm({ ...profileForm, animalTypes: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Contact Person"
                value={profileForm.contactPerson}
                onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={profileForm.contactPhone}
                onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select
                label="District *"
                options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }))}
                value={profileForm.district}
                onChange={(e) => handleProfileDistrictChange(e.target.value)}
              />
              <Input
                label="City / Town *"
                required
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
            <Input
              label="Address Line 1 *"
              required
              value={profileForm.addressLine1}
              onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Register / Edit Feeding Location */}
      {/* ========================================================================= */}
      {isLocationModalOpen && (
        <Modal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          title={editingLocation ? 'Edit Feeding Location' : 'Register Community Feeding Point'}
        >
          <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <Input
              label="Feeding Spot Name *"
              required
              placeholder="e.g. Galle Face Stray Colony or Viharamahadevi Cat Feeder"
              value={locationForm.locationName}
              onChange={(e) => setLocationForm({ ...locationForm, locationName: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Animal Type *"
                required
                placeholder="e.g. Stray Dogs, Cats"
                value={locationForm.animalType}
                onChange={(e) => setLocationForm({ ...locationForm, animalType: e.target.value })}
              />
              <Input
                label="Estimated Animal Count"
                type="number"
                value={locationForm.estimatedCount}
                onChange={(e) => setLocationForm({ ...locationForm, estimatedCount: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Feeding Routine / Schedule"
                placeholder="e.g. Daily 6:00 PM"
                value={locationForm.feedingRoutine}
                onChange={(e) => setLocationForm({ ...locationForm, feedingRoutine: e.target.value })}
              />
              <Select
                label="Urgency Level"
                options={[
                  { value: 'NORMAL', label: 'Normal Routine' },
                  { value: 'MEDIUM', label: 'Medium Need' },
                  { value: 'HIGH', label: 'High Priority (Food Scarce)' },
                ]}
                value={locationForm.urgencyLevel}
                onChange={(e) => setLocationForm({ ...locationForm, urgencyLevel: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select
                label="District *"
                options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }))}
                value={locationForm.district}
                onChange={(e) => handleLocationDistrictChange(e.target.value)}
              />
              <Input
                label="City / Area"
                value={locationForm.city}
                onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
              />
            </div>
            <Input
              label="Address / Landmark Line"
              placeholder="e.g. Behind Railway Station platform 3"
              value={locationForm.addressLine}
              onChange={(e) => setLocationForm({ ...locationForm, addressLine: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Latitude *"
                type="number"
                step="0.0001"
                required
                value={locationForm.latitude}
                onChange={(e) => setLocationForm({ ...locationForm, latitude: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Longitude *"
                type="number"
                step="0.0001"
                required
                value={locationForm.longitude}
                onChange={(e) => setLocationForm({ ...locationForm, longitude: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Textarea
              label="Notes & Volunteer Instructions"
              placeholder="Special instructions, water point availability, friendly vs timid animals..."
              value={locationForm.notes}
              onChange={(e) => setLocationForm({ ...locationForm, notes: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsLocationModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingLocation ? 'Update Feeding Spot' : 'Register Feeding Spot'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Claim Surplus Feed (Rule 7) */}
      {/* ========================================================================= */}
      {isClaimModalOpen && selectedFeedItem && (
        <Modal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          title={`Claim Surplus Feed: ${selectedFeedItem.title}`}
        >
          <form onSubmit={handleClaimFeed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <div><strong>Donor Establishment:</strong> {selectedFeedItem.businessName}</div>
              <div><strong>Suitability:</strong> {selectedFeedItem.suitabilityType} {selectedFeedItem.animalSuitable ? '(Restaurant approved animal-suitable)' : ''}</div>
              <div><strong>Available Total:</strong> {selectedFeedItem.quantity} {selectedFeedItem.unit}</div>
              <div><strong>Pickup Location:</strong> {selectedFeedItem.pickupAddress}</div>
            </div>

            <Input
              label={`Quantity to Request (${selectedFeedItem.unit}) *`}
              type="number"
              step="0.1"
              max={selectedFeedItem.quantity}
              required
              value={claimForm.quantityRequested}
              onChange={(e) => setClaimForm({ ...claimForm, quantityRequested: e.target.value })}
            />

            <Textarea
              label="Intended Use & Feeding Colony Notes"
              placeholder="e.g. Will be used to feed 30 stray dogs at Galle Face pack tonight at 6:30 PM"
              value={claimForm.notes}
              onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsClaimModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Send size={14} />}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Post / Edit Requirement */}
      {/* ========================================================================= */}
      {isRequirementModalOpen && (
        <Modal
          isOpen={isRequirementModalOpen}
          onClose={() => setIsRequirementModalOpen(false)}
          title={editingRequirement ? 'Edit Feed Requirement' : 'Publish Animal-Feed Requirement'}
        >
          <form onSubmit={handleSaveRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <Input
              label="Requirement Title *"
              required
              placeholder="e.g. Shelter Daily Cooked Meals & Rice Supplies"
              value={requirementForm.title}
              onChange={(e) => setRequirementForm({ ...requirementForm, title: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Target Animals *"
                required
                placeholder="e.g. Dogs, Cats, Birds"
                value={requirementForm.animalTypes}
                onChange={(e) => setRequirementForm({ ...requirementForm, animalTypes: e.target.value })}
              />
              <Select
                label="Urgency"
                options={[
                  { value: 'LOW', label: 'Low Urgency' },
                  { value: 'MEDIUM', label: 'Medium Priority' },
                  { value: 'HIGH', label: 'High Priority' },
                  { value: 'CRITICAL', label: 'Critical Shortage' },
                ]}
                value={requirementForm.urgency}
                onChange={(e) => setRequirementForm({ ...requirementForm, urgency: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Daily Quantity Needed"
                type="number"
                value={requirementForm.dailyQuantityNeeded}
                onChange={(e) => setRequirementForm({ ...requirementForm, dailyQuantityNeeded: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Unit"
                value={requirementForm.unit}
                onChange={(e) => setRequirementForm({ ...requirementForm, unit: e.target.value })}
              />
            </div>

            <Textarea
              label="Suitable Feed Items * (Rule 7)"
              required
              placeholder="List foods that can be safely accepted (e.g. boiled rice, minced meat trimmings, broth, dry food)"
              value={requirementForm.suitableFeedTypes}
              onChange={(e) => setRequirementForm({ ...requirementForm, suitableFeedTypes: e.target.value })}
            />

            <Textarea
              label="Prohibited / Harmful Items"
              placeholder="List items that must NEVER be donated (e.g. cooked chicken bones, onions, garlic, spices, moldy items)"
              value={requirementForm.prohibitedItems}
              onChange={(e) => setRequirementForm({ ...requirementForm, prohibitedItems: e.target.value })}
            />

            <Input
              label="Delivery / Drop-Off Instructions"
              placeholder="e.g. Gate drop-off between 3 PM and 6 PM"
              value={requirementForm.deliveryOrPickupInstructions}
              onChange={(e) => setRequirementForm({ ...requirementForm, deliveryOrPickupInstructions: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsRequirementModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingRequirement ? 'Update Requirement' : 'Publish Requirement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Create Volunteer Drive */}
      {/* ========================================================================= */}
      {isVolunteerModalOpen && (
        <Modal
          isOpen={isVolunteerModalOpen}
          onClose={() => setIsVolunteerModalOpen(false)}
          title="Organize Volunteer Stray Feeding Drive"
        >
          <form onSubmit={handleCreateVolunteerDrive} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <Input
              label="Drive Title *"
              required
              placeholder="e.g. Evening Colombo Promenade Stray Feeding Round"
              value={volunteerForm.title}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, title: e.target.value })}
            />

            <Textarea
              label="Drive Description *"
              required
              placeholder="Describe what volunteers will be doing (e.g. assembling rice/broth bowls, placing water bowls, checking on stray puppies)"
              value={volunteerForm.description}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, description: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select
                label="District *"
                options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d }))}
                value={volunteerForm.district}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, district: e.target.value })}
              />
              <Input
                label="City / Assembly Area *"
                required
                value={volunteerForm.city}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, city: e.target.value })}
              />
            </div>

            <Input
              label="Assembly Address / Landmark *"
              required
              placeholder="e.g. Old Parliament Ground Feeder Bench"
              value={volunteerForm.addressLine}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, addressLine: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Event Date *"
                type="date"
                required
                value={volunteerForm.eventDate}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, eventDate: e.target.value })}
              />
              <Input
                label="Start Time"
                value={volunteerForm.startTime}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                value={volunteerForm.endTime}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, endTime: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Volunteers Needed *"
                type="number"
                min="1"
                required
                value={volunteerForm.volunteersNeeded}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, volunteersNeeded: e.target.value })}
              />
              <Input
                label="Estimated Hours"
                type="number"
                step="0.5"
                value={volunteerForm.estimatedHours}
                onChange={(e) => setVolunteerForm({ ...volunteerForm, estimatedHours: e.target.value })}
              />
            </div>

            <Input
              label="Volunteer Skills / What to Bring"
              value={volunteerForm.skillsRequired}
              onChange={(e) => setVolunteerForm({ ...volunteerForm, skillsRequired: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsVolunteerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Post Feeding Drive
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
