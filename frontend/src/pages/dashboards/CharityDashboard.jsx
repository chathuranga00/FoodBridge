import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Camera,
  ExternalLink,
  Eye,
  Calendar,
  Gift,
  Handshake,
  Lock,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Check,
  Truck,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import PartnershipTimeline from '../../components/common/PartnershipTimeline'
import PartnershipMessageThread from '../../components/common/PartnershipMessageThread'
import { profileApi, foodListingApi, foodRescueApi, campaignApi, contributionApi, partnershipApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS, CAMPAIGN_NEED_TYPES } from '../../utils/constants'

export default function CharityDashboard() {
  const navigate = useNavigate()
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

  // Campaigns State
  const [campaigns, setCampaigns] = useState([])
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false)
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false)
  const [selectedCampaignForUpdate, setSelectedCampaignForUpdate] = useState(null)
  const [submittingCampaign, setSubmittingCampaign] = useState(false)
  const [submittingDistribution, setSubmittingDistribution] = useState(false)

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    needType: 'FOOD',
    district: 'Colombo',
    targetQuantity: '',
    targetUnit: 'Meal Packs',
    startDate: '',
    endDate: '',
    coverImageUrl: '',
    evidenceUrl: '',
    paymentInstructions: '',
    handoverInstructions: '',
  })

  // Distribution Update Form State
  const [distributionForm, setDistributionForm] = useState({
    title: '',
    description: '',
    photoUrl: '',
    quantityDistributed: '',
    distributionDate: new Date().toISOString().split('T')[0],
  })

  // Contributions Tracking & Distribution State
  const [incomingContributions, setIncomingContributions] = useState([])
  const [loadingContributions, setLoadingContributions] = useState(false)
  const [contributionStatusFilter, setContributionStatusFilter] = useState('ALL')
  const [selectedContributionForConfirm, setSelectedContributionForConfirm] = useState(null)
  const [confirmNotes, setConfirmNotes] = useState('')
  const [submittingConfirm, setSubmittingConfirm] = useState(false)
  const [selectedContributionForDistribute, setSelectedContributionForDistribute] = useState(null)
  const [distributeForm, setDistributeForm] = useState({
    evidenceUrl: '',
    notes: '',
    distributionDate: new Date().toISOString().split('T')[0],
  })
  const [submittingDistribute, setSubmittingDistribute] = useState(false)
  const [viewEvidenceContribution, setViewEvidenceContribution] = useState(null)

  // CSR Business-to-Charity Partnerships State
  const [partnerships, setPartnerships] = useState([])
  const [loadingPartnerships, setLoadingPartnerships] = useState(false)
  const [selectedPartnership, setSelectedPartnership] = useState(null)
  const [isPartnershipDetailsOpen, setIsPartnershipDetailsOpen] = useState(false)
  const [partnershipStatusFilter, setPartnershipStatusFilter] = useState('ALL')
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false)
  const [submittingCounter, setSubmittingCounter] = useState(false)
  const [counterForm, setCounterForm] = useState({
    message: '',
    counterContributionType: '',
    counterMonetaryAmount: '',
    counterQuantity: '',
    counterUnit: '',
    counterItemDescription: '',
    counterRecognition: '',
  })
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [submittingComplete, setSubmittingComplete] = useState(false)
  const [completeForm, setCompleteForm] = useState({
    completionNotes: '',
    fieldProofUrl: '',
  })
  const [sendingThreadMessage, setSendingThreadMessage] = useState(false)

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

  const loadCampaigns = async () => {
    try {
      const res = await campaignApi.getMyCampaigns()
      setCampaigns(res.data || [])
    } catch (err) {
      console.error('Error fetching charity campaigns', err)
    }
  }

  const loadContributions = async () => {
    try {
      setLoadingContributions(true)
      const res = await contributionApi.getCharityContributions()
      setIncomingContributions(res.data || [])
    } catch (err) {
      console.error('Error fetching charity contributions', err)
    } finally {
      setLoadingContributions(false)
    }
  }

  const loadPartnerships = async () => {
    try {
      setLoadingPartnerships(true)
      const res = await partnershipApi.getMyCharityPartnerships()
      setPartnerships(res.data || [])
    } catch (err) {
      console.error('Error fetching charity partnerships', err)
    } finally {
      setLoadingPartnerships(false)
    }
  }

  const loadFeedAndRequests = async () => {
    try {
      const [availableRes, requestsRes, campaignsRes, contributionsRes, partnershipsRes] = await Promise.all([
        foodListingApi.getAvailable(),
        foodRescueApi.getCharityRequests(),
        campaignApi.getMyCampaigns(),
        contributionApi.getCharityContributions(),
        partnershipApi.getMyCharityPartnerships(),
      ])
      setAvailableListings(availableRes.data || [])
      setMyRequests(requestsRes.data || [])
      setCampaigns(campaignsRes.data || [])
      setIncomingContributions(contributionsRes.data || [])
      setPartnerships(partnershipsRes.data || [])
    } catch (err) {
      console.error('Error fetching available listings, requests, campaigns, or contributions', err)
    }
  }

  const handleViewPartnershipDetails = async (partnership) => {
    try {
      const res = await partnershipApi.getPartnershipById(partnership.id)
      setSelectedPartnership(res.data)
      setIsPartnershipDetailsOpen(true)
    } catch (err) {
      setSelectedPartnership(partnership)
      setIsPartnershipDetailsOpen(true)
    }
  }

  const refreshSelectedPartnership = async (id) => {
    try {
      const res = await partnershipApi.getPartnershipById(id)
      setSelectedPartnership(res.data)
      loadPartnerships()
      loadCampaigns()
      loadContributions()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendThreadMessage = async (msgText) => {
    if (!selectedPartnership) return
    setSendingThreadMessage(true)
    try {
      await partnershipApi.postMessage(selectedPartnership.id, { message: msgText })
      showToast('Message sent to business partner!', 'success')
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error')
    } finally {
      setSendingThreadMessage(false)
    }
  }

  const handleAcceptTerms = async (partnershipId) => {
    if (!window.confirm('Accept agreed partnership terms? This will lock the terms as immutable.')) return
    try {
      await partnershipApi.acceptPartnership(partnershipId, { confirmationNotes: 'Terms agreed by charity representative.' })
      showToast('Partnership terms AGREED and locked! Status updated to AGREED.', 'success')
      await refreshSelectedPartnership(partnershipId)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept terms', 'error')
    }
  }

  const handleDeclineProposal = async (partnershipId) => {
    const reason = window.prompt('Please provide a reason for declining this proposal:')
    if (!reason) return
    try {
      await partnershipApi.declinePartnership(partnershipId, { reason })
      showToast('Partnership declined.', 'info')
      await refreshSelectedPartnership(partnershipId)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to decline proposal', 'error')
    }
  }

  const handleOpenCounterModal = (partnership) => {
    setSelectedPartnership(partnership)
    setCounterForm({
      message: '',
      counterContributionType: partnership.contributionType || 'MONETARY_PLEDGE',
      counterMonetaryAmount: partnership.monetaryAmount || '',
      counterQuantity: partnership.quantity || '',
      counterUnit: partnership.unit || '',
      counterItemDescription: partnership.itemDescription || '',
      counterRecognition: partnership.requestedRecognition || '',
    })
    setIsCounterModalOpen(true)
  }

  const handleCounterSubmit = async (e) => {
    e.preventDefault()
    if (!counterForm.message) {
      showToast('Please provide a message explaining your counter-proposal.', 'error')
      return
    }
    setSubmittingCounter(true)
    try {
      const payload = {
        message: counterForm.message,
        counterContributionType: counterForm.counterContributionType,
        counterMonetaryAmount:
          counterForm.counterContributionType === 'MONETARY_PLEDGE' && counterForm.counterMonetaryAmount
            ? parseFloat(counterForm.counterMonetaryAmount)
            : null,
        counterQuantity:
          counterForm.counterContributionType !== 'MONETARY_PLEDGE' && counterForm.counterQuantity
            ? parseInt(counterForm.counterQuantity)
            : null,
        counterUnit: counterForm.counterUnit,
        counterItemDescription: counterForm.counterItemDescription,
        counterRecognition: counterForm.counterRecognition,
      }
      await partnershipApi.counterPartnership(selectedPartnership.id, payload)
      showToast('Counter-proposal sent to business successfully!', 'success')
      setIsCounterModalOpen(false)
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit counter-proposal', 'error')
    } finally {
      setSubmittingCounter(false)
    }
  }

  const handleOpenCompleteModal = (partnership) => {
    setSelectedPartnership(partnership)
    setCompleteForm({ completionNotes: '', fieldProofUrl: '' })
    setIsCompleteModalOpen(true)
  }

  const handleCompleteSubmit = async (e) => {
    e.preventDefault()
    if (!completeForm.completionNotes) {
      showToast('Please enter receipt verification notes.', 'error')
      return
    }
    setSubmittingComplete(true)
    try {
      await partnershipApi.completePartnership(selectedPartnership.id, {
        completionNotes: completeForm.completionNotes,
        fieldProofUrl: completeForm.fieldProofUrl || null,
      })
      showToast('Receipt confirmed! Partnership is COMPLETED and promotional recognition is now ACTIVE!', 'success')
      setIsCompleteModalOpen(false)
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete partnership', 'error')
    } finally {
      setSubmittingComplete(false)
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

  const handleCreateCampaignSubmit = async (e) => {
    e.preventDefault()
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
      return
    }

    const qty = parseInt(campaignForm.targetQuantity, 10)
    if (!qty || qty <= 0) {
      showToast('Please specify a valid positive target quantity.', 'error')
      return
    }

    if (!campaignForm.evidenceUrl?.trim()) {
      showToast('Supporting evidence document URL is required for admin verification (Rule 3).', 'error')
      return
    }

    setSubmittingCampaign(true)
    try {
      await campaignApi.createCampaign({
        ...campaignForm,
        targetQuantity: qty,
      })
      showToast('Community campaign submitted! Status is PENDING admin approval (Rule 3).', 'success')
      setIsCreateCampaignModalOpen(false)
      setCampaignForm({
        title: '',
        description: '',
        needType: 'FOOD',
        district: 'Colombo',
        targetQuantity: '',
        targetUnit: 'Meal Packs',
        startDate: '',
        endDate: '',
        coverImageUrl: '',
        evidenceUrl: '',
        paymentInstructions: '',
        handoverInstructions: '',
      })
      await loadCampaigns()
      setActiveTab('campaigns')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create campaign', 'error')
    } finally {
      setSubmittingCampaign(false)
    }
  }

  const handleOpenDistributionModal = (campaign) => {
    setSelectedCampaignForUpdate(campaign)
    setDistributionForm({
      title: '',
      description: '',
      photoUrl: '',
      quantityDistributed: '',
      distributionDate: new Date().toISOString().split('T')[0],
    })
    setIsDistributionModalOpen(true)
  }

  const handleDistributionSubmit = async (e) => {
    e.preventDefault()
    const qty = distributionForm.quantityDistributed ? parseInt(distributionForm.quantityDistributed, 10) : 0

    setSubmittingDistribution(true)
    try {
      await campaignApi.postCampaignUpdate(selectedCampaignForUpdate.id, {
        ...distributionForm,
        quantityDistributed: qty,
      })
      showToast('Field distribution proof posted successfully! Campaign progress updated.', 'success')
      setIsDistributionModalOpen(false)
      await loadCampaigns()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post distribution proof', 'error')
    } finally {
      setSubmittingDistribution(false)
    }
  }

  // Confirm Contribution Receipt Handlers
  const handleOpenConfirmModal = (contrib) => {
    setSelectedContributionForConfirm(contrib)
    setConfirmNotes('')
  }

  const handleConfirmSubmit = async (e) => {
    e.preventDefault()
    if (!selectedContributionForConfirm) return
    setSubmittingConfirm(true)
    try {
      await contributionApi.confirmContribution(selectedContributionForConfirm.id, {
        notes: confirmNotes.trim(),
      })
      showToast('Contribution confirmed as received! Campaign progress updated.', 'success')
      setSelectedContributionForConfirm(null)
      await loadContributions()
      await loadCampaigns()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm contribution receipt', 'error')
    } finally {
      setSubmittingConfirm(false)
    }
  }

  // Record Contribution Distribution Handlers
  const handleOpenDistributeModal = (contrib) => {
    setSelectedContributionForDistribute(contrib)
    setDistributeForm({
      evidenceUrl: '',
      notes: '',
      distributionDate: new Date().toISOString().split('T')[0],
    })
  }

  const handleDistributeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedContributionForDistribute) return
    if (!distributeForm.evidenceUrl?.trim()) {
      showToast('Please provide a photo or document URL showing distribution proof.', 'error')
      return
    }
    setSubmittingDistribute(true)
    try {
      await contributionApi.recordDistribution(selectedContributionForDistribute.id, {
        evidenceUrl: distributeForm.evidenceUrl.trim(),
        notes: distributeForm.notes.trim(),
        distributionDate: distributeForm.distributionDate,
      })
      showToast('Field distribution proof recorded! Contribution marked as DISTRIBUTED.', 'success')
      setSelectedContributionForDistribute(null)
      await loadContributions()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record distribution proof', 'error')
    } finally {
      setSubmittingDistribute(false)
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

  // Columns for Incoming Contributions Table
  const contributionColumns = [
    {
      key: 'contributor',
      label: 'Contributor',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {row.contributorName || 'Community Donor'}
            {row.contributorType === 'RESTAURANT' || row.contributorType === 'GROCERY' ? (
              <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>Corporate CSR</span>
            ) : (
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Individual</span>
            )}
          </div>
          <div className="text-xs text-muted">
            {row.contributorEmail} {row.contributorPhone ? `• ${row.contributorPhone}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'campaignTitle',
      label: 'Campaign',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.campaignTitle}</div>
          <div className="text-xs text-muted">
            <MapPin size={12} style={{ display: 'inline', color: '#dc2626', verticalAlign: '-1px' }} /> {row.campaignDistrict} District
          </div>
        </div>
      ),
    },
    {
      key: 'contributionType',
      label: 'Type & Amount / Quantity',
      render: (_, row) => (
        <div>
          {row.contributionType === 'MONETARY_PLEDGE' ? (
            <div>
              <span style={{ fontWeight: 800, color: '#047857' }}>
                LKR {row.monetaryAmount ? Number(row.monetaryAmount).toLocaleString() : '0'}
              </span>
              <div className="text-xs text-muted">Direct Bank Transfer</div>
            </div>
          ) : row.contributionType === 'FOOD_ITEMS' ? (
            <div>
              <span style={{ fontWeight: 700, color: '#0284c7' }}>
                {row.quantity ? `${row.quantity} ${row.unit || 'Units'}` : ''} {row.foodAmountKg ? `(${row.foodAmountKg} kg)` : ''}
              </span>
              <div className="text-xs text-muted">{row.itemDescription || 'Food Supplies'}</div>
            </div>
          ) : (
            <div>
              <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                {row.quantity} {row.unit || 'Units'}
              </span>
              <div className="text-xs text-muted">{row.itemDescription || row.contributionType}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-amber'
        let label = 'Pledged (Awaiting Receipt)'
        if (val === 'CONFIRMED') {
          badgeClass = 'badge-sky'
          label = 'Confirmed (In Custody)'
        } else if (val === 'DISTRIBUTED') {
          badgeClass = 'badge-emerald'
          label = 'Distributed (Verified Proof)'
        } else if (val === 'REJECTED' || val === 'CANCELLED') {
          badgeClass = 'badge-rose'
          label = val
        }
        return <span className={`badge ${badgeClass}`}>{label}</span>
      },
    },
    {
      key: 'createdAt',
      label: 'Pledged Date',
      render: (val) => (
        <span className="text-xs text-muted">
          {val ? new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {row.status === 'PLEDGED' && (
            <Button
              size="sm"
              variant="primary"
              icon={<CheckCircle2 size={13} />}
              onClick={() => handleOpenConfirmModal(row)}
            >
              Confirm Receipt
            </Button>
          )}
          {row.status === 'CONFIRMED' && (
            <Button
              size="sm"
              variant="primary"
              icon={<Camera size={13} />}
              onClick={() => handleOpenDistributeModal(row)}
            >
              Record Distribution
            </Button>
          )}
          {row.status === 'DISTRIBUTED' && (
            <Button
              size="sm"
              variant="outline"
              icon={<Eye size={13} />}
              onClick={() => setViewEvidenceContribution(row)}
            >
              View Proof
            </Button>
          )}
        </div>
      ),
    },
  ]

  const partnershipColumns = [
    {
      key: 'businessName',
      label: 'Corporate Sponsor & Brand',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={14} style={{ color: '#0284c7' }} />
            <span>{val}</span>
          </div>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.4rem', marginTop: '2px' }}>
            <span>Campaign: <strong>{row.campaignTitle}</strong></span>
          </div>
        </div>
      ),
    },
    {
      key: 'contributionType',
      label: 'Agreed / Proposed Terms',
      render: (type, row) => (
        <div>
          <span
            className={`badge ${
              type === 'MONETARY_PLEDGE' ? 'badge-sky' : type === 'FOOD_ITEMS' ? 'badge-amber' : 'badge-emerald'
            }`}
            style={{ fontSize: '0.7rem' }}
          >
            {type === 'MONETARY_PLEDGE' ? 'Money Pledge' : type === 'FOOD_ITEMS' ? 'Food Supplies' : 'Other Resources'}
          </span>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: '2px' }}>
            {type === 'MONETARY_PLEDGE' && row.monetaryAmount
              ? `Rs. ${Number(row.monetaryAmount).toLocaleString()}`
              : `${row.quantity} ${row.unit || 'units'}`}
          </div>
          {row.itemDescription && (
            <div className="text-xs text-muted" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.itemDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Workflow Status',
      render: (status) => {
        let badgeClass = 'badge-amber'
        if (status === 'AGREED') badgeClass = 'badge-sky'
        else if (status === 'DELIVERED') badgeClass = 'badge-purple'
        else if (status === 'COMPLETED') badgeClass = 'badge-emerald'
        else if (status === 'DECLINED' || status === 'CANCELLED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{status}</span>
      },
    },
    {
      key: 'recognitionActive',
      label: 'Promotional Recognition',
      render: (active, row) => {
        if (active) {
          return (
            <div>
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={12} /> Active ({row.agreedRecognition || row.requestedRecognition || 'Official Partner'})
              </span>
              <div className="text-xs text-muted" style={{ marginTop: '2px' }}>Publicly Visible</div>
            </div>
          )
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.75rem' }}>
            <Lock size={12} />
            <span>Locked (Awaiting your receipt confirmation)</span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<MessageSquare size={13} />}
            onClick={() => handleViewPartnershipDetails(row)}
          >
            Review & Thread
          </Button>
          {row.status === 'DELIVERED' && (
            <Button
              size="sm"
              variant="primary"
              icon={<CheckCircle2 size={13} />}
              onClick={() => handleOpenCompleteModal(row)}
            >
              Confirm Receipt
            </Button>
          )}
        </div>
      ),
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

        <button
          onClick={() => setActiveTab('campaigns')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'campaigns' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'campaigns' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Heart size={18} />
          Rural Relief Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'contributions' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'contributions' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Gift size={18} />
          Contributions & Distribution ({incomingContributions.length})
          {incomingContributions.filter((c) => c.status === 'PLEDGED').length > 0 && (
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
              {incomingContributions.filter((c) => c.status === 'PLEDGED').length} Pledged
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('partnerships')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'partnerships' ? '3px solid var(--color-primary-600)' : '3px solid transparent',
            color: activeTab === 'partnerships' ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Handshake size={18} />
          CSR Partnerships ({partnerships.length})
          {partnerships.filter(
            (p) =>
              p.status === 'PROPOSED' ||
              (p.status === 'COUNTERED' && p.lastCounterByRole === 'BUSINESS') ||
              p.status === 'DELIVERED'
          ).length > 0 && (
            <span
              style={{
                backgroundColor: '#7c3aed',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                fontWeight: 700,
              }}
            >
              {
                partnerships.filter(
                  (p) =>
                    p.status === 'PROPOSED' ||
                    (p.status === 'COUNTERED' && p.lastCounterByRole === 'BUSINESS') ||
                    p.status === 'DELIVERED'
                ).length
              }{' '}
              action needed
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

      {/* Tab 3: Rural Relief Campaigns */}
      {activeTab === 'campaigns' && (
        <div>
          {/* Header & Create Campaign Button */}
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Verified Rural Community Campaigns
              </h2>
              <p className="text-sm text-muted">
                Create transparent campaigns for food, clean water, books, or school supplies in remote districts. Campaigns require Admin verification (Rule 3) before going public.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                if (!profile || profile.verificationStatus !== 'VERIFIED') {
                  setIsBlockedModalOpen(true)
                } else {
                  setIsCreateCampaignModalOpen(true)
                }
              }}
            >
              Create Community Campaign
            </Button>
          </div>

          {/* Beneficiary Privacy Notice */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: '#14532d', lineHeight: 1.5 }}>
              <strong>Privacy Protection Rule:</strong> Locations are publicly restricted strictly to the <strong>District level</strong>. Never publish home addresses, NIC numbers, or vulnerable identities. Provide accountability through verified field distribution updates.
            </div>
          </div>

          {campaigns.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Heart size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No Community Campaigns Yet
                </div>
                <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
                  Launch your first verified community campaign to mobilize clean water, stationery, or school essentials for underserved districts.
                </p>
                <Button
                  variant="primary"
                  icon={<Plus size={15} />}
                  onClick={() => {
                    if (!profile || profile.verificationStatus !== 'VERIFIED') {
                      setIsBlockedModalOpen(true)
                    } else {
                      setIsCreateCampaignModalOpen(true)
                    }
                  }}
                >
                  Create First Campaign
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {campaigns.map((camp) => (
                <Card key={camp.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  {camp.coverImageUrl && (
                    <div style={{ height: '170px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1rem', backgroundColor: '#f1f5f9' }}>
                      <img
                        src={camp.coverImageUrl}
                        alt={camp.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-sky">{camp.needType}</span>
                    <span
                      className={`badge ${
                        camp.status === 'ACTIVE'
                          ? 'badge-emerald'
                          : camp.status === 'PENDING_APPROVAL'
                          ? 'badge-amber'
                          : camp.status === 'REJECTED'
                          ? 'badge-rose'
                          : 'badge-sky'
                      }`}
                    >
                      {camp.status === 'PENDING_APPROVAL' ? 'Pending Admin Review' : camp.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text)' }}>
                    {camp.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    <MapPin size={13} style={{ color: '#dc2626' }} />
                    <span>{camp.district} District</span>
                  </div>

                  <p
                    className="text-xs text-muted"
                    style={{
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {camp.description}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {camp.currentQuantity || 0} / {camp.targetQuantity} {camp.targetUnit || 'units'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>
                        {camp.progressPercentage}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, camp.progressPercentage || 0))}%`,
                          height: '100%',
                          backgroundColor: '#059669',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    {camp.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Camera size={14} />}
                        onClick={() => handleOpenDistributionModal(camp)}
                      >
                        Post Distribution Proof
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<ExternalLink size={14} />}
                      onClick={() => navigate(`/campaigns/${camp.id}`)}
                    >
                      View Campaign
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Contributions & Field Distribution Records */}
      {activeTab === 'contributions' && (
        <div>
          {/* Direct Handover & No-Payment Guarantee Banner */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={24} style={{ color: '#059669', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', color: '#065f46', lineHeight: 1.5 }}>
              <strong>Zero-Fee Direct Contribution Architecture (Rule 8):</strong> FoodBridge does not process payments or deduct transaction fees. Monetary contributions are deposited directly into your verified charity bank account, and physical goods are received at your depot. Pledges start in <strong>PLEDGED</strong> status and do not increment the campaign progress bar until you click <strong>Confirm Receipt</strong>. Once supplies are distributed in the field, upload photo evidence to complete transparency.
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-sm text-muted">Total Contributions</span>
                <Gift size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{incomingContributions.length} Total</div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-sm text-muted">Awaiting Receipt</span>
                <Clock size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                {incomingContributions.filter((c) => c.status === 'PLEDGED').length} Pledged
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-sm text-muted">In Custody / Ready</span>
                <CheckCircle2 size={20} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0369a1' }}>
                {incomingContributions.filter((c) => c.status === 'CONFIRMED').length} Confirmed
              </div>
            </Card>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-sm text-muted">Distributed to Field</span>
                <Camera size={20} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>
                {incomingContributions.filter((c) => c.status === 'DISTRIBUTED').length} Delivered
              </div>
            </Card>
          </div>

          {/* Filter Bar */}
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'PLEDGED', 'CONFIRMED', 'DISTRIBUTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setContributionStatusFilter(st)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: contributionStatusFilter === st ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: contributionStatusFilter === st ? 'var(--color-primary-50)' : '#ffffff',
                    color: contributionStatusFilter === st ? 'var(--color-primary-700)' : 'var(--color-text-muted)',
                  }}
                >
                  {st === 'ALL'
                    ? 'All Contributions'
                    : st === 'PLEDGED'
                    ? 'Pledged (Pending Receipt)'
                    : st === 'CONFIRMED'
                    ? 'Confirmed (Ready to Distribute)'
                    : 'Distributed with Evidence'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Clock size={14} />}
              onClick={loadContributions}
              loading={loadingContributions}
            >
              Refresh Records
            </Button>
          </div>

          {/* Contributions Table */}
          <Card>
            {incomingContributions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Gift size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No Incoming Contributions Yet
                </div>
                <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0 auto' }}>
                  When community members or CSR partners pledge aid to your verified campaigns, their records and handover instructions will appear here.
                </p>
              </div>
            ) : (
              <Table
                columns={contributionColumns}
                data={incomingContributions.filter((c) => {
                  if (contributionStatusFilter === 'ALL') return true
                  return c.status === contributionStatusFilter
                })}
              />
            )}
          </Card>
        </div>
      )}

      {/* Tab 5: CSR Partnerships Innovation */}
      {activeTab === 'partnerships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Innovation Educational Banner */}
          <div
            style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <Sparkles size={28} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#4c1d95' }}>
                  Business-to-Charity Partnership Management
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  Main Innovation
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#5b21b6', margin: '0.4rem 0 0.5rem 0', lineHeight: 1.5 }}>
                Review incoming corporate sponsorship proposals, negotiate terms collaboratively, lock binding agreements, and activate public promotional recognition once support is received.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#9f1239',
                  backgroundColor: '#ffe4e6',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                }}
              >
                <Lock size={13} />
                Corporate recognition badges are locked and will only activate after you confirm delivery receipt.
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Clock size={14} />}
              onClick={loadPartnerships}
              loading={loadingPartnerships}
            >
              Refresh
            </Button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-muted">Incoming Proposals</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
                {partnerships.filter((p) => p.status === 'PROPOSED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">In Negotiation</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>
                {partnerships.filter((p) => p.status === 'COUNTERED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Agreed / Delivered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>
                {partnerships.filter((p) => p.status === 'AGREED' || p.status === 'DELIVERED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Completed & Recognized</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                {partnerships.filter((p) => p.status === 'COMPLETED').length}
              </div>
            </Card>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'PROPOSED', 'COUNTERED', 'AGREED', 'DELIVERED', 'COMPLETED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setPartnershipStatusFilter(filter)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: partnershipStatusFilter === filter ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: partnershipStatusFilter === filter ? 'var(--color-primary)' : '#fff',
                  color: partnershipStatusFilter === filter ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {filter === 'ALL' ? 'All Partnerships' : filter}
              </button>
            ))}
          </div>

          {/* Table */}
          <Card
            title="Sponsorship Proposals & Agreements"
            subtitle="Engage with verified business donors to fund and equip your community campaigns."
          >
            {loadingPartnerships ? (
              <Loader message="Loading CSR partnerships..." />
            ) : partnerships.filter((p) => {
                if (partnershipStatusFilter === 'ALL') return true
                return p.status === partnershipStatusFilter
              }).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Handshake size={44} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No partnerships found in this status
                </div>
                <p className="text-xs text-muted" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  When verified businesses propose collaborations for your campaigns, they will be listed here for your review and negotiation.
                </p>
              </div>
            ) : (
              <Table
                columns={partnershipColumns}
                data={partnerships.filter((p) => {
                  if (partnershipStatusFilter === 'ALL') return true
                  return p.status === partnershipStatusFilter
                })}
                emptyMessage="No partnerships recorded."
              />
            )}
          </Card>
        </div>
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

      {/* Modal: Create Community Campaign */}
      <Modal
        isOpen={isCreateCampaignModalOpen}
        onClose={() => setIsCreateCampaignModalOpen(false)}
        title="Create Verified Community Campaign"
        subtitle="Campaigns start in PENDING_APPROVAL status and require platform admin review before publishing (Rule 3)."
        maxWidth="720px"
      >
        <form onSubmit={handleCreateCampaignSubmit}>
          {/* Privacy Note in Form */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div style={{ fontSize: '0.825rem', color: '#14532d', lineHeight: 1.4 }}>
              <strong>Beneficiary Dignity Protocol:</strong> Location will be published strictly at the <strong>District level</strong>. Do not enter specific residential addresses or identifying personal records of vulnerable recipients.
            </div>
          </div>

          <Input
            label="Campaign Title"
            required
            value={campaignForm.title}
            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
            placeholder="e.g. Clean Drinking Water Filters for 100 Rural Families"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Primary Need Type"
              required
              options={CAMPAIGN_NEED_TYPES.filter((t) => t.value !== 'ALL')}
              value={campaignForm.needType}
              onChange={(e) => setCampaignForm({ ...campaignForm, needType: e.target.value })}
            />
            <Select
              label="Target District"
              required
              options={SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: `${d} District` }))}
              value={campaignForm.district}
              onChange={(e) => setCampaignForm({ ...campaignForm, district: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Quantity (Count / Units)"
              type="number"
              min="1"
              required
              value={campaignForm.targetQuantity}
              onChange={(e) => setCampaignForm({ ...campaignForm, targetQuantity: e.target.value })}
              placeholder="e.g. 100"
            />
            <Input
              label="Target Unit Label"
              required
              value={campaignForm.targetUnit}
              onChange={(e) => setCampaignForm({ ...campaignForm, targetUnit: e.target.value })}
              placeholder="e.g. Ceramic Filters, Stationery Packs, Meal Packs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Campaign Start Date"
              type="date"
              value={campaignForm.startDate}
              onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
            />
            <Input
              label="Target Completion Date"
              type="date"
              value={campaignForm.endDate}
              onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Cover Photo URL (Optional)"
            value={campaignForm.coverImageUrl}
            onChange={(e) => setCampaignForm({ ...campaignForm, coverImageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            helper="A high quality banner image representing the community project."
          />

          <Input
            label="Supporting Evidence Document URL"
            required
            value={campaignForm.evidenceUrl}
            onChange={(e) => setCampaignForm({ ...campaignForm, evidenceUrl: e.target.value })}
            placeholder="https://storage.googleapis.com/... or official PDF link"
            helper="Mandatory for admin review (Rule 3): Grama Niladhari letter, Divisional Secretariat request, or School Principal endorsement."
          />

          <Textarea
            label="Detailed Campaign Description & Community Impact"
            required
            rows={4}
            value={campaignForm.description}
            onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
            placeholder="Describe the community context, current challenge, number of households/students affected, and logistics plan..."
          />

          <Textarea
            label="Direct Bank Transfer & Payment Instructions"
            rows={2}
            value={campaignForm.paymentInstructions}
            onChange={(e) => setCampaignForm({ ...campaignForm, paymentInstructions: e.target.value })}
            placeholder="e.g. Bank of Ceylon, Account: 12345678, Beneficiary: Sarvodaya Relief, Branch: Colombo Central. Ref: Filter Project"
            helper="FoodBridge has 0% platform fee. Monetary pledges are transferred directly to this NGO bank account."
          />

          <Textarea
            label="Physical Drop-off & Handover Instructions"
            rows={2}
            value={campaignForm.handoverInstructions}
            onChange={(e) => setCampaignForm({ ...campaignForm, handoverInstructions: e.target.value })}
            placeholder="e.g. Drop-off at Colombo Community Center, Mon-Fri 9AM-5PM, or coordinate courier with Coordinator Sunimal (077-1234567)."
            helper="Drop-off address, operating hours, and logistics contact for physical relief supplies."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsCreateCampaignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingCampaign}>
              Submit for Admin Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Post Field Distribution Update */}
      <Modal
        isOpen={isDistributionModalOpen}
        onClose={() => setIsDistributionModalOpen(false)}
        title={`Post Distribution Proof: ${selectedCampaignForUpdate?.title}`}
        subtitle={`Upload photographic handover receipts and report items delivered to ${selectedCampaignForUpdate?.district} District.`}
        maxWidth="600px"
      >
        <form onSubmit={handleDistributionSubmit}>
          <Input
            label="Update Title"
            required
            value={distributionForm.title}
            onChange={(e) => setDistributionForm({ ...distributionForm, title: e.target.value })}
            placeholder="e.g. Handover of 30 Water Filters at Community Hall"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Quantity Delivered (${selectedCampaignForUpdate?.targetUnit || 'Units'})`}
              type="number"
              min="0"
              value={distributionForm.quantityDistributed}
              onChange={(e) => setDistributionForm({ ...distributionForm, quantityDistributed: e.target.value })}
              placeholder="e.g. 30"
              helper="Increments campaign progress bar atomically."
            />
            <Input
              label="Distribution Date"
              type="date"
              required
              value={distributionForm.distributionDate}
              onChange={(e) => setDistributionForm({ ...distributionForm, distributionDate: e.target.value })}
            />
          </div>

          <Input
            label="Photo Proof URL"
            value={distributionForm.photoUrl}
            onChange={(e) => setDistributionForm({ ...distributionForm, photoUrl: e.target.value })}
            placeholder="https://images.unsplash.com/... or photo evidence URL"
            helper="Photographic proof of supplies delivered or community handover event."
          />

          <Textarea
            label="Handover Summary & Field Report"
            required
            rows={4}
            value={distributionForm.description}
            onChange={(e) => setDistributionForm({ ...distributionForm, description: e.target.value })}
            placeholder="Provide context on how items were delivered, acknowledgement from local teachers or community leaders, and next steps..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDistributionModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Camera size={15} />} loading={submittingDistribution}>
              Publish Field Proof
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Contribution Receipt */}
      <Modal
        isOpen={!!selectedContributionForConfirm}
        onClose={() => setSelectedContributionForConfirm(null)}
        title="Confirm Receipt of Contribution"
        subtitle={`Verify receipt of funds or physical supplies from ${selectedContributionForConfirm?.contributorName || 'Contributor'}`}
        maxWidth="550px"
      >
        {selectedContributionForConfirm && (
          <form onSubmit={handleConfirmSubmit}>
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '0.25rem' }}>
                {selectedContributionForConfirm.campaignTitle}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#1e3a8a' }}>
                Contributor: <strong>{selectedContributionForConfirm.contributorName}</strong> ({selectedContributionForConfirm.contributorEmail})
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 800, color: '#0369a1' }}>
                {selectedContributionForConfirm.contributionType === 'MONETARY_PLEDGE'
                  ? `LKR ${selectedContributionForConfirm.monetaryAmount ? Number(selectedContributionForConfirm.monetaryAmount).toLocaleString() : '0'} Direct Transfer`
                  : `${selectedContributionForConfirm.quantity} ${selectedContributionForConfirm.unit || 'Units'} ${selectedContributionForConfirm.itemDescription ? `— ${selectedContributionForConfirm.itemDescription}` : ''}`}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.825rem',
                color: '#065f46',
                marginBottom: '1.25rem',
              }}
            >
              <strong>Campaign Progress Impact:</strong> Confirming receipt will atomically increment the campaign's progress bar. Pledges never count towards campaign progress until confirmed by the receiving charity (Rule 8).
            </div>

            <Textarea
              label="Verification Notes & Receipt / Bank Reference"
              rows={3}
              value={confirmNotes}
              onChange={(e) => setConfirmNotes(e.target.value)}
              placeholder="e.g. Verified deposit in Commercial Bank A/C #12345, Ref #BOC-99881. Receipt #442 issued."
              helper="Record bank transaction reference or physical goods delivery voucher number."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedContributionForConfirm(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<CheckCircle2 size={15} />} loading={submittingConfirm}>
                Confirm Receipt & Update Progress
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Record Distribution Evidence */}
      <Modal
        isOpen={!!selectedContributionForDistribute}
        onClose={() => setSelectedContributionForDistribute(null)}
        title="Record Field Distribution Evidence"
        subtitle={`Upload handover proof for contribution #${selectedContributionForDistribute?.id?.substring(0, 8)}`}
        maxWidth="600px"
      >
        {selectedContributionForDistribute && (
          <form onSubmit={handleDistributeSubmit}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                {selectedContributionForDistribute.campaignTitle}
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Beneficiary District: {selectedContributionForDistribute.campaignDistrict} &bull; Contributed by: {selectedContributionForDistribute.contributorName}
              </div>
            </div>

            <Input
              label="Field Distribution Photo or Document URL"
              required
              value={distributeForm.evidenceUrl}
              onChange={(e) => setDistributeForm({ ...distributeForm, evidenceUrl: e.target.value })}
              placeholder="https://images.unsplash.com/... or cloud storage URL"
              helper="Photographic proof of supplies handed over or field activity record."
            />

            <Input
              label="Distribution Date"
              type="date"
              required
              value={distributeForm.distributionDate}
              onChange={(e) => setDistributeForm({ ...distributeForm, distributionDate: e.target.value })}
            />

            <Textarea
              label="Field Distribution Notes & Handover Summary"
              rows={3}
              value={distributeForm.notes}
              onChange={(e) => setDistributeForm({ ...distributeForm, notes: e.target.value })}
              placeholder="e.g. Distributed to 25 school children in Anuradhapura East, coordinated with Principal."
              helper="Provide details on community beneficiaries served (remember: preserve personal identities)."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedContributionForDistribute(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Camera size={15} />} loading={submittingDistribute}>
                Save Distribution Evidence
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: View Distribution Evidence */}
      <Modal
        isOpen={!!viewEvidenceContribution}
        onClose={() => setViewEvidenceContribution(null)}
        title="Field Distribution Evidence"
        subtitle={`Accountability proof for contribution #${viewEvidenceContribution?.id?.substring(0, 8)}`}
        maxWidth="600px"
      >
        {viewEvidenceContribution && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                {viewEvidenceContribution.campaignTitle}
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Target District: {viewEvidenceContribution.campaignDistrict} District &bull; Contributor: {viewEvidenceContribution.contributorName}
              </div>
            </div>

            {viewEvidenceContribution.distributionEvidenceUrl && (
              <div
                style={{
                  height: '240px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  marginBottom: '1rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <img
                  src={viewEvidenceContribution.distributionEvidenceUrl}
                  alt="Distribution Evidence"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted">Distributed Date:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {viewEvidenceContribution.distributedAt
                    ? new Date(viewEvidenceContribution.distributedAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recorded'}
                </span>
              </div>
              <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>
                Field Notes:
              </div>
              <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {viewEvidenceContribution.distributionNotes || 'Distribution confirmed by verified charity organization.'}
              </p>
            </div>

            {viewEvidenceContribution.distributionEvidenceUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <a
                  href={viewEvidenceContribution.distributionEvidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} /> Open Full Resolution Evidence Document
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setViewEvidenceContribution(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {/* Modal: Partnership Details, Timeline & Negotiation Thread */}
      <Modal
        isOpen={isPartnershipDetailsOpen}
        onClose={() => setIsPartnershipDetailsOpen(false)}
        title={selectedPartnership ? `Partnership: ${selectedPartnership.campaignTitle}` : 'Partnership Details'}
        subtitle={selectedPartnership ? `Corporate Sponsor: ${selectedPartnership.businessName} • Campaign: ${selectedPartnership.campaignTitle}` : ''}
        maxWidth="850px"
      >
        {selectedPartnership && (
          <div>
            {/* Visual Status Timeline */}
            <PartnershipTimeline
              currentStatus={selectedPartnership.status}
              agreedTermsSnapshot={selectedPartnership.agreedTermsSnapshot}
              recognitionActive={selectedPartnership.recognitionActive}
              agreedRecognition={selectedPartnership.agreedRecognition || selectedPartnership.requestedRecognition}
            />

            {/* If agreed terms snapshot exists, display locked snapshot */}
            {selectedPartnership.agreedTermsSnapshot ? (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800 }}>
                    <Lock size={16} style={{ color: '#0284c7' }} />
                    <span>Locked Immutable Agreement Terms</span>
                  </div>
                  <span className="badge badge-sky">Legally Binding</span>
                </div>
                <div className="grid grid-cols-3 gap-4" style={{ fontSize: '0.85rem' }}>
                  <div>
                    <span className="text-muted">Contribution:</span>
                    <div style={{ fontWeight: 700 }}>
                      {selectedPartnership.contributionType === 'MONETARY_PLEDGE'
                        ? `Rs. ${Number(selectedPartnership.monetaryAmount).toLocaleString()}`
                        : `${selectedPartnership.quantity} ${selectedPartnership.unit || 'units'}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted">Description:</span>
                    <div style={{ fontWeight: 600 }}>{selectedPartnership.itemDescription || 'Direct financial sponsorship'}</div>
                  </div>
                  <div>
                    <span className="text-muted">Agreed Recognition:</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {selectedPartnership.agreedRecognition || selectedPartnership.requestedRecognition || 'Official CSR Partner'}
                    </div>
                  </div>
                </div>
                {selectedPartnership.agreedAt && (
                  <div className="text-xs text-muted" style={{ marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                    Agreed and locked on: {new Date(selectedPartnership.agreedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              /* Pending / Countered Terms Box */
              <div
                style={{
                  backgroundColor: '#fdf4ff',
                  border: '1px solid #f0abfc',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#86198f', marginBottom: '0.5rem' }}>
                  Current Proposed Sponsorship Terms
                </div>
                <div className="grid grid-cols-3 gap-4" style={{ fontSize: '0.85rem' }}>
                  <div>
                    <span className="text-muted">Type & Amount:</span>
                    <div style={{ fontWeight: 700 }}>
                      {selectedPartnership.contributionType === 'MONETARY_PLEDGE'
                        ? `Rs. ${Number(selectedPartnership.monetaryAmount).toLocaleString()}`
                        : `${selectedPartnership.quantity} ${selectedPartnership.unit || 'units'}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted">Items:</span>
                    <div style={{ fontWeight: 600 }}>{selectedPartnership.itemDescription || 'Direct sponsorship'}</div>
                  </div>
                  <div>
                    <span className="text-muted">Requested Recognition:</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {selectedPartnership.requestedRecognition || 'Official Sponsor'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inbound Proposal / Counter Action Box for Charity */}
            {(selectedPartnership.status === 'PROPOSED' ||
              (selectedPartnership.status === 'COUNTERED' && selectedPartnership.lastCounterByRole === 'BUSINESS')) && (
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
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
                    Action Needed on Sponsor Proposal
                  </div>
                  <div className="text-xs text-muted">
                    Review terms above. You can accept to lock immutable agreement, counter-propose adjustments, or decline.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Check size={14} />}
                    onClick={() => handleAcceptTerms(selectedPartnership.id)}
                  >
                    Accept Terms
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<RotateCcw size={14} />}
                    onClick={() => handleOpenCounterModal(selectedPartnership)}
                  >
                    Counter-Propose
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeclineProposal(selectedPartnership.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            )}

            {/* Delivery Confirmation Prompt for Charity */}
            {selectedPartnership.status === 'DELIVERED' && (
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
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                    Sponsor Marked Support as DELIVERED
                  </div>
                  <div className="text-xs text-muted">
                    {selectedPartnership.deliveryNotes && (
                      <span style={{ display: 'block', margin: '3px 0' }}>
                        Dispatch Notes: <em>"{selectedPartnership.deliveryNotes}"</em>
                      </span>
                    )}
                    Confirm receipt of funds or supplies to complete the partnership and activate promotional recognition.
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle2 size={14} />}
                  onClick={() => handleOpenCompleteModal(selectedPartnership)}
                >
                  Confirm Receipt & Activate Badge
                </Button>
              </div>
            )}

            {/* Negotiation Message Thread */}
            <PartnershipMessageThread
              messages={selectedPartnership.messages || []}
              currentUserRole="CHARITY"
              onSendMessage={handleSendThreadMessage}
              sending={sendingThreadMessage}
              disabled={
                selectedPartnership.status === 'COMPLETED' ||
                selectedPartnership.status === 'DECLINED' ||
                selectedPartnership.status === 'CANCELLED'
              }
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button variant="outline" onClick={() => setIsPartnershipDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Charity Counter-Proposal */}
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Send Counter-Proposal to Sponsor"
        subtitle={`Negotiate terms with ${selectedPartnership?.businessName || 'Business'}`}
        maxWidth="650px"
      >
        <form onSubmit={handleCounterSubmit}>
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
            <Select
              label="Contribution Type"
              required
              options={[
                { value: 'MONETARY_PLEDGE', label: 'Financial Sponsorship (LKR)' },
                { value: 'FOOD_ITEMS', label: 'Food & Nutrition Supplies' },
                { value: 'OTHER_RESOURCES', label: 'Equipment or Other Resources' },
              ]}
              value={counterForm.counterContributionType}
              onChange={(e) => setCounterForm({ ...counterForm, counterContributionType: e.target.value })}
            />
            {counterForm.counterContributionType === 'MONETARY_PLEDGE' ? (
              <Input
                label="Monetary Amount (Rs.)"
                type="number"
                step="0.01"
                min="100"
                value={counterForm.counterMonetaryAmount}
                onChange={(e) => setCounterForm({ ...counterForm, counterMonetaryAmount: e.target.value })}
                placeholder="e.g. 75000.00"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={counterForm.counterQuantity}
                  onChange={(e) => setCounterForm({ ...counterForm, counterQuantity: e.target.value })}
                />
                <Input
                  label="Unit"
                  value={counterForm.counterUnit}
                  onChange={(e) => setCounterForm({ ...counterForm, counterUnit: e.target.value })}
                  placeholder="kg / kits"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
            <Input
              label="Item Description"
              value={counterForm.counterItemDescription}
              onChange={(e) => setCounterForm({ ...counterForm, counterItemDescription: e.target.value })}
              placeholder="e.g. 80 ration packs instead of 50"
            />
            <Input
              label="Agreed Recognition Tier"
              value={counterForm.counterRecognition}
              onChange={(e) => setCounterForm({ ...counterForm, counterRecognition: e.target.value })}
              placeholder="e.g. Platinum Partner"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Textarea
              label="Counter-Proposal Explanation Message"
              required
              rows={3}
              value={counterForm.message}
              onChange={(e) => setCounterForm({ ...counterForm, message: e.target.value })}
              placeholder="Explain to the sponsor why adjustments are requested..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsCounterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingCounter}>
              Send Counter-Proposal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirm Receipt & Complete Partnership */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Confirm Receipt & Activate Corporate Recognition"
        subtitle={`Verify receipt of support from ${selectedPartnership?.businessName || 'Business'}`}
        maxWidth="600px"
      >
        <form onSubmit={handleCompleteSubmit}>
          <div
            style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#5b21b6',
              lineHeight: 1.5,
            }}
          >
            <strong>Main Innovation Milestone:</strong> Confirming receipt will transition this partnership to <strong>COMPLETED</strong>, automatically record the contribution towards campaign progress, and <strong>activate the agreed promotional recognition badge</strong> on the sponsor's profile and campaign page!
          </div>

          <Textarea
            label="Receipt Verification Notes & Bank / Delivery Reference"
            required
            rows={4}
            value={completeForm.completionNotes}
            onChange={(e) => setCompleteForm({ ...completeForm, completionNotes: e.target.value })}
            placeholder="e.g. Verified deposit in Commercial Bank account #BOC-99881. Or: 50 ration packs received in good order at Colombo distribution hub."
            helper="Formal audit record of receipt verification."
          />

          <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
            <Input
              label="Field Proof / Receipt Image URL (Optional)"
              value={completeForm.fieldProofUrl}
              onChange={(e) => setCompleteForm({ ...completeForm, fieldProofUrl: e.target.value })}
              placeholder="https://images.unsplash.com/... or receipt proof URL"
              helper="Handover photo or stamped acknowledgement document."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<CheckCircle2 size={15} />} loading={submittingComplete}>
              Confirm Receipt & Activate Recognition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
