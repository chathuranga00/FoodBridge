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
  Search,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { profileApi, foodListingApi, foodRescueApi, groceryApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS, BUSINESS_TYPES, GROCERY_CATEGORIES } from '../../utils/constants'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  // Navigation tab: 'listings', 'requests', 'grocery-offers', 'redemptions'
  const isGroceryRole = user?.role === 'GROCERY'
  const [activeTab, setActiveTab] = useState(isGroceryRole ? 'grocery-offers' : 'listings')

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [collectionRequests, setCollectionRequests] = useState([])

  // Grocery Offers & Redemptions State
  const [myGroceryOffers, setMyGroceryOffers] = useState([])
  const [businessRedemptions, setBusinessRedemptions] = useState([])
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false)
  const [submittingGroceryOffer, setSubmittingGroceryOffer] = useState(false)

  // Redemption Verification & Confirmation State
  const [redemptionCodeInput, setRedemptionCodeInput] = useState('')
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [verifiedReservation, setVerifiedReservation] = useState(null)
  const [confirmingRedemption, setConfirmingRedemption] = useState(false)

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

  // Grocery Offer Form State
  const [groceryForm, setGroceryForm] = useState({
    title: '',
    category: 'Dairy & Eggs',
    description: '',
    imageUrl: '',
    originalPrice: '',
    discountedPrice: '',
    availableQuantity: '10',
    bestBeforeDate: '',
    pickupStart: '',
    pickupEnd: '',
    pickupAddress: '',
    safetyConfirmed: false,
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

        const defAddress = `${profileRes.data.addressLine1 || ''}, ${profileRes.data.city || ''}`
        setListingForm((prev) => ({
          ...prev,
          pickupAddress: defAddress,
          latitude: profileRes.data.latitude || 6.9271,
          longitude: profileRes.data.longitude || 79.8612,
        }))

        setGroceryForm((prev) => ({
          ...prev,
          pickupAddress: defAddress,
        }))

        // Load all data if verified
        if (profileRes.data.verificationStatus === 'VERIFIED') {
          await Promise.all([
            loadListingsAndRequests(),
            loadGroceryData(),
          ])
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

  const loadGroceryData = async () => {
    try {
      const [offersRes, redemptionsRes] = await Promise.all([
        groceryApi.getMyOffers(),
        groceryApi.getBusinessRedemptions(),
      ])
      setMyGroceryOffers(offersRes.data || [])
      setBusinessRedemptions(redemptionsRes.data || [])
    } catch (err) {
      console.error('Error fetching grocery offers or redemptions', err)
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

  const handleOpenGroceryModal = () => {
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
    } else {
      const now = new Date()
      const bb = new Date(now.getTime() + 48 * 3600000).toISOString().slice(0, 16)
      const start = new Date(now.getTime() + 30 * 60000).toISOString().slice(0, 16)
      const end = new Date(now.getTime() + 24 * 3600000).toISOString().slice(0, 16)

      setGroceryForm({
        title: '',
        category: 'Dairy & Eggs',
        description: '',
        imageUrl: '',
        originalPrice: '',
        discountedPrice: '',
        availableQuantity: '10',
        bestBeforeDate: bb,
        pickupStart: start,
        pickupEnd: end,
        pickupAddress: `${profile.addressLine1 || ''}, ${profile.city || ''}`,
        safetyConfirmed: false,
      })
      setIsGroceryModalOpen(true)
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

  const handleCreateGroceryOfferSubmit = async (e) => {
    e.preventDefault()
    if (!groceryForm.safetyConfirmed) {
      showToast('You must confirm product safety and best-before compliance.', 'error')
      return
    }

    const orig = parseFloat(groceryForm.originalPrice)
    const disc = parseFloat(groceryForm.discountedPrice)

    if (isNaN(orig) || isNaN(disc) || disc >= orig) {
      showToast('Discounted price must be lower than original price.', 'error')
      return
    }

    setSubmittingGroceryOffer(true)
    try {
      const payload = {
        title: groceryForm.title,
        category: groceryForm.category,
        description: groceryForm.description,
        imageUrl: groceryForm.imageUrl,
        originalPrice: orig,
        discountedPrice: disc,
        availableQuantity: parseInt(groceryForm.availableQuantity, 10),
        bestBeforeDate: new Date(groceryForm.bestBeforeDate).toISOString(),
        pickupStart: new Date(groceryForm.pickupStart).toISOString(),
        pickupEnd: new Date(groceryForm.pickupEnd).toISOString(),
        pickupAddress: groceryForm.pickupAddress,
        safetyConfirmed: true,
      }

      await groceryApi.createOffer(payload)
      showToast('Grocery discount deal published! Customers can now reserve it.', 'success')
      setIsGroceryModalOpen(false)
      loadGroceryData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish grocery offer', 'error')
    } finally {
      setSubmittingGroceryOffer(false)
    }
  }

  // Redemption verification & confirmation handlers
  const handleVerifyRedemptionCode = async (e) => {
    e?.preventDefault()
    if (!redemptionCodeInput.trim()) {
      showToast('Please enter a redemption code (e.g. GROC-XXXXXXXX)', 'error')
      return
    }

    setVerifyingCode(true)
    setVerifiedReservation(null)
    try {
      const res = await groceryApi.verifyRedemptionCode({
        redemptionCode: redemptionCodeInput.trim(),
      })
      setVerifiedReservation(res.data)
      showToast(`Verified reservation for ${res.data.offerTitle}!`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or unrecognized redemption code', 'error')
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleConfirmRedemption = async () => {
    if (!verifiedReservation) return

    setConfirmingRedemption(true)
    try {
      await groceryApi.confirmRedemption({
        redemptionCode: verifiedReservation.redemptionCode,
      })
      showToast(`Redemption confirmed! Handed off ${verifiedReservation.quantity} unit(s) to customer.`, 'success')
      setVerifiedReservation(null)
      setRedemptionCodeInput('')
      loadGroceryData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm redemption', 'error')
    } finally {
      setConfirmingRedemption(false)
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
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for declining the collection request.', 'error')
      return
    }

    setProcessingAction(true)
    try {
      await foodRescueApi.decideRequest(selectedRequest.id, {
        decision: 'REJECT',
        reason: rejectReason,
      })
      showToast(`Declined request from ${selectedRequest.charityName}.`, 'info')
      setIsRejectModalOpen(false)
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline request', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleMarkCollected = async (request) => {
    const defaultKg = (request.listingQuantity * 0.4).toFixed(1)
    const enteredKg = window.prompt(
      `Confirm charity physical collection for ${request.listingTitle}.\nEnter estimated net food weight in kg:`,
      defaultKg
    )

    if (enteredKg === null) return
    const parsedKg = parseFloat(enteredKg)
    if (isNaN(parsedKg) || parsedKg <= 0) {
      showToast('Please enter a valid positive weight in kilograms.', 'error')
      return
    }

    setProcessingAction(true)
    try {
      await foodRescueApi.markCollected(request.id, { quantityKg: parsedKg })
      showToast(`Collection confirmed! Impact recorded (${parsedKg} kg diverted from landfill).`, 'success')
      loadListingsAndRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm collection', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return 'N/A'
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return iso
    }
  }

  const formatTimeWindow = (start, end) => {
    if (!start || !end) return 'Not specified'
    try {
      const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const d = new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' })
      return `${d}, ${s} - ${e}`
    } catch {
      return 'Window specified'
    }
  }

  const pendingRequestsCount = collectionRequests.filter((r) => r.status === 'PENDING').length
  const activeReservationsCount = collectionRequests.filter((r) => r.status === 'ACCEPTED').length

  // Columns for listings
  const listingColumns = [
    {
      key: 'title',
      label: 'Food Item & Category',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{val}</div>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-sky" style={{ fontSize: '0.65rem' }}>{row.foodCategory}</span>
            <span>&bull;</span>
            <span>{row.suitabilityType === 'HUMAN_CONSUMPTION' ? 'Human Safe' : 'Animal Feed'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (val, row) => (
        <span style={{ fontWeight: 600 }}>
          {val} {row.unit}
        </span>
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
        let badgeClass = 'badge-emerald'
        let text = val
        if (val === 'RESERVED') {
          badgeClass = 'badge-sky'
          text = 'Reserved'
        } else if (val === 'COLLECTED') {
          badgeClass = 'badge-indigo'
          text = 'Collected'
        } else if (val === 'EXPIRED') {
          badgeClass = 'badge-gray'
          text = 'Expired'
        } else if (val === 'AVAILABLE') {
          badgeClass = 'badge-emerald'
          text = 'Available'
        }
        return <span className={`badge ${badgeClass}`}>{text}</span>
      },
    },
  ]

  // Columns for requests
  const requestColumns = [
    {
      key: 'listingTitle',
      label: 'Listing Requested',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{val}</div>
          <div className="text-xs text-muted">{row.listingQuantity} {row.listingUnit}</div>
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
              variant="outline"
              icon={<PackageCheck size={14} style={{ color: '#059669' }} />}
              onClick={() => handleMarkCollected(row)}
              loading={processingAction}
            >
              Mark Collected (Log kg)
            </Button>
          )
        }
        if (row.status === 'COLLECTED') {
          return (
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} style={{ color: '#059669' }} /> Completed
            </span>
          )
        }
        return <span className="text-xs text-muted">Declined</span>
      },
    },
  ]

  // Columns for grocery offers
  const groceryOfferColumns = [
    {
      key: 'title',
      label: 'Product Deal',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{val}</div>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span className="badge badge-sky" style={{ fontSize: '0.65rem' }}>{row.category}</span>
            <span>&bull;</span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>{row.discountPercentage}% OFF</span>
          </div>
        </div>
      ),
    },
    {
      key: 'discountedPrice',
      label: 'Pricing (LKR)',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--color-primary)' }}>Rs. {Number(val).toLocaleString()}</strong>
          <div className="text-xs text-muted" style={{ textDecoration: 'line-through' }}>
            Rs. {Number(row.originalPrice).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      key: 'availableQuantity',
      label: 'Stock Available',
      render: (val) => (
        <span className={`badge ${val > 0 ? (val > 3 ? 'badge-emerald' : 'badge-amber') : 'badge-rose'}`}>
          {val > 0 ? `${val} in stock` : 'Sold Out'}
        </span>
      ),
    },
    {
      key: 'bestBeforeDate',
      label: 'Best-Before Date',
      render: (val) => (
        <span className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={13} style={{ color: '#d97706' }} />
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'pickupStart',
      label: 'Pickup Window',
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
        let badgeClass = 'badge-emerald'
        if (val === 'SOLD_OUT') badgeClass = 'badge-rose'
        if (val === 'EXPIRED') badgeClass = 'badge-gray'
        if (val === 'CANCELLED') badgeClass = 'badge-amber'
        return <span className={`badge ${badgeClass}`}>{val}</span>
      },
    },
  ]

  // Columns for redemptions history
  const redemptionColumns = [
    {
      key: 'redemptionCode',
      label: 'Redemption Code',
      render: (code) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '0.95rem',
            backgroundColor: '#f1f5f9',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            color: 'var(--color-primary)',
          }}
        >
          {code}
        </span>
      ),
    },
    {
      key: 'offerTitle',
      label: 'Product Deal',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div className="text-xs text-muted">{row.quantity} unit(s) &bull; Rs. {Number(row.totalPrice).toLocaleString()}</div>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'Customer',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val || 'Customer'}</div>
          <div className="text-xs text-muted">{row.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-amber'
        if (val === 'REDEEMED') badgeClass = 'badge-emerald'
        if (val === 'EXPIRED') badgeClass = 'badge-gray'
        if (val === 'CANCELLED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{val}</span>
      },
    },
    {
      key: 'reservedAt',
      label: 'Timeline',
      render: (val, row) => (
        <div className="text-xs text-muted">
          <div>Reserved: {formatDate(val)}</div>
          {row.redeemedAt && <div style={{ color: '#059669', fontWeight: 600 }}>Redeemed: {formatDate(row.redeemedAt)}</div>}
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div style={{ padding: '4rem 0' }}>
        <Loader message="Loading business donor portal..." />
      </div>
    )
  }

  return (
    <div>
      {/* Rule 2 Verification Banners */}
      {!profile ? (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
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
                Verified Business ({profile.businessName})
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                Admin verified establishment &bull; Full publishing, food rescue, and grocery discount privileges active
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
                Your business details are under review by FoodBridge admins. Publishing food listings and offers is locked until approved.
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {isGroceryRole ? 'Grocery Deals & Operations' : 'Restaurant & Grocery Donor Portal'}
          </h1>
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
            variant="secondary"
            icon={<Tag size={16} />}
            onClick={handleOpenGroceryModal}
          >
            New Grocery Deal
          </Button>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handlePublishClick}
          >
            New Food Listing
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Active Grocery Deals</span>
            <Tag size={20} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {myGroceryOffers.filter((o) => o.status === 'AVAILABLE').length} Available
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Pending Redemptions</span>
            <Receipt size={20} style={{ color: '#0284c7' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {businessRedemptions.filter((r) => r.status === 'RESERVED').length} Ready
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="text-sm text-muted">Charity Requests</span>
            <ClipboardList size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {pendingRequestsCount} Pending
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
          onClick={() => setActiveTab('grocery-offers')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'grocery-offers' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'grocery-offers' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Tag size={18} />
          Grocery Deals & Offers ({myGroceryOffers.length})
        </button>

        <button
          onClick={() => setActiveTab('redemptions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'redemptions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'redemptions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Receipt size={18} />
          Redemptions & Code Scanner
          {businessRedemptions.filter((r) => r.status === 'RESERVED').length > 0 && (
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
              {businessRedemptions.filter((r) => r.status === 'RESERVED').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'listings' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'listings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag size={18} />
          Surplus Food Listings ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'requests' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ClipboardList size={18} />
          Charity Requests ({collectionRequests.length})
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

      {/* Tab: Grocery Offers */}
      {activeTab === 'grocery-offers' && (
        <Card
          title="Discounted Grocery Offers"
          subtitle="Publish near-date branded groceries at discounted rates. Stock is automatically decremented upon customer reservation."
          action={
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={handleOpenGroceryModal}>
              Publish New Offer
            </Button>
          }
        >
          <Table
            columns={groceryOfferColumns}
            data={myGroceryOffers}
            emptyMessage="No discounted grocery offers published yet. Click 'Publish New Offer' to start selling near-best-before stock."
          />
        </Card>
      )}

      {/* Tab: Redemptions & Code Scanner */}
      {activeTab === 'redemptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Code Entry Scanner Box */}
          <Card
            title="Customer Code Redemption & Till Verification"
            subtitle="Enter or scan the customer's unique redemption code (e.g. GROC-XXXXXXXX) to verify and confirm handoff."
          >
            <form onSubmit={handleVerifyRedemptionCode} style={{ maxWidth: '600px', display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Enter Customer Redemption Code"
                  placeholder="e.g. GROC-A7B8C9D0"
                  value={redemptionCodeInput}
                  onChange={(e) => setRedemptionCodeInput(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <Button type="submit" variant="primary" icon={<Search size={16} />} loading={verifyingCode}>
                Verify Code
              </Button>
            </form>

            {/* Verified Reservation Card */}
            {verifiedReservation && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid var(--color-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  maxWidth: '650px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Verified Reservation
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.25rem 0' }}>
                      {verifiedReservation.offerTitle}
                    </h3>
                    <span className="badge badge-sky">{verifiedReservation.offerCategory}</span>
                  </div>
                  <span
                    className={`badge ${verifiedReservation.status === 'RESERVED' ? 'badge-emerald' : 'badge-amber'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {verifiedReservation.status === 'RESERVED' ? 'Ready for Pickup' : verifiedReservation.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <div>
                    <span className="text-xs text-muted">Customer Name:</span>
                    <div style={{ fontWeight: 600 }}>{verifiedReservation.userName || 'Customer'}</div>
                    <div className="text-xs text-muted">{verifiedReservation.userEmail}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Reserved Units:</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{verifiedReservation.quantity} unit(s)</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Amount to Collect at Cashier:</span>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                      Rs. {Number(verifiedReservation.totalPrice).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Collection Window:</span>
                    <div className="text-xs">{formatTimeWindow(verifiedReservation.pickupStart, verifiedReservation.pickupEnd)}</div>
                  </div>
                </div>

                {verifiedReservation.status === 'RESERVED' ? (
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button
                      variant="primary"
                      icon={<CheckCircle2 size={16} />}
                      onClick={handleConfirmRedemption}
                      loading={confirmingRedemption}
                    >
                      Confirm Customer Hand-off & Redeem
                    </Button>
                    <Button variant="outline" onClick={() => setVerifiedReservation(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
                    This reservation is already {verifiedReservation.status.toLowerCase()} and cannot be redeemed again.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Redemptions History */}
          <Card
            title="Redemptions & Reservation Log"
            subtitle="Real-time log of customer reservations, redeemed orders, and released cancellations."
          >
            <Table
              columns={redemptionColumns}
              data={businessRedemptions}
              emptyMessage="No reservations or redemptions recorded yet."
            />
          </Card>
        </div>
      )}

      {/* Tab: Food Listings View */}
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

      {/* Tab: Collection Requests View */}
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

      {/* Modal: Publish Grocery Offer */}
      <Modal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        title="Publish Grocery Discount Offer"
        subtitle="Offer discounted products near their best-before date to reduce food waste and support families."
        maxWidth="750px"
      >
        <form onSubmit={handleCreateGroceryOfferSubmit}>
          {/* Best-Before vs Use-By Distinct Warning */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: '#78350f', lineHeight: 1.5 }}>
              <strong>Best-Before vs. Use-By Safety Warning:</strong>
              <div style={{ marginTop: '0.2rem' }}>
                "Best-Before" dates indicate optimal quality and flavor. Shelf-stable and packaged goods near or past this date are legal and safe to sell if stored properly. However, items with expired <strong>"Use-By"</strong> dates (perishables, chilled meats/fish) are strictly prohibited and unsafe.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name / Brand Title"
              required
              value={groceryForm.title}
              onChange={(e) => setGroceryForm({ ...groceryForm, title: e.target.value })}
              placeholder="e.g. Anchor Full Cream Milk Powder 400g"
            />
            <Select
              label="Category"
              required
              options={GROCERY_CATEGORIES.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))}
              value={groceryForm.category}
              onChange={(e) => setGroceryForm({ ...groceryForm, category: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Original Price (Rs.)"
              type="number"
              step="0.01"
              required
              value={groceryForm.originalPrice}
              onChange={(e) => setGroceryForm({ ...groceryForm, originalPrice: e.target.value })}
              placeholder="1000.00"
            />
            <Input
              label="Discounted Price (Rs.)"
              type="number"
              step="0.01"
              required
              value={groceryForm.discountedPrice}
              onChange={(e) => setGroceryForm({ ...groceryForm, discountedPrice: e.target.value })}
              placeholder="500.00"
            />
            <Input
              label="Quantity Available"
              type="number"
              required
              min="1"
              value={groceryForm.availableQuantity}
              onChange={(e) => setGroceryForm({ ...groceryForm, availableQuantity: e.target.value })}
              placeholder="10"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Best-Before Date"
              type="datetime-local"
              required
              value={groceryForm.bestBeforeDate}
              onChange={(e) => setGroceryForm({ ...groceryForm, bestBeforeDate: e.target.value })}
            />
            <Input
              label="Collection Start"
              type="datetime-local"
              required
              value={groceryForm.pickupStart}
              onChange={(e) => setGroceryForm({ ...groceryForm, pickupStart: e.target.value })}
            />
            <Input
              label="Collection End"
              type="datetime-local"
              required
              value={groceryForm.pickupEnd}
              onChange={(e) => setGroceryForm({ ...groceryForm, pickupEnd: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pickup Location / Address"
              required
              value={groceryForm.pickupAddress}
              onChange={(e) => setGroceryForm({ ...groceryForm, pickupAddress: e.target.value })}
              placeholder="Store branch address"
            />
            <Input
              label="Product Image URL (optional)"
              value={groceryForm.imageUrl}
              onChange={(e) => setGroceryForm({ ...groceryForm, imageUrl: e.target.value })}
              placeholder="https://.../product.jpg"
            />
          </div>

          <Textarea
            label="Product Description & Storage Instructions"
            value={groceryForm.description}
            onChange={(e) => setGroceryForm({ ...groceryForm, description: e.target.value })}
            placeholder="e.g. Unopened packaging, kept in dry cool storage. Sealed manufacturer seal."
            rows={2}
          />

          {/* Mandatory Food Safety Checkbox */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={groceryForm.safetyConfirmed}
                onChange={(e) => setGroceryForm({ ...groceryForm, safetyConfirmed: e.target.checked })}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                required
              />
              <span style={{ fontSize: '0.875rem', color: '#065f46', lineHeight: 1.4 }}>
                <strong>Mandatory Safety & Quality Confirmation:</strong> I verify that this product has been stored properly according to hygiene standards, its packaging is intact, and it is safe, legal, and eligible for consumption under best-before guidelines.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsGroceryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingGroceryOffer}>
              Publish Offer
            </Button>
          </div>
        </form>
      </Modal>

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
              placeholder="e.g. Prepared Meals, Bakery, Produce"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Suitability / Destination"
              required
              value={listingForm.suitabilityType}
              onChange={(e) => setListingForm({ ...listingForm, suitabilityType: e.target.value })}
              options={[
                { value: 'HUMAN_CONSUMPTION', label: 'Human Consumption (Strict Safety)' },
                { value: 'ANIMAL_FEED', label: 'Animal Welfare / Feed Only' },
              ]}
              helper="Rule 7: Enforces intended recipient"
            />
            <Input
              label="Quantity"
              type="number"
              step="0.1"
              required
              value={listingForm.quantity}
              onChange={(e) => setListingForm({ ...listingForm, quantity: e.target.value })}
              placeholder="e.g. 40"
            />
            <Input
              label="Unit"
              required
              value={listingForm.unit}
              onChange={(e) => setListingForm({ ...listingForm, unit: e.target.value })}
              placeholder="portions / kg / boxes"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Pickup Window Start"
              type="datetime-local"
              required
              value={listingForm.pickupStart}
              onChange={(e) => setListingForm({ ...listingForm, pickupStart: e.target.value })}
            />
            <Input
              label="Pickup Window End"
              type="datetime-local"
              required
              value={listingForm.pickupEnd}
              onChange={(e) => setListingForm({ ...listingForm, pickupEnd: e.target.value })}
              helper="Auto-expires if unclaimed"
            />
            <Input
              label="Food Expiry Date/Time"
              type="datetime-local"
              required
              value={listingForm.expiryDate}
              onChange={(e) => setListingForm({ ...listingForm, expiryDate: e.target.value })}
            />
          </div>

          <Input
            label="Pickup Address / Restaurant Location"
            required
            value={listingForm.pickupAddress}
            onChange={(e) => setListingForm({ ...listingForm, pickupAddress: e.target.value })}
          />

          <Textarea
            label="Detailed Description & Storage Condition"
            value={listingForm.description}
            onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
            placeholder="e.g. Leftover banquet buffet meals stored continuously above 65°C."
            rows={2}
          />

          {/* Mandatory Food-Safety Confirmation Checkbox */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={listingForm.foodSafetyConfirmed}
                onChange={(e) => setListingForm({ ...listingForm, foodSafetyConfirmed: e.target.checked })}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                required
              />
              <span style={{ fontSize: '0.875rem', color: '#065f46', lineHeight: 1.4 }}>
                <strong>Mandatory Food-Safety Confirmation:</strong> I confirm that this food has been prepared, packaged, and stored under sanitary conditions in compliance with Sri Lanka public health guidelines.
              </span>
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
        title="Decline Charity Collection Request"
        subtitle={`Please state why ${selectedRequest?.charityName || 'the charity'} cannot be accommodated.`}
      >
        <form onSubmit={handleConfirmReject}>
          <Textarea
            label="Reason for Declining"
            required
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
        subtitle="Only admin-verified establishments can publish surplus food listings or grocery offers"
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
              Platform Rule 2 requires that <strong>businesses must be admin-VERIFIED before they can publish</strong> listings or grocery discount offers. Please check back once administrators review your submitted BR documents.
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
