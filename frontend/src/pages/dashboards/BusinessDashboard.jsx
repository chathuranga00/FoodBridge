import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
  Heart,
  Camera,
  Award,
  Handshake,
  Lock,
  MessageSquare,
  Send,
  Truck,
  Sparkles,
  CreditCard,
  Zap,
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
import { profileApi, foodListingApi, foodRescueApi, groceryApi, contributionApi, partnershipApi, campaignApi, impactApi, promotionApi, subscriptionApi } from '../../api/client'
import ImpactAnalyticsView from '../../components/impact/ImpactAnalyticsView'
import { SRI_LANKA_DISTRICTS, BUSINESS_TYPES, GROCERY_CATEGORIES } from '../../utils/constants'

export default function BusinessDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()

  const isGroceryRole = user?.role === 'GROCERY'

  const TAB_TO_PATH = {
    'grocery-offers': '/dashboard/business/grocery-offers',
    'redemptions': '/dashboard/business/redemptions',
    'listings': '/dashboard/business/listings',
    'requests': '/dashboard/business/requests',
    'csr-contributions': '/dashboard/business/csr-contributions',
    'csr-partnerships': '/dashboard/business/csr-partnerships',
    'impact': '/dashboard/business/impact',
    'promotions': '/dashboard/business/promotions',
    'subscriptions': '/dashboard/business/subscriptions',
  }

  const PATH_TO_TAB = {
    '/dashboard/business': isGroceryRole ? 'grocery-offers' : 'listings',
    '/dashboard/business/': isGroceryRole ? 'grocery-offers' : 'listings',
    '/dashboard/business/listings': 'listings',
    '/dashboard/business/grocery-offers': 'grocery-offers',
    '/dashboard/business/redemptions': 'redemptions',
    '/dashboard/business/coupons': 'redemptions',
    '/dashboard/business/requests': 'requests',
    '/dashboard/business/csr-contributions': 'csr-contributions',
    '/dashboard/business/csr-partnerships': 'csr-partnerships',
    '/dashboard/business/impact': 'impact',
    '/dashboard/business/analytics': 'impact',
    '/dashboard/business/promotions': 'promotions',
    '/dashboard/business/subscriptions': 'subscriptions',
    '/dashboard/business/revenue': 'subscriptions',
  }

  const [activeTab, setActiveTab] = useState(() => PATH_TO_TAB[window.location?.pathname] || (isGroceryRole ? 'grocery-offers' : 'listings'))

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const targetPath = TAB_TO_PATH[tabId] || '/dashboard/business'
    if (location.pathname !== targetPath) {
      navigate(targetPath)
    }
  }

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [collectionRequests, setCollectionRequests] = useState([])

  // Grocery Offers & Redemptions State
  const [myGroceryOffers, setMyGroceryOffers] = useState([])
  const [businessRedemptions, setBusinessRedemptions] = useState([])
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false)
  const [submittingGroceryOffer, setSubmittingGroceryOffer] = useState(false)

  // CSR Campaign Contributions State
  const [myContributions, setMyContributions] = useState([])
  const [loadingContributions, setLoadingContributions] = useState(false)
  const [selectedContributionInstructions, setSelectedContributionInstructions] = useState(null)
  const [selectedContributionEvidence, setSelectedContributionEvidence] = useState(null)

  // Business-to-Charity Partnerships State
  const [partnerships, setPartnerships] = useState([])
  const [loadingPartnerships, setLoadingPartnerships] = useState(false)
  const [selectedPartnership, setSelectedPartnership] = useState(null)
  const [isPartnershipDetailsOpen, setIsPartnershipDetailsOpen] = useState(false)
  const [partnershipStatusFilter, setPartnershipStatusFilter] = useState('ALL')
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false)
  const [activeCampaigns, setActiveCampaigns] = useState([])
  const [submittingPropose, setSubmittingPropose] = useState(false)
  const [proposeForm, setProposeForm] = useState({
    campaignId: '',
    contributionType: 'MONETARY_PLEDGE',
    monetaryAmount: '',
    quantity: '',
    unit: '',
    itemDescription: '',
    requestedRecognition: 'Official Corporate Sustainability Patron',
    initialMessage: '',
    proposedDeliveryDate: '',
  })
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
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false)
  const [submittingDeliver, setSubmittingDeliver] = useState(false)
  const [deliverForm, setDeliverForm] = useState({ deliveryNotes: '' })
  const [sendingThreadMessage, setSendingThreadMessage] = useState(false)
  const [activeBusinessRecognitions, setActiveBusinessRecognitions] = useState([])

  // Redemption Verification & Confirmation State
  const [redemptionCodeInput, setRedemptionCodeInput] = useState('')
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [verifiedReservation, setVerifiedReservation] = useState(null)
  const [confirmingRedemption, setConfirmingRedemption] = useState(false)

  // Impact & Sustainability State
  const [businessImpact, setBusinessImpact] = useState(null)
  const [loadingBusinessImpact, setLoadingBusinessImpact] = useState(false)
  const [impactStart, setImpactStart] = useState(null)
  const [impactEnd, setImpactEnd] = useState(null)

  // Promotions & Growth State
  const [myPromotions, setMyPromotions] = useState([])
  const [promoAnalytics, setPromoAnalytics] = useState(null)
  const [loadingPromotions, setLoadingPromotions] = useState(false)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [submittingPromo, setSubmittingPromo] = useState(false)
  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    promotionType: 'PROMOTIONAL_OFFER',
    bannerUrl: '',
    targetAudience: '',
    promoCode: '',
    discountDetails: '',
    ctaLink: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    costLkr: 3500.0,
    isActive: true,
  })

  // Business Subscription Packages & Revenue State (Rule 8 Financial Segregation)
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [subscriptionPackages, setSubscriptionPackages] = useState([])
  const [subscriptionHistory, setSubscriptionHistory] = useState([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [subscribeCycle, setSubscribeCycle] = useState('MONTHLY')
  const [subscribePaymentRef, setSubscribePaymentRef] = useState('')
  const [subscribeNotes, setSubscribeNotes] = useState('')
  const [submittingSubscription, setSubmittingSubscription] = useState(false)

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
            loadContributions(),
            loadPartnerships(),
            loadBusinessRecognitions(profileRes.data.id),
            loadActiveCampaigns(),
            loadSubscriptionData(),
          ])
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPartnerships = async () => {
    try {
      setLoadingPartnerships(true)
      const res = await partnershipApi.getMyBusinessPartnerships()
      setPartnerships(res.data || [])
    } catch (err) {
      console.error('Error fetching partnerships', err)
    } finally {
      setLoadingPartnerships(false)
    }
  }

  const loadBusinessRecognitions = async (businessId) => {
    if (!businessId) return
    try {
      const res = await partnershipApi.getBusinessRecognitions(businessId)
      setActiveBusinessRecognitions(res.data || [])
    } catch (err) {
      console.error('Error fetching business recognitions', err)
    }
  }

  const loadActiveCampaigns = async () => {
    try {
      const res = await campaignApi.getCampaigns({ status: 'APPROVED' })
      setActiveCampaigns(res.data || [])
    } catch (err) {
      console.error('Error fetching active campaigns', err)
    }
  }

  const loadBusinessImpact = async (start = impactStart, end = impactEnd) => {
    try {
      setLoadingBusinessImpact(true)
      const params = {}
      if (start) params.startDate = start
      if (end) params.endDate = end
      const res = await impactApi.getMyImpact(params)
      setBusinessImpact(res.data)
    } catch (err) {
      console.error('Error fetching business impact', err)
    } finally {
      setLoadingBusinessImpact(false)
    }
  }

  const loadPromotionsData = async () => {
    try {
      setLoadingPromotions(true)
      const [promosRes, analyticsRes] = await Promise.all([
        promotionApi.getMyPromotions(),
        promotionApi.getMyAnalytics(),
      ])
      setMyPromotions(promosRes.data || [])
      setPromoAnalytics(analyticsRes.data || null)
    } catch (err) {
      console.error('Failed to load promotions', err)
      showToast('Could not load promotions data', 'error')
    } finally {
      setLoadingPromotions(false)
    }
  }

  const loadSubscriptionData = async () => {
    try {
      setLoadingSubscriptions(true)
      const [currRes, pkgsRes, histRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getPackages(),
        subscriptionApi.getHistory(),
      ])
      setCurrentSubscription(currRes.data || null)
      setSubscriptionPackages(pkgsRes.data || [])
      setSubscriptionHistory(histRes.data || [])
    } catch (err) {
      console.error('Failed to load subscription data', err)
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  // Synchronize route changes (sidebar clicks) to active tab & trigger loaders
  useEffect(() => {
    const matchedTab = PATH_TO_TAB[location.pathname]
    if (matchedTab) {
      setActiveTab(matchedTab)
      if (matchedTab === 'impact') loadBusinessImpact()
      if (matchedTab === 'promotions') loadPromotionsData()
      if (matchedTab === 'subscriptions') loadSubscriptionData()
      if (matchedTab === 'csr-partnerships') loadPartnerships()
      if (matchedTab === 'csr-contributions') loadContributions()
    }
  }, [location.pathname])

  const handleOpenSubscribeModal = (pkg) => {
    setSelectedPackage(pkg)
    setSubscribeCycle('MONTHLY')
    setSubscribePaymentRef('')
    setSubscribeNotes('')
    setIsSubscribeModalOpen(true)
  }

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPackage) return
    if (!subscribePaymentRef.trim()) {
      showToast('Please provide your bank transfer transaction reference number', 'error')
      return
    }

    try {
      setSubmittingSubscription(true)
      await subscriptionApi.subscribe({
        plan: selectedPackage.plan,
        billingCycle: subscribeCycle,
        paymentReference: subscribePaymentRef.trim(),
        notes: subscribeNotes.trim() || undefined,
      })
      showToast(`Subscription request for ${selectedPackage.name} submitted successfully! Awaiting admin activation.`, 'success')
      setIsSubscribeModalOpen(false)
      loadSubscriptionData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit subscription request'
      showToast(msg, 'error')
    } finally {
      setSubmittingSubscription(false)
    }
  }

  const handleOpenPromoModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo)
      setPromoForm({
        title: promo.title || '',
        description: promo.description || '',
        promotionType: promo.promotionType || 'PROMOTIONAL_OFFER',
        bannerUrl: promo.bannerUrl || '',
        targetAudience: promo.targetAudience || '',
        promoCode: promo.promoCode || '',
        discountDetails: promo.discountDetails || '',
        ctaLink: promo.ctaLink || '',
        startDate: promo.startDate ? promo.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: promo.endDate ? promo.endDate.split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        costLkr: promo.costLkr || 3500.0,
        isActive: promo.isActive !== false,
      })
    } else {
      setEditingPromo(null)
      setPromoForm({
        title: '',
        description: '',
        promotionType: 'PROMOTIONAL_OFFER',
        bannerUrl: '',
        targetAudience: '',
        promoCode: '',
        discountDetails: '',
        ctaLink: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        costLkr: 3500.0,
        isActive: true,
      })
    }
    setIsPromoModalOpen(true)
  }

  const handleSavePromotion = async (e) => {
    e.preventDefault()
    if (!promoForm.title.trim()) {
      showToast('Promotion title is required', 'error')
      return
    }

    try {
      setSubmittingPromo(true)
      const payload = {
        ...promoForm,
        startDate: new Date(promoForm.startDate).toISOString(),
        endDate: new Date(promoForm.endDate).toISOString(),
      }

      if (editingPromo) {
        await promotionApi.updatePromotion(editingPromo.id, payload)
        showToast('Promotion updated successfully!', 'success')
      } else {
        await promotionApi.createPromotion(payload)
        showToast('Promotion created successfully!', 'success')
      }
      setIsPromoModalOpen(false)
      loadPromotionsData()
    } catch (err) {
      console.error('Failed to save promotion', err)
      showToast(err.response?.data?.message || 'Error saving promotion', 'error')
    } finally {
      setSubmittingPromo(false)
    }
  }

  const handleTogglePromoStatus = async (promoId) => {
    try {
      await promotionApi.toggleStatus(promoId)
      showToast('Promotion status updated', 'success')
      loadPromotionsData()
    } catch (err) {
      showToast('Failed to update promotion status', 'error')
    }
  }

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return
    try {
      await promotionApi.deletePromotion(promoId)
      showToast('Promotion deleted', 'success')
      loadPromotionsData()
    } catch (err) {
      showToast('Failed to delete promotion', 'error')
    }
  }

  const handleOpenProposePartnership = () => {
    if (!profile || profile.verificationStatus !== 'VERIFIED') {
      setIsBlockedModalOpen(true)
      return
    }
    loadActiveCampaigns()
    setProposeForm({
      campaignId: activeCampaigns.length > 0 ? activeCampaigns[0].id : '',
      contributionType: 'MONETARY_PLEDGE',
      monetaryAmount: '',
      quantity: '',
      unit: '',
      itemDescription: '',
      requestedRecognition: 'Official Corporate Sustainability Patron',
      initialMessage: 'We would be honored to sponsor this verified community initiative.',
      proposedDeliveryDate: '',
    })
    setIsProposeModalOpen(true)
  }

  const handleProposeSubmit = async (e) => {
    e.preventDefault()
    if (!proposeForm.campaignId) {
      showToast('Please select a campaign to partner with.', 'error')
      return
    }
    setSubmittingPropose(true)
    try {
      const payload = {
        campaignId: proposeForm.campaignId,
        contributionType: proposeForm.contributionType,
        monetaryAmount:
          proposeForm.contributionType === 'MONETARY_PLEDGE' && proposeForm.monetaryAmount
            ? parseFloat(proposeForm.monetaryAmount)
            : null,
        quantity:
          proposeForm.contributionType !== 'MONETARY_PLEDGE' && proposeForm.quantity
            ? parseInt(proposeForm.quantity)
            : null,
        unit: proposeForm.unit || (proposeForm.contributionType === 'FOOD_ITEMS' ? 'packs' : 'items'),
        itemDescription: proposeForm.itemDescription,
        requestedRecognition: proposeForm.requestedRecognition,
        initialMessage: proposeForm.initialMessage,
        proposedDeliveryDate: proposeForm.proposedDeliveryDate
          ? new Date(proposeForm.proposedDeliveryDate).toISOString()
          : null,
      }
      await partnershipApi.proposePartnership(payload)
      showToast('Partnership proposal submitted successfully! The charity has been notified.', 'success')
      setIsProposeModalOpen(false)
      loadPartnerships()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit partnership proposal', 'error')
    } finally {
      setSubmittingPropose(false)
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
      if (profile?.id) loadBusinessRecognitions(profile.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendThreadMessage = async (msgText) => {
    if (!selectedPartnership) return
    setSendingThreadMessage(true)
    try {
      await partnershipApi.postMessage(selectedPartnership.id, { message: msgText })
      showToast('Message sent to charity!', 'success')
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error')
    } finally {
      setSendingThreadMessage(false)
    }
  }

  const handleAcceptTerms = async (partnershipId) => {
    if (
      !window.confirm(
        'Accept agreed partnership terms? This will lock the terms as immutable and notify both parties.'
      )
    )
      return
    try {
      await partnershipApi.acceptPartnership(partnershipId, {
        confirmationNotes: 'Terms agreed by business representative.',
      })
      showToast('Partnership terms AGREED and locked! Status updated to AGREED.', 'success')
      await refreshSelectedPartnership(partnershipId)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept terms', 'error')
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
      showToast('Counter-proposal sent to charity successfully!', 'success')
      setIsCounterModalOpen(false)
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit counter-proposal', 'error')
    } finally {
      setSubmittingCounter(false)
    }
  }

  const handleOpenDeliverModal = (partnership) => {
    setSelectedPartnership(partnership)
    setDeliverForm({ deliveryNotes: '' })
    setIsDeliverModalOpen(true)
  }

  const handleDeliverSubmit = async (e) => {
    e.preventDefault()
    setSubmittingDeliver(true)
    try {
      await partnershipApi.deliverPartnership(selectedPartnership.id, {
        deliveryNotes: deliverForm.deliveryNotes || 'Delivery dispatched by business.',
      })
      showToast('Partnership marked as DELIVERED! The charity has been notified to verify receipt.', 'success')
      setIsDeliverModalOpen(false)
      await refreshSelectedPartnership(selectedPartnership.id)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record delivery', 'error')
    } finally {
      setSubmittingDeliver(false)
    }
  }

  const loadContributions = async () => {
    try {
      setLoadingContributions(true)
      const res = await contributionApi.getMyContributions()
      setMyContributions(res.data || [])
    } catch (err) {
      console.error('Error fetching contributions', err)
    } finally {
      setLoadingContributions(false)
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
          {row.charityContactPhone && <div className="text-xs text-muted">ðŸ“ž {row.charityContactPhone}</div>}
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

  const csrContributionColumns = [
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
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.925rem',
              textAlign: 'left',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {val}
          </button>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.3rem', marginTop: '2px' }}>
            <span>{row.charityName}</span>
            <span>â€¢</span>
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
        let text = 'Pledged (Pending Charity Receipt)'
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
      label: 'Date',
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

  const partnershipColumns = [
    {
      key: 'campaignTitle',
      label: 'Campaign & Charity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{val}</div>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.4rem', marginTop: '2px' }}>
            <span>{row.charityName}</span>
            <span>â€¢</span>
            <MapPin size={11} style={{ color: '#dc2626' }} />
            <span>{row.campaignDistrict} District</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contributionType',
      label: 'Terms & Commitment',
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
            <span>Locked (Charity receipt required)</span>
          </div>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<MessageSquare size={13} />}
            onClick={() => handleViewPartnershipDetails(row)}
          >
            Details & Thread
          </Button>
          {row.status === 'AGREED' && (
            <Button
              size="sm"
              variant="primary"
              icon={<Truck size={13} />}
              onClick={() => handleOpenDeliverModal(row)}
            >
              Deliver
            </Button>
          )}
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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {profile?.id && (
            <Link to={`/businesses/${profile.id}`} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                icon={<ExternalLink size={16} />}
              >
                View Public Profile
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            icon={<Building2 size={16} />}
            onClick={() => setIsProfileModalOpen(true)}
          >
            {profile ? 'Edit Business Profile' : 'Setup Profile'}
          </Button>

          <Button
            variant="secondary"
            icon={<Handshake size={16} />}
            onClick={handleOpenProposePartnership}
          >
            Propose CSR Partnership
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

      {/* Active Corporate Recognition Badges (Promotional Recognition Main Innovation) */}
      {activeBusinessRecognitions.length > 0 && (
        <div
          style={{
            backgroundColor: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#6d28d9' }}>
            <Award size={22} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Active Corporate CSR Sponsorship Recognitions ({activeBusinessRecognitions.length})
            </h3>
          </div>
          <p className="text-xs text-muted" style={{ marginBottom: '1rem' }}>
            Official badges earned and publicly visible on your business profile and campaign pages. Granted strictly upon verified delivery and charity receipt confirmation.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {activeBusinessRecognitions.map((badge, idx) => (
              <div
                key={badge.partnershipId || idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #c4b5fd',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ backgroundColor: '#7c3aed', color: '#fff', borderRadius: '50%', padding: '0.4rem', display: 'flex' }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#4c1d95' }}>
                    {badge.agreedRecognition || 'Corporate Partner'}
                  </div>
                  <div className="text-xs text-muted">
                    Campaign: <strong>{badge.campaignTitle}</strong> &bull; {badge.charityName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          onClick={() => handleTabChange('grocery-offers')}
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
          onClick={() => handleTabChange('redemptions')}
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
          onClick={() => handleTabChange('listings')}
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
          onClick={() => handleTabChange('requests')}
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

        <button
          onClick={() => handleTabChange('csr-contributions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'csr-contributions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'csr-contributions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Heart size={18} />
          CSR Campaign Pledges ({myContributions.length})
        </button>

        <button
          onClick={() => handleTabChange('csr-partnerships')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'csr-partnerships' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'csr-partnerships' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Handshake size={18} />
          CSR Partnerships ({partnerships.length})
          {partnerships.filter((p) => p.status === 'COUNTERED' && p.lastCounterByRole === 'CHARITY').length > 0 && (
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
              {partnerships.filter((p) => p.status === 'COUNTERED' && p.lastCounterByRole === 'CHARITY').length} action needed
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('impact')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'impact' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'impact' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <TrendingUp size={18} />
          Impact & Sustainability
        </button>

        <button
          onClick={() => handleTabChange('promotions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'promotions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'promotions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={18} />
          Promotions & Growth
        </button>

        <button
          onClick={() => handleTabChange('subscriptions')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscriptions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'subscriptions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CreditCard size={18} />
          Subscription Packages
          {currentSubscription?.plan && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.15rem 0.45rem',
                borderRadius: '999px',
                background: currentSubscription.plan === 'PREMIUM' ? '#fef3c7' : (currentSubscription.plan === 'PROMOTION' ? '#e0e7ff' : '#f1f5f9'),
                color: currentSubscription.plan === 'PREMIUM' ? '#b45309' : (currentSubscription.plan === 'PROMOTION' ? '#4338ca' : '#475569'),
              }}
            >
              {currentSubscription.plan}
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

      {/* Tab: CSR Campaign Contributions */}
      {activeTab === 'csr-contributions' && (
        <Card
          title="Corporate CSR Contributions & Campaign Pledges (Rule 5 & Rule 8)"
          subtitle="Direct corporate donations without payment processing fees. Review charity confirmation and distribution evidence for ESG & CSR auditing."
          action={
            <Button size="sm" variant="primary" icon={<Heart size={14} />} onClick={() => navigate('/campaigns')}>
              Browse Campaigns to Pledge
            </Button>
          }
        >
          {loadingContributions ? (
            <div style={{ padding: '2rem 0' }}>
              <Loader message="Loading corporate pledges..." />
            </div>
          ) : myContributions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Heart size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
                No Corporate Contributions Yet
              </div>
              <p className="text-xs text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                Pledge bulk dry rations, equipment, or funds directly to verified rural campaigns. Zero platform deductions.
              </p>
              <Button size="sm" variant="outline" icon={<ExternalLink size={14} />} onClick={() => navigate('/campaigns')}>
                Explore Rural Campaigns
              </Button>
            </div>
          ) : (
            <Table
              columns={csrContributionColumns}
              data={myContributions}
              emptyMessage="No contributions recorded."
            />
          )}
        </Card>
      )}

      {/* Tab: CSR Partnerships Innovation */}
      {activeTab === 'csr-partnerships' && (
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
                  Business-to-Charity Partnership Innovation
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  Main Platform Innovation
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#5b21b6', margin: '0.4rem 0 0.5rem 0', lineHeight: 1.5 }}>
                Propose collaborative sponsorships directly to verified rural community campaigns. Negotiate transparent terms via two-way message threads, lock agreed commitments into immutable records, deliver support, and receive verified public recognition once the charity confirms delivery receipt.
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
                Promotional recognition is strictly awarded only after agreed terms are fulfilled and receipt is confirmed by the charity.
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleOpenProposePartnership}
              style={{ flexShrink: 0 }}
            >
              Propose Partnership
            </Button>
          </div>

          {/* Status Metric Pills */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-muted">Total Partnerships</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{partnerships.length}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Active Negotiations</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
                {partnerships.filter((p) => p.status === 'PROPOSED' || p.status === 'COUNTERED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Agreed / In Delivery</div>
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

          {/* Filter Pills */}
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
                {filter === 'ALL' ? 'All Proposals' : filter}
              </button>
            ))}
          </div>

          {/* Partnerships Table */}
          <Card
            title="Partnership Agreements & Proposals"
            subtitle="Track live negotiations, locked immutable contracts, and fulfillment statuses."
          >
            {loadingPartnerships ? (
              <Loader message="Loading CSR partnerships..." />
            ) : filteredPartnerships.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Handshake size={44} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No partnerships found in this status
                </div>
                <p className="text-xs text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                  Begin a new collaboration with a verified community campaign to provide sponsored resources and earn verified recognition.
                </p>
                <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={handleOpenProposePartnership}>
                  Propose Your First Partnership
                </Button>
              </div>
            ) : (
              <Table
                columns={partnershipColumns}
                data={filteredPartnerships}
                emptyMessage="No partnerships recorded."
              />
            )}
          </Card>
        </div>
      )}

      {/* Tab: Verified Impact & Sustainability */}
      {activeTab === 'impact' && (
        <ImpactAnalyticsView
          data={businessImpact}
          loading={loadingBusinessImpact}
          isOrganization={true}
          title={`${profile?.businessName || 'Business'} Sustainability & ESG Report`}
          subtitle="Audit-verified metrics for food waste prevented, near-expiry products rescued, carbon emissions avoided, and completed rural community relief sponsorships."
          onDateRangeChange={(start, end) => {
            setImpactStart(start)
            setImpactEnd(end)
            loadBusinessImpact(start, end)
          }}
          onExportCsv={() => {
            if (profile?.id) {
              window.location.href = impactApi.getExportCsvUrl(profile.id, impactStart, impactEnd)
            }
          }}
        />
      )}

      {/* Tab: Promotions & Growth Management */}
      {activeTab === 'promotions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Feature Gating Upgrade Banner */}
          {promoAnalytics?.isGated && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#f59e0b', color: '#fff', borderRadius: '50%', padding: '0.6rem', display: 'flex' }}>
                  <Zap size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#92400e', fontSize: '1rem' }}>
                    Feature Gating: Free Starter Plan ({promoAnalytics?.activePromotions || 0} / {promoAnalytics?.maxAllowedPromotions || 1} Promotion Active)
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#b45309', marginTop: '0.2rem' }}>
                    Detailed CTR and conversion analytics, featured placement, and up to 5 or unlimited promotions require a Promotion or Premium subscription.
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setActiveTab('subscriptions')
                  loadSubscriptionData()
                }}
              >
                Upgrade to Unlock Analytics
              </Button>
            </div>
          )}

          {/* Analytics Summary Header Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Active Promos
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {promoAnalytics?.activePromotions || 0}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Total Views
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {promoAnalytics?.totalViews || 0}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Total Clicks
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563eb' }}>
                {promoAnalytics?.totalClicks || 0}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Redemptions
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a' }}>
                {promoAnalytics?.totalRedemptions || 0}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Click-Through (CTR)
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706' }}>
                {promoAnalytics?.averageCtr || 0}%
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Conversion Rate
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed' }}>
                {promoAnalytics?.averageRedemptionRate || 0}%
              </div>
            </div>
          </div>

          {/* Promotions Table Card */}
          <Card
            title="Promotional Campaigns & Featured Visibility"
            subtitle="Promote your sustainable surplus offers, drive store visits, and feature your business profile to thousands of conscious consumers across Sri Lanka."
            action={
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => handleOpenPromoModal()}
              >
                Create Promotion
              </Button>
            }
          >
            {loadingPromotions ? (
              <Loader text="Loading your promotions..." />
            ) : myPromotions.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <Sparkles size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  No Promotions Created Yet
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                  Create featured profile listings, discount coupons, or promotional announcements to expand your customer reach and highlight your zero-waste commitments.
                </p>
                <Button variant="primary" icon={<Plus size={15} />} onClick={() => handleOpenPromoModal()}>
                  Create Your First Promotion
                </Button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Promotion</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Dates</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Views / Clicks / Redemptions</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPromotions.map((promo) => (
                      <tr key={promo.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {promo.bannerUrl && (
                              <img
                                src={promo.bannerUrl}
                                alt={promo.title}
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{promo.title}</div>
                              {promo.promoCode && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', color: 'var(--color-primary)' }}>
                                  CODE: {promo.promoCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: promo.promotionType === 'FEATURED_PROFILE' ? '#fef3c7' : '#eff6ff',
                              color: promo.promotionType === 'FEATURED_PROFILE' ? '#b45309' : '#1e40af',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            {promo.promotionType === 'FEATURED_PROFILE' ? 'Featured Profile' : 'Promotional Offer'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                          {new Date(promo.startDate).toLocaleDateString()} &ndash; {new Date(promo.endDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: promo.isActive ? '#dcfce7' : '#f1f5f9',
                              color: promo.isActive ? '#15803d' : '#64748b',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                            }}
                          >
                            {promo.isActive ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem' }}>
                            <span>ðŸ‘ï¸ <strong>{promo.viewsCount || 0}</strong></span>
                            <span>ðŸ–±ï¸ <strong>{promo.clicksCount || 0}</strong></span>
                            <span>ðŸŽ <strong>{promo.redemptionsCount || 0}</strong></span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>({promo.ctr || 0}% CTR)</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTogglePromoStatus(promo.id)}
                            >
                              {promo.isActive ? 'Pause' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPromoModal(promo)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                              onClick={() => handleDeletePromo(promo.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab: Business Subscription Packages & Revenue Management */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Current Subscription Status Banner */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '1.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                    {currentSubscription?.plan === 'PREMIUM'
                      ? 'Enterprise Premium Membership'
                      : currentSubscription?.plan === 'PROMOTION'
                      ? 'Growth Promotion Package'
                      : 'Free Starter Plan'}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background:
                        currentSubscription?.status === 'ACTIVE'
                          ? '#dcfce7'
                          : currentSubscription?.status === 'PENDING_ACTIVATION'
                          ? '#fef3c7'
                          : '#f1f5f9',
                      color:
                        currentSubscription?.status === 'ACTIVE'
                          ? '#15803d'
                          : currentSubscription?.status === 'PENDING_ACTIVATION'
                          ? '#b45309'
                          : '#475569',
                    }}
                  >
                    {currentSubscription?.status === 'PENDING_ACTIVATION' ? 'VERIFICATION PENDING' : (currentSubscription?.status || 'ACTIVE')}
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Invoice: <strong>{currentSubscription?.invoiceNumber || 'FREE-TIER'}</strong> &bull; Billing Cycle:{' '}
                  <strong>{currentSubscription?.billingCycle || 'MONTHLY'}</strong> &bull; Amount:{' '}
                  <strong>{currentSubscription?.priceLkr > 0 ? `LKR ${Number(currentSubscription.priceLkr).toLocaleString()}` : 'Included Free'}</strong>
                </p>
              </div>

              {currentSubscription?.plan !== 'PREMIUM' && (
                <Button
                  variant="primary"
                  icon={<Zap size={16} />}
                  onClick={() => {
                    const premPkg = subscriptionPackages.find((p) => p.plan === 'PREMIUM') || subscriptionPackages[2]
                    if (premPkg) handleOpenSubscribeModal(premPkg)
                  }}
                >
                  Upgrade to Premium
                </Button>
              )}
            </div>

            {currentSubscription?.status === 'PENDING_ACTIVATION' && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.88rem',
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Bank Transfer Verification in Progress:</strong> We received your transfer slip reference{' '}
                  <code style={{ background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                    {currentSubscription?.paymentReference || 'N/A'}
                  </code>
                  . Platform administrators verify manual transfers and activate packages within 24 hours.
                </div>
              </div>
            )}

            {/* Subscription Entitlement Pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active Promo Slots
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {promoAnalytics?.activePromotions || 0} / {currentSubscription?.maxPromotions || 1} slots used
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Directory & Map Placement
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: currentSubscription?.hasFeaturedPlacement ? '#15803d' : '#64748b' }}>
                  {currentSubscription?.hasFeaturedPlacement ? 'â­ Featured Placement' : 'Standard Listing'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Analytics Access
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: currentSubscription?.hasAnalytics ? '#15803d' : '#64748b' }}>
                  {currentSubscription?.hasAnalytics ? 'Full Real-Time CTR & Tracking' : 'Gated / Basic Aggregate'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Sponsored Campaigns
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: currentSubscription?.hasSponsoredCampaigns ? '#15803d' : '#64748b' }}>
                  {currentSubscription?.hasSponsoredCampaigns ? 'Eligible to Sponsor' : 'Premium Only'}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Tier Comparison Cards */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Available Business Packages</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Choose the right visibility package to amplify your sustainable culinary and surplus food operations across Sri Lanka.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {subscriptionPackages.map((pkg) => {
                const isCurrent = currentSubscription?.plan === pkg.plan
                const isPremium = pkg.plan === 'PREMIUM'
                const isPromotion = pkg.plan === 'PROMOTION'

                return (
                  <div
                    key={pkg.plan}
                    style={{
                      background: 'var(--color-surface)',
                      border: isCurrent
                        ? '2px solid var(--color-primary)'
                        : isPremium
                        ? '2px solid #f59e0b'
                        : '1px solid var(--color-border)',
                      borderRadius: '16px',
                      padding: '1.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: isPremium ? '0 10px 25px -5px rgba(245, 158, 11, 0.15)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '999px',
                            background: isPremium ? '#fef3c7' : isPromotion ? '#e0e7ff' : '#f1f5f9',
                            color: isPremium ? '#b45309' : isPromotion ? '#4338ca' : '#475569',
                          }}
                        >
                          {pkg.badge || pkg.plan}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            Current Plan
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>{pkg.name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', minHeight: '38px' }}>
                        {pkg.description}
                      </p>

                      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                          {pkg.priceMonthly > 0 ? `LKR ${Number(pkg.priceMonthly).toLocaleString()}` : 'Free'}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {pkg.priceMonthly > 0 ? ' / month' : ' forever'}
                        </span>
                        {pkg.priceAnnual > 0 && (
                          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, marginTop: '0.2rem' }}>
                            or LKR {Number(pkg.priceAnnual).toLocaleString()} / year (Save 16%)
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                        {pkg.features?.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <CheckCircle2 size={16} color="#15803d" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <Button variant="outline" disabled style={{ width: '100%', opacity: 0.8 }}>
                          Active Plan
                        </Button>
                      ) : pkg.plan === 'FREE' ? (
                        <Button variant="outline" disabled style={{ width: '100%', opacity: 0.6 }}>
                          Default Free
                        </Button>
                      ) : (
                        <Button
                          variant={isPremium ? 'primary' : 'outline'}
                          style={{ width: '100%' }}
                          icon={<Zap size={15} />}
                          onClick={() => handleOpenSubscribeModal(pkg)}
                        >
                          Select {pkg.name}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Subscription & Invoice History (Rule 8 Financial Segregation) */}
          <Card
            title="Subscription & Invoice History"
            subtitle="Platform operational revenue records and payment references (strictly segregated from charity contributions under Rule 8)."
          >
            {loadingSubscriptions ? (
              <Loader text="Loading subscription history..." />
            ) : subscriptionHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <Receipt size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                  No Invoices or Upgrade Requests
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
                  You are currently using the default Free Starter tier. When you upgrade, your bank transfer invoices and activation history will be listed here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Cycle</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Payment Ref</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionHistory.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {sub.invoiceNumber}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: sub.plan === 'PREMIUM' ? '#fef3c7' : '#e0e7ff',
                              color: sub.plan === 'PREMIUM' ? '#b45309' : '#4338ca',
                            }}
                          >
                            {sub.plan}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.82rem' }}>{sub.billingCycle}</td>
                        <td style={{ padding: '1rem', fontWeight: 700 }}>
                          LKR {Number(sub.priceLkr).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                          {sub.paymentReference || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                              background:
                                sub.status === 'ACTIVE'
                                  ? '#dcfce7'
                                  : sub.status === 'PENDING_ACTIVATION'
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                              color:
                                sub.status === 'ACTIVE'
                                  ? '#15803d'
                                  : sub.status === 'PENDING_ACTIVATION'
                                  ? '#b45309'
                                  : '#64748b',
                            }}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                          {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal: Create / Edit Promotion */}
      <Modal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title={editingPromo ? 'Edit Promotion Campaign' : 'Create New Promotion Campaign'}
        subtitle="Manage promotional ads, discount coupons, or featured placements (Rule 8 Operational Revenue)"
      >
        <form onSubmit={handleSavePromotion}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Promotion Title *"
              placeholder="e.g., 20% Off Weekend Buffet / Featured Bakery Placement"
              value={promoForm.title}
              onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
              required
            />

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Promotion Type *
              </label>
              <select
                value={promoForm.promotionType}
                onChange={(e) => setPromoForm({ ...promoForm, promotionType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  fontSize: '0.9rem',
                }}
              >
                <option value="PROMOTIONAL_OFFER">Promotional Offer (Discounts & Bundles)</option>
                <option value="FEATURED_PROFILE">Featured Profile Listing (Priority Search & Map Pin)</option>
                <option value="COMMUNITY_SPONSOR">Community Sponsor Highlight</option>
                <option value="DISCOUNT_COUPON">Digital Discount Coupon Code</option>
              </select>
            </div>

            <Textarea
              label="Description & Campaign Details"
              placeholder="Describe what customers or volunteers receive, terms of the deal, etc."
              value={promoForm.description}
              onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
              rows={3}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Coupon / Promo Code (Optional)"
                placeholder="e.g. SAVE20 or WEEKEND50"
                value={promoForm.promoCode}
                onChange={(e) => setPromoForm({ ...promoForm, promoCode: e.target.value })}
              />

              <Input
                label="Discount Details (Optional)"
                placeholder="e.g. 25% off or Buy 1 Get 1 Free"
                value={promoForm.discountDetails}
                onChange={(e) => setPromoForm({ ...promoForm, discountDetails: e.target.value })}
              />
            </div>

            <Input
              label="Banner Image URL (Optional)"
              placeholder="https://..."
              value={promoForm.bannerUrl}
              onChange={(e) => setPromoForm({ ...promoForm, bannerUrl: e.target.value })}
            />

            <Input
              label="Call to Action (CTA) Website Link (Optional)"
              placeholder="https://yourrestaurant.lk/menu"
              value={promoForm.ctaLink}
              onChange={(e) => setPromoForm({ ...promoForm, ctaLink: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Start Date *"
                type="date"
                value={promoForm.startDate}
                onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                required
              />

              <Input
                label="End Date *"
                type="date"
                value={promoForm.endDate}
                onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsPromoModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submittingPromo}>
                {submittingPromo ? 'Saving...' : editingPromo ? 'Update Promotion' : 'Publish Promotion'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

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
                <strong>Direct CSR Transfer:</strong> FoodBridge does not deduct processing cuts. Please follow the receiving charity's verified instructions below to fulfill your pledge directly.
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
                Physical Delivery / Handover Coordination
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
                {selectedContributionInstructions.handoverInstructions || 'Please coordinate delivery logistics directly with the charity.'}
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
        title="Field Distribution Evidence & CSR Audit Proof"
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
            placeholder="e.g. Leftover banquet buffet meals stored continuously above 65Â°C."
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
      {/* Modal: Propose CSR Partnership */}
      <Modal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        title="Propose Business-to-Charity Partnership"
        subtitle="Collaborate directly with a verified rural community campaign"
        maxWidth="750px"
      >
        <form onSubmit={handleProposeSubmit}>
          <div
            style={{
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              fontSize: '0.825rem',
              color: '#5b21b6',
              lineHeight: 1.5,
            }}
          >
            <strong>Transparent Collaboration:</strong> Propose your initial sponsorship terms. The receiving charity will review your proposal and can accept or start a counter-negotiation thread.
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <Select
              label="Select Verified Rural Community Campaign"
              required
              options={activeCampaigns.map((c) => ({
                value: c.id,
                label: `${c.title} (${c.district || 'Rural'} District â€¢ Target: ${c.targetQuantity} ${c.needType})`,
              }))}
              value={proposeForm.campaignId}
              onChange={(e) => setProposeForm({ ...proposeForm, campaignId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
            <Select
              label="Contribution Type"
              required
              options={[
                { value: 'MONETARY_PLEDGE', label: 'Financial Sponsorship (LKR)' },
                { value: 'FOOD_ITEMS', label: 'Food & Nutrition Supplies' },
                { value: 'OTHER_RESOURCES', label: 'Equipment, Stationery or Other Resources' },
              ]}
              value={proposeForm.contributionType}
              onChange={(e) => setProposeForm({ ...proposeForm, contributionType: e.target.value })}
            />
            {proposeForm.contributionType === 'MONETARY_PLEDGE' ? (
              <Input
                label="Monetary Amount (Rs.)"
                type="number"
                step="0.01"
                min="100"
                required
                value={proposeForm.monetaryAmount}
                onChange={(e) => setProposeForm({ ...proposeForm, monetaryAmount: e.target.value })}
                placeholder="e.g. 50000.00"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  required
                  value={proposeForm.quantity}
                  onChange={(e) => setProposeForm({ ...proposeForm, quantity: e.target.value })}
                  placeholder="50"
                />
                <Input
                  label="Unit"
                  value={proposeForm.unit}
                  onChange={(e) => setProposeForm({ ...proposeForm, unit: e.target.value })}
                  placeholder="kg / bags / kits"
                />
              </div>
            )}
          </div>

          {proposeForm.contributionType !== 'MONETARY_PLEDGE' && (
            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="Item Specification / Description"
                required
                value={proposeForm.itemDescription}
                onChange={(e) => setProposeForm({ ...proposeForm, itemDescription: e.target.value })}
                placeholder="e.g. 50 bags of premium dry rations, dhal, and canned goods"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1rem' }}>
            <Input
              label="Requested Promotional Recognition"
              value={proposeForm.requestedRecognition}
              onChange={(e) => setProposeForm({ ...proposeForm, requestedRecognition: e.target.value })}
              placeholder="e.g. Official Sustainability Sponsor"
            />
            <Input
              label="Proposed Delivery Date"
              type="date"
              value={proposeForm.proposedDeliveryDate}
              onChange={(e) => setProposeForm({ ...proposeForm, proposedDeliveryDate: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Textarea
              label="Proposal Message & Collaboration Intent"
              required
              rows={3}
              value={proposeForm.initialMessage}
              onChange={(e) => setProposeForm({ ...proposeForm, initialMessage: e.target.value })}
              placeholder="Explain how your business would like to support this initiative..."
            />
          </div>

          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            <Lock size={18} style={{ color: '#e11d48', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#9f1239' }}>
              <strong>Platform Guarantee:</strong> Promotional recognition badge will be published on your profile and campaign only after delivery is confirmed and receipt is verified by the receiving charity.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsProposeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingPropose}>
              Send Partnership Proposal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Partnership Details, Timeline & Negotiation Thread */}
      <Modal
        isOpen={isPartnershipDetailsOpen}
        onClose={() => setIsPartnershipDetailsOpen(false)}
        title={selectedPartnership ? `Partnership: ${selectedPartnership.campaignTitle}` : 'Partnership Details'}
        subtitle={selectedPartnership ? `Charity: ${selectedPartnership.charityName} â€¢ District: ${selectedPartnership.campaignDistrict || 'Rural'}` : ''}
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
                  Current Negotiated Proposal Terms
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
                    <span className="text-muted">Recognition Tier:</span>
                    <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {selectedPartnership.requestedRecognition || 'Official Sponsor'}
                    </div>
                  </div>
                </div>

                {/* Counter action prompt if Charity countered */}
                {selectedPartnership.status === 'COUNTERED' && selectedPartnership.lastCounterByRole === 'CHARITY' && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #e879f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#86198f' }}>
                      The charity proposed new terms. Would you like to accept or make another counter?
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Action Banner for Business if status is AGREED */}
            {selectedPartnership.status === 'AGREED' && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
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
                  <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>
                    Terms are Locked! Ready for Delivery
                  </div>
                  <div className="text-xs text-muted">
                    Once goods or funds are dispatched to the charity, mark them as delivered with courier/dispatch notes.
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Truck size={14} />}
                  onClick={() => handleOpenDeliverModal(selectedPartnership)}
                >
                  Mark as Delivered
                </Button>
              </div>
            )}

            {/* Negotiation Message Thread */}
            <PartnershipMessageThread
              messages={selectedPartnership.messages || []}
              currentUserRole="BUSINESS"
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

      {/* Modal: Business Counter-Proposal */}
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Send Counter-Proposal to Charity"
        subtitle={`Negotiate terms for ${selectedPartnership?.campaignTitle || ''}`}
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
              label="Requested Recognition Tier"
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
              placeholder="Explain why you are adjusting these terms..."
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

      {/* Modal: Deliver Partnership Support */}
      <Modal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        title="Confirm Support Delivery / Dispatch"
        subtitle={`Delivering agreed commitments to ${selectedPartnership?.charityName || 'Charity'}`}
        maxWidth="600px"
      >
        <form onSubmit={handleDeliverSubmit}>
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              color: '#1e40af',
              lineHeight: 1.5,
            }}
          >
            <strong>Delivery Notification:</strong> This will update the partnership status to <strong>DELIVERED</strong> and send an instant notification to the charity to inspect and verify receipt of goods or funds.
          </div>

          <Textarea
            label="Delivery / Dispatch Notes & Tracking"
            required
            rows={4}
            value={deliverForm.deliveryNotes}
            onChange={(e) => setDeliverForm({ deliveryNotes: e.target.value })}
            placeholder="e.g. Bank transfer slip #TRX-94819 executed on 14/05/2026. Or: 50 ration packs dispatched via City Express courier tracking #CX-88219."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsDeliverModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submittingDeliver}>
              Confirm & Mark Delivered
            </Button>
          </div>
        </form>
      </Modal>
      {/* Modal: Subscribe / Upgrade Subscription Package */}
      <Modal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
        title={`Subscribe to ${selectedPackage?.name || 'Package'}`}
        subtitle="Manual Bank Transfer Activation (No live credit card gateway required)"
        maxWidth="600px"
      >
        {selectedPackage && (
          <form onSubmit={handleSubscribeSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Billing Cycle Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Billing Cycle
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSubscribeCycle('MONTHLY')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: subscribeCycle === 'MONTHLY' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: subscribeCycle === 'MONTHLY' ? '#eff6ff' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Monthly Billing</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                      LKR {Number(selectedPackage.priceMonthly).toLocaleString()}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubscribeCycle('ANNUAL')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      border: subscribeCycle === 'ANNUAL' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: subscribeCycle === 'ANNUAL' ? '#eff6ff' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '8px',
                        background: '#15803d',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                      }}
                    >
                      SAVE 16%
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Annual Billing</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                      LKR {Number(selectedPackage.priceAnnual).toLocaleString()}
                    </div>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                  Bank Transfer Instructions (Sri Lanka):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                  <div>Bank: <strong>Bank of Ceylon (BOC)</strong></div>
                  <div>Branch: <strong>Colombo Corporate</strong></div>
                  <div>Account Name: <strong>FoodBridge Platform Operations</strong></div>
                  <div>Account No: <strong>009283748291</strong></div>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  * Please transfer the exact amount and enter the bank deposit slip number or transaction reference ID below.
                </div>
              </div>

              <Input
                label="Bank Transfer Reference / Transaction ID *"
                placeholder="e.g. BOC-TX-992019 or Slip Ref #10294"
                value={subscribePaymentRef}
                onChange={(e) => setSubscribePaymentRef(e.target.value)}
                required
              />

              <Textarea
                label="Notes / Slip Details (Optional)"
                placeholder="e.g. Transferred via online banking from Commercial Bank account ending in 4102."
                value={subscribeNotes}
                onChange={(e) => setSubscribeNotes(e.target.value)}
                rows={2}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="outline" onClick={() => setIsSubscribeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingSubscription}>
                  Submit Subscription Request
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
