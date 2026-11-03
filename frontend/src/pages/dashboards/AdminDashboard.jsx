import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  Users,
  DollarSign,
  Check,
  X,
  FileText,
  AlertTriangle,
  Award,
  ExternalLink,
  Eye,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Handshake,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Search,
  Sliders,
  UserX,
  UserCheck,
  UserCog,
  Activity,
  ShoppingBag,
  UtensilsCrossed,
  Trash2,
  Filter,
  Gift,
  Save,
  Settings as SettingsIcon,
  Shield,
  Ban,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Textarea from '../../components/common/Textarea'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Loader from '../../components/common/Loader'
import PartnershipTimeline from '../../components/common/PartnershipTimeline'
import PartnershipMessageThread from '../../components/common/PartnershipMessageThread'
import { adminApi, campaignApi, partnershipApi, impactApi, promotionApi, adminSubscriptionApi } from '../../api/client'
import ImpactAnalyticsView from '../../components/impact/ImpactAnalyticsView'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [activeAdminTab, setActiveAdminTab] = useState('overview')

  // =========================================================================
  // 1. PLATFORM OVERVIEW STATE
  // =========================================================================
  const [overviewData, setOverviewData] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(false)

  // =========================================================================
  // 2. USER MANAGEMENT STATE
  // =========================================================================
  const [adminUsers, setAdminUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState('ALL')

  const [selectedUser, setSelectedUser] = useState(null)
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false)

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendActionType, setSuspendActionType] = useState('SUSPEND') // SUSPEND or REACTIVATE
  const [processingUserStatus, setProcessingUserStatus] = useState(false)

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [newSelectedRole, setNewSelectedRole] = useState('')
  const [roleChangeReason, setRoleChangeReason] = useState('')
  const [processingRoleChange, setProcessingRoleChange] = useState(false)

  // =========================================================================
  // 3. VERIFICATION QUEUE STATE (Rule 2)
  // =========================================================================
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  // =========================================================================
  // 4. LISTING MANAGEMENT STATE (Food Rescue & Grocery Offers)
  // =========================================================================
  const [adminListings, setAdminListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [listingTypeFilter, setListingTypeFilter] = useState('ALL')
  const [listingStatusFilter, setListingStatusFilter] = useState('ALL')
  const [listingSearch, setListingSearch] = useState('')

  const [selectedListing, setSelectedListing] = useState(null)
  const [isListingStatusModalOpen, setIsListingStatusModalOpen] = useState(false)
  const [newListingStatus, setNewListingStatus] = useState('')
  const [listingStatusReason, setListingStatusReason] = useState('')
  const [processingListingAction, setProcessingListingAction] = useState(false)

  // =========================================================================
  // 5. CAMPAIGN MODERATION STATE (Rule 3)
  // =========================================================================
  const [pendingCampaigns, setPendingCampaigns] = useState([])
  const [allCampaigns, setAllCampaigns] = useState([])
  const [loadingAllCampaigns, setLoadingAllCampaigns] = useState(false)
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL')
  const [campaignSearch, setCampaignSearch] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCampaignDetailsModalOpen, setIsCampaignDetailsModalOpen] = useState(false)
  const [isCampaignModerateModalOpen, setIsCampaignModerateModalOpen] = useState(false)
  const [campaignModerationDecision, setCampaignModerationDecision] = useState('APPROVE')
  const [campaignModerationReason, setCampaignModerationReason] = useState('')

  // =========================================================================
  // 6. PARTNERSHIPS & CONTRIBUTIONS MONITORING STATE
  // =========================================================================
  const [partnershipSubTab, setPartnershipSubTab] = useState('PARTNERSHIPS') // PARTNERSHIPS or CONTRIBUTIONS
  const [adminPartnerships, setAdminPartnerships] = useState([])
  const [loadingPartnerships, setLoadingPartnerships] = useState(false)
  const [selectedAdminPartnership, setSelectedAdminPartnership] = useState(null)
  const [isAdminPartnershipModalOpen, setIsAdminPartnershipModalOpen] = useState(false)
  const [adminPartnershipFilter, setAdminPartnershipFilter] = useState('ALL')

  const [adminContributions, setAdminContributions] = useState([])
  const [loadingContributions, setLoadingContributions] = useState(false)
  const [contributionSummary, setContributionSummary] = useState(null)
  const [contribStatusFilter, setContribStatusFilter] = useState('ALL')
  const [contribTypeFilter, setContribTypeFilter] = useState('ALL')
  const [contribSearch, setContribSearch] = useState('')

  // =========================================================================
  // 7. BUSINESS SUBSCRIPTIONS STATE (Rule 8 Financial Segregation)
  // =========================================================================
  const [adminSubscriptions, setAdminSubscriptions] = useState([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [subStatusFilter, setSubStatusFilter] = useState('ALL')

  // =========================================================================
  // 8. PLATFORM IMPACT REPORTS STATE
  // =========================================================================
  const [platformImpact, setPlatformImpact] = useState(null)
  const [loadingPlatformImpact, setLoadingPlatformImpact] = useState(false)
  const [impactStart, setImpactStart] = useState(null)
  const [impactEnd, setImpactEnd] = useState(null)

  // =========================================================================
  // 9. AUDIT LOG VIEWER STATE
  // =========================================================================
  const [adminAuditLogs, setAdminAuditLogs] = useState([])
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false)
  const [auditActionFilter, setAuditActionFilter] = useState('ALL')
  const [auditEntityFilter, setAuditEntityFilter] = useState('ALL')
  const [auditSearch, setAuditSearch] = useState('')

  // =========================================================================
  // 10. PLATFORM SETTINGS STATE
  // =========================================================================
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'FoodBridge Sri Lanka',
    supportEmail: 'support@foodbridge.lk',
    supportPhone: '+94 11 234 5678',
    contactAddress: '100 Galle Road, Colombo 03, Sri Lanka',
    maintenanceMode: false,
    requireDocumentVerification: true,
    minFoodExpiryHours: 2,
    animalWelfareEnabled: true,
    groceryCouponsEnabled: true,
    emailNotificationsEnabled: true,
    bankName: 'Bank of Ceylon',
    bankAccountName: 'FoodBridge (Pvt) Ltd',
    bankAccountNumber: '000847291038',
    bankBranch: 'Corporate Branch, Colombo 01',
  })
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Initial Data Load
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    await Promise.all([
      loadOverview(),
      loadPendingVerifications(),
      loadPendingCampaigns(),
      loadPartnerships(),
    ])
    setLoading(false)
  }

  // =========================================================================
  // DATA LOADERS
  // =========================================================================

  const loadOverview = async () => {
    try {
      setLoadingOverview(true)
      const res = await adminApi.getOverview()
      setOverviewData(res.data)
    } catch (err) {
      console.error('Error fetching admin overview', err)
    } finally {
      setLoadingOverview(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const params = {}
      if (userSearch.trim()) params.search = userSearch.trim()
      if (userRoleFilter !== 'ALL') params.role = userRoleFilter
      if (userStatusFilter !== 'ALL') params.status = userStatusFilter
      const res = await adminApi.getUsers(params)
      setAdminUsers(res.data || [])
    } catch (err) {
      console.error('Error loading users', err)
      showToast('Could not load user accounts', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadPendingVerifications = async () => {
    try {
      const res = await adminApi.getPendingVerifications()
      setPendingVerifications(res.data || [])
    } catch (err) {
      console.error('Failed to load pending verifications', err)
      showToast('Failed to load pending verifications queue', 'error')
    }
  }

  const loadListings = async () => {
    try {
      setLoadingListings(true)
      const params = {}
      if (listingTypeFilter !== 'ALL') params.type = listingTypeFilter
      if (listingStatusFilter !== 'ALL') params.status = listingStatusFilter
      if (listingSearch.trim()) params.search = listingSearch.trim()
      const res = await adminApi.getListings(params)
      setAdminListings(res.data || [])
    } catch (err) {
      console.error('Failed to load listings', err)
      showToast('Failed to load marketplace listings', 'error')
    } finally {
      setLoadingListings(false)
    }
  }

  const loadPendingCampaigns = async () => {
    try {
      const res = await campaignApi.getPendingCampaigns()
      setPendingCampaigns(res.data || [])
    } catch (err) {
      console.error('Failed to load pending campaigns', err)
    }
  }

  const loadAllCampaigns = async () => {
    try {
      setLoadingAllCampaigns(true)
      const params = {}
      if (campaignStatusFilter !== 'ALL') params.status = campaignStatusFilter
      if (campaignSearch.trim()) params.search = campaignSearch.trim()
      const res = await adminApi.getAllCampaigns(params)
      setAllCampaigns(res.data || [])
    } catch (err) {
      console.error('Failed to load all campaigns', err)
      showToast('Could not load campaigns list', 'error')
    } finally {
      setLoadingAllCampaigns(false)
    }
  }

  const loadPartnerships = async () => {
    try {
      setLoadingPartnerships(true)
      const res = await partnershipApi.getAdminPartnerships()
      setAdminPartnerships(res.data || [])
    } catch (err) {
      console.error('Failed to load admin partnerships', err)
    } finally {
      setLoadingPartnerships(false)
    }
  }

  const loadContributions = async () => {
    try {
      setLoadingContributions(true)
      const params = {}
      if (contribStatusFilter !== 'ALL') params.status = contribStatusFilter
      if (contribTypeFilter !== 'ALL') params.type = contribTypeFilter
      if (contribSearch.trim()) params.search = contribSearch.trim()
      const [listRes, summaryRes] = await Promise.all([
        adminApi.getContributions(params),
        adminApi.getContributionSummary(),
      ])
      setAdminContributions(listRes.data || [])
      setContributionSummary(summaryRes.data || null)
    } catch (err) {
      console.error('Failed to load contributions', err)
      showToast('Failed to load campaign contributions', 'error')
    } finally {
      setLoadingContributions(false)
    }
  }

  const loadAdminSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true)
      const params = subStatusFilter !== 'ALL' ? { status: subStatusFilter } : {}
      const res = await adminSubscriptionApi.getAll(params)
      setAdminSubscriptions(res.data || [])
    } catch (err) {
      console.error('Error loading subscriptions', err)
      showToast('Could not load subscriptions', 'error')
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const loadPlatformImpact = async (start = impactStart, end = impactEnd) => {
    try {
      setLoadingPlatformImpact(true)
      const params = {}
      if (start) params.startDate = start
      if (end) params.endDate = end
      const res = await impactApi.getPlatformSummary(params)
      setPlatformImpact(res.data)
    } catch (err) {
      console.error('Error fetching admin platform impact', err)
    } finally {
      setLoadingPlatformImpact(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      setLoadingAuditLogs(true)
      const params = { limit: 100 }
      if (auditActionFilter !== 'ALL') params.action = auditActionFilter
      if (auditEntityFilter !== 'ALL') params.entityName = auditEntityFilter
      if (auditSearch.trim()) params.search = auditSearch.trim()
      const res = await adminApi.getAuditLogs(params)
      setAdminAuditLogs(res.data || [])
    } catch (err) {
      console.error('Failed to load audit logs', err)
      showToast('Failed to load system audit logs', 'error')
    } finally {
      setLoadingAuditLogs(false)
    }
  }

  const loadSettings = async () => {
    try {
      setLoadingSettings(true)
      const res = await adminApi.getSettings()
      if (res.data) setPlatformSettings(res.data)
    } catch (err) {
      console.error('Failed to load platform settings', err)
    } finally {
      setLoadingSettings(false)
    }
  }

  // =========================================================================
  // HANDLERS: USER MANAGEMENT
  // =========================================================================

  const handleOpenSuspendModal = (userItem, action) => {
    setSelectedUser(userItem)
    setSuspendActionType(action)
    setSuspendReason('')
    setIsSuspendModalOpen(true)
  }

  const handleConfirmUserStatus = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    setProcessingUserStatus(true)
    const newActiveState = suspendActionType === 'REACTIVATE'
    try {
      await adminApi.updateUserStatus(selectedUser.id, {
        isActive: newActiveState,
        reason: suspendReason.trim() || (newActiveState ? 'Account restored by Administrator' : 'Account suspended for policy violation'),
      })
      showToast(newActiveState ? `User ${selectedUser.fullName} reactivated!` : `User ${selectedUser.fullName} has been suspended.`, newActiveState ? 'success' : 'warning')
      setIsSuspendModalOpen(false)
      loadUsers()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error')
    } finally {
      setProcessingUserStatus(false)
    }
  }

  const handleOpenRoleModal = (userItem) => {
    setSelectedUser(userItem)
    setNewSelectedRole(userItem.role)
    setRoleChangeReason('')
    setIsRoleModalOpen(true)
  }

  const handleConfirmRoleChange = async (e) => {
    e.preventDefault()
    if (!selectedUser || !newSelectedRole) return
    setProcessingRoleChange(true)
    try {
      await adminApi.updateUserRole(selectedUser.id, {
        role: newSelectedRole,
        reason: roleChangeReason.trim() || 'Role changed by administrator',
      })
      showToast(`User ${selectedUser.fullName} role updated to ${newSelectedRole}!`, 'success')
      setIsRoleModalOpen(false)
      loadUsers()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error')
    } finally {
      setProcessingRoleChange(false)
    }
  }

  // =========================================================================
  // HANDLERS: VERIFICATIONS (Rule 2)
  // =========================================================================

  const handleOpenDetails = (org) => {
    setSelectedOrg(org)
    setIsDetailsModalOpen(true)
  }

  const handleApprove = async (org) => {
    setProcessingAction(true)
    try {
      await adminApi.decideVerification(org.organizationType, org.id, {
        status: 'VERIFIED',
        reason: 'Organization registration documents verified by Administrator.',
      })
      showToast(`Approved ${org.name}! Audit log created and notification dispatched (Rule 2).`, 'success')
      setIsDetailsModalOpen(false)
      loadPendingVerifications()
      loadOverview()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve verification', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleOpenReject = (org) => {
    setSelectedOrg(org)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      showToast('A rejection reason is required to notify the organization.', 'error')
      return
    }

    setProcessingAction(true)
    try {
      await adminApi.decideVerification(selectedOrg.organizationType, selectedOrg.id, {
        status: 'REJECTED',
        reason: rejectionReason.trim(),
      })
      showToast(`Rejected verification for ${selectedOrg.name}. Audit log recorded.`, 'warning')
      setIsRejectModalOpen(false)
      setIsDetailsModalOpen(false)
      loadPendingVerifications()
      loadOverview()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject verification', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  // =========================================================================
  // HANDLERS: LISTINGS
  // =========================================================================

  const handleOpenListingStatus = (listing, targetStatus) => {
    setSelectedListing(listing)
    setNewListingStatus(targetStatus)
    setListingStatusReason('')
    setIsListingStatusModalOpen(true)
  }

  const handleConfirmListingStatus = async (e) => {
    e.preventDefault()
    if (!selectedListing) return
    setProcessingListingAction(true)
    try {
      await adminApi.updateListingStatus(selectedListing.type, selectedListing.id, {
        status: newListingStatus,
        reason: listingStatusReason.trim() || `Status updated to ${newListingStatus} by administrator`,
      })
      showToast(`Listing status updated to ${newListingStatus}!`, 'success')
      setIsListingStatusModalOpen(false)
      loadListings()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing status', 'error')
    } finally {
      setProcessingListingAction(false)
    }
  }

  const handleDeleteListing = async (listing) => {
    if (!window.confirm(`Are you sure you want to remove listing "${listing.title}"?`)) return
    try {
      await adminApi.deleteListing(listing.type, listing.id, { reason: 'Removed by platform administrator for violation' })
      showToast('Listing removed successfully', 'info')
      loadListings()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove listing', 'error')
    }
  }

  // =========================================================================
  // HANDLERS: CAMPAIGNS (Rule 3)
  // =========================================================================

  const handleOpenCampaignDetails = (camp) => {
    setSelectedCampaign(camp)
    setIsCampaignDetailsModalOpen(true)
  }

  const handleOpenCampaignModerate = (camp, decision) => {
    setSelectedCampaign(camp)
    setCampaignModerationDecision(decision)
    setCampaignModerationReason(
      decision === 'APPROVE'
        ? 'Verified charity campaign credentials and supporting evidence approved by Administrator.'
        : ''
    )
    setIsCampaignModerateModalOpen(true)
  }

  const handleConfirmCampaignModerate = async (e) => {
    e.preventDefault()
    if (!campaignModerationReason.trim() && campaignModerationDecision === 'REJECT') {
      showToast('A reason is required to decline a campaign.', 'error')
      return
    }

    setProcessingAction(true)
    try {
      await campaignApi.moderateCampaign(selectedCampaign.id, {
        decision: campaignModerationDecision,
        reason: campaignModerationReason.trim() || 'Approved by platform administrator.',
      })
      showToast(
        campaignModerationDecision === 'APPROVE'
          ? `Approved campaign "${selectedCampaign.title}"! Audit log recorded and campaign is now public.`
          : `Declined campaign "${selectedCampaign.title}". Audit log recorded.`,
        campaignModerationDecision === 'APPROVE' ? 'success' : 'warning'
      )
      setIsCampaignModerateModalOpen(false)
      setIsCampaignDetailsModalOpen(false)
      loadPendingCampaigns()
      if (activeAdminTab === 'campaigns') loadAllCampaigns()
      loadOverview()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to moderate campaign', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleToggleCampaignFeatured = async (campaignId, currentFeatured) => {
    try {
      await adminApi.toggleCampaignFeatured(campaignId, !currentFeatured)
      showToast(currentFeatured ? 'Campaign unfeatured' : 'Campaign is now featured on the home banner!', 'success')
      loadAllCampaigns()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle featured status', 'error')
    }
  }

  // =========================================================================
  // HANDLERS: CSR PARTNERSHIPS
  // =========================================================================

  const handleOpenPartnershipDetails = async (partnership) => {
    try {
      const res = await partnershipApi.getPartnershipById(partnership.id)
      setSelectedAdminPartnership(res.data)
      setIsAdminPartnershipModalOpen(true)
    } catch (err) {
      setSelectedAdminPartnership(partnership)
      setIsAdminPartnershipModalOpen(true)
    }
  }

  // =========================================================================
  // HANDLERS: SUBSCRIPTIONS (Rule 8)
  // =========================================================================

  const handleActivateSub = async (subId) => {
    try {
      await adminSubscriptionApi.activate(subId, { notes: 'Bank transfer verified and subscription activated' })
      showToast('Subscription activated successfully!', 'success')
      loadAdminSubscriptions()
      loadOverview()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to activate subscription', 'error')
    }
  }

  const handleRenewSub = async (subId, days = 30) => {
    try {
      await adminSubscriptionApi.renew(subId, { extensionDays: days, notes: `Renewed for ${days} days` })
      showToast(`Subscription renewed for ${days} days!`, 'success')
      loadAdminSubscriptions()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to renew subscription', 'error')
    }
  }

  const handleCancelSub = async (subId) => {
    if (!window.confirm('Are you sure you want to cancel this business subscription?')) return
    try {
      await adminSubscriptionApi.cancel(subId, { notes: 'Cancelled by administrator' })
      showToast('Subscription cancelled', 'info')
      loadAdminSubscriptions()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel subscription', 'error')
    }
  }

  // =========================================================================
  // HANDLERS: SETTINGS
  // =========================================================================

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await adminApi.updateSettings(platformSettings)
      setPlatformSettings(res.data)
      showToast('Platform operational settings updated successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  // =========================================================================
  // COLUMNS DEFINITIONS
  // =========================================================================

  const userColumns = [
    {
      key: 'fullName',
      label: 'User Info',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{row.fullName}</div>
          <div className="text-xs text-muted">{row.email}</div>
          {row.phoneNumber && <div className="text-xs text-muted">{row.phoneNumber}</div>}
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (role) => {
        let badgeClass = 'badge-slate'
        if (role === 'ADMIN') badgeClass = 'badge-rose'
        else if (role === 'RESTAURANT') badgeClass = 'badge-amber'
        else if (role === 'GROCERY') badgeClass = 'badge-sky'
        else if (role === 'CHARITY') badgeClass = 'badge-emerald'
        else if (role === 'ANIMAL_ORG') badgeClass = 'badge-purple'
        return <span className={`badge ${badgeClass}`}>{role}</span>
      },
    },
    {
      key: 'organization',
      label: 'Linked Organization',
      render: (_, row) => (
        <div>
          {row.organizationName ? (
            <>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.organizationName}</div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background:
                    row.verificationStatus === 'VERIFIED'
                      ? '#dcfce7'
                      : row.verificationStatus === 'PENDING'
                      ? '#fef3c7'
                      : '#fee2e2',
                  color:
                    row.verificationStatus === 'VERIFIED'
                      ? '#15803d'
                      : row.verificationStatus === 'PENDING'
                      ? '#b45309'
                      : '#b91c1c',
                }}
              >
                {row.verificationStatus}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted">Individual Member</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Account Status',
      render: (isActive) => (
        <span className={`badge ${isActive ? 'badge-emerald' : 'badge-rose'}`}>
          {isActive ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      render: (date) => (
        <span className="text-xs text-muted">
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<UserCog size={13} />}
            onClick={() => handleOpenRoleModal(row)}
          >
            Role
          </Button>
          {row.isActive ? (
            <Button
              size="sm"
              variant="outline"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              icon={<UserX size={13} />}
              onClick={() => handleOpenSuspendModal(row, 'SUSPEND')}
            >
              Suspend
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              icon={<UserCheck size={13} />}
              onClick={() => handleOpenSuspendModal(row, 'REACTIVATE')}
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ]

  const verificationColumns = [
    {
      key: 'name',
      label: 'Organization Name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.name}</div>
          <div className="text-xs text-muted">Reg: {row.registrationNumber || 'Pending'}</div>
        </div>
      ),
    },
    {
      key: 'organizationType',
      label: 'Type',
      render: (type, row) => (
        <span
          className={`badge ${
            type === 'CHARITY'
              ? 'badge-emerald'
              : type === 'ANIMAL_ORG'
              ? 'badge-purple'
              : row.category === 'GROCERY'
              ? 'badge-sky'
              : 'badge-amber'
          }`}
        >
          {type === 'ANIMAL_ORG' ? 'Animal Welfare' : type}
        </span>
      ),
    },
    { key: 'district', label: 'District' },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="text-xs">
          <div>{row.contactPerson || 'N/A'}</div>
          <div className="text-muted">{row.contactPhone || row.contactEmail}</div>
        </div>
      ),
    },
    {
      key: 'documentUrl',
      label: 'Evidence Document',
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--color-primary-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <FileText size={14} /> Review Document
          </a>
        ) : (
          <span className="text-xs text-muted">No Doc Attached</span>
        ),
    },
    {
      key: 'actions',
      label: 'Decision (Rule 2)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<Eye size={13} />}
            onClick={() => handleOpenDetails(row)}
          >
            Review
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={13} />}
            onClick={() => handleApprove(row)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<X size={13} />}
            onClick={() => handleOpenReject(row)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const listingColumns = [
    {
      key: 'title',
      label: 'Listing Info',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{row.title}</div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem', alignItems: 'center' }}>
            <span className={`badge ${row.type === 'FOOD_RESCUE' ? 'badge-amber' : 'badge-sky'}`}>
              {row.type === 'FOOD_RESCUE' ? 'Food Surplus' : 'Grocery Deal'}
            </span>
            <span className="text-xs text-muted">{row.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'businessName',
      label: 'Business Partner',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{row.businessName}</div>
          <div className="text-xs text-muted">{row.businessType}</div>
        </div>
      ),
    },
    {
      key: 'quantityOrPrice',
      label: 'Quantity / Pricing',
      render: (_, row) => (
        <div>
          {row.type === 'FOOD_RESCUE' ? (
            <div style={{ fontWeight: 700 }}>
              {row.quantity} {row.unit}
            </div>
          ) : (
            <div>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>
                LKR {Number(row.price).toLocaleString()}
              </span>{' '}
              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.78rem' }}>
                LKR {Number(row.originalPrice).toLocaleString()}
              </span>
              <div className="text-xs text-muted">{row.quantity} in stock</div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'animalSuitable',
      label: 'Suitability (Rule 7)',
      render: (_, row) => (
        <div>
          {row.animalSuitable ? (
            <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
              Animal Suitable
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              Human Only
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        let badgeClass = 'badge-slate'
        if (status === 'AVAILABLE') badgeClass = 'badge-emerald'
        else if (status === 'RESERVED' || status === 'PENDING') badgeClass = 'badge-amber'
        else if (status === 'COLLECTED' || status === 'SOLD_OUT') badgeClass = 'badge-sky'
        else if (status === 'CANCELLED' || status === 'EXPIRED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{status}</span>
      },
    },
    {
      key: 'actions',
      label: 'Moderation Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {row.status === 'AVAILABLE' ? (
            <Button
              size="sm"
              variant="outline"
              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              icon={<Ban size={13} />}
              onClick={() => handleOpenListingStatus(row, 'CANCELLED')}
            >
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              icon={<CheckCircle2 size={13} />}
              onClick={() => handleOpenListingStatus(row, 'AVAILABLE')}
            >
              Restore
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            style={{ color: '#b91c1c' }}
            icon={<Trash2 size={13} />}
            onClick={() => handleDeleteListing(row)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ]

  const campaignColumns = [
    {
      key: 'title',
      label: 'Campaign Details',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{row.title}</div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', alignItems: 'center' }}>
            <span className="badge badge-sky">{row.needType}</span>
            <span className="text-xs text-muted">{row.district} District</span>
            {row.isFeatured && (
              <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                Featured
              </span>
            )}
            {row.isSponsored && (
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                Sponsored
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'charityName',
      label: 'Organizer',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.charityName || 'Community Organizer'}</div>
          <div className="text-xs text-muted">{row.organizerType}</div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Target & Progress',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
            {row.currentQuantity} / {row.targetQuantity} {row.targetUnit}
          </div>
          <div className="text-xs text-muted">{row.progressPercentage}% reached</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        let badgeClass = 'badge-slate'
        if (status === 'ACTIVE') badgeClass = 'badge-emerald'
        else if (status === 'PENDING_APPROVAL') badgeClass = 'badge-amber'
        else if (status === 'COMPLETED') badgeClass = 'badge-sky'
        else if (status === 'CANCELLED' || status === 'REJECTED') badgeClass = 'badge-rose'
        return <span className={`badge ${badgeClass}`}>{status}</span>
      },
    },
    {
      key: 'actions',
      label: 'Moderation Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<Eye size={13} />}
            onClick={() => handleOpenCampaignDetails(row)}
          >
            Review
          </Button>
          {row.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                size="sm"
                variant="primary"
                icon={<Check size={13} />}
                onClick={() => handleOpenCampaignModerate(row, 'APPROVE')}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={<X size={13} />}
                onClick={() => handleOpenCampaignModerate(row, 'REJECT')}
              >
                Reject
              </Button>
            </>
          )}
          {row.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              icon={<Star size={13} />}
              style={row.isFeatured ? { background: '#fef3c7', color: '#b45309' } : {}}
              onClick={() => handleToggleCampaignFeatured(row.id, row.isFeatured)}
            >
              {row.isFeatured ? 'Unfeature' : 'Feature'}
            </Button>
          )}
        </div>
      ),
    },
  ]

  const contributionColumns = [
    {
      key: 'contributorName',
      label: 'Donor / Contributor',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.contributorName}</div>
          <div className="text-xs text-muted">{row.contributorEmail || 'Anonymous'}</div>
        </div>
      ),
    },
    {
      key: 'campaignTitle',
      label: 'Campaign & Charity',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.campaignTitle}</div>
          <div className="text-xs text-muted">{row.charityName}</div>
        </div>
      ),
    },
    {
      key: 'contributionType',
      label: 'Contribution Type',
      render: (type) => (
        <span className={`badge ${type === 'MONETARY' ? 'badge-emerald' : 'badge-amber'}`}>
          {type}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Value / Amount',
      render: (_, row) => (
        <div style={{ fontWeight: 700 }}>
          {row.contributionType === 'MONETARY'
            ? `LKR ${Number(row.monetaryAmount || 0).toLocaleString()}`
            : row.foodAmountKg
            ? `${row.foodAmountKg} kg food`
            : row.otherResourceDescription || 'Goods'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Receipt Status',
      render: (status) => (
        <span className={`badge ${status === 'CONFIRMED' ? 'badge-emerald' : status === 'PLEDGED' ? 'badge-amber' : 'badge-rose'}`}>
          {status}
        </span>
      ),
    },
    {
      key: 'receiptNumber',
      label: 'Reference No.',
      render: (val) => (
        <code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
          {val}
        </code>
      ),
    },
  ]

  const auditLogColumns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (val) => (
        <div style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          {val ? new Date(val).toLocaleString() : 'N/A'}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Actor / Admin',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{row.userName}</div>
          <div className="text-xs text-muted">{row.userEmail}</div>
          <span className="badge badge-slate" style={{ fontSize: '0.68rem', marginTop: '2px' }}>
            {row.userRole}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action Taken',
      render: (val) => (
        <span className="badge badge-sky" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'entity',
      label: 'Target Entity',
      render: (_, row) => (
        <div>
          <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
            {row.entityName}
          </span>
          {row.entityId && (
            <div className="text-xs text-muted" style={{ fontFamily: 'monospace', marginTop: '2px' }}>
              {row.entityId.toString().substring(0, 8)}...
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Audit Trail Details',
      render: (val, row) => (
        <div style={{ fontSize: '0.82rem', lineHeight: 1.4, maxWidth: '350px' }}>
          {val}
          <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
            IP: {row.ipAddress || '0.0.0.0'}
          </div>
        </div>
      ),
    },
  ]

  const partnershipColumns = [
    {
      key: 'partner',
      label: 'Corporate Sponsor',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.businessName}</div>
          <div className="text-xs text-muted">{row.businessEmail}</div>
        </div>
      ),
    },
    {
      key: 'campaign',
      label: 'Relief Campaign',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.campaignTitle}</div>
          <div className="text-xs text-muted">
            Organizer: {row.charityName} ({row.campaignDistrict || 'National'})
          </div>
        </div>
      ),
    },
    {
      key: 'pledgedType',
      label: 'Committed Support',
      render: (type, row) => (
        <div>
          <span className="badge badge-purple">
            {type === 'MONETARY_PLEDGE' ? 'Money Pledge' : type === 'FOOD_ITEMS' ? 'Food Supplies' : 'Other Resources'}
          </span>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
            {type === 'MONETARY_PLEDGE' && row.monetaryAmount
              ? `Rs. ${Number(row.monetaryAmount).toLocaleString()}`
              : `${row.quantity} ${row.unit || 'units'}`}
          </div>
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
      render: (active, row) =>
        active ? (
          <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={12} /> Active ({row.agreedRecognition || 'Official Partner'})
          </span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.75rem' }}>
            <Lock size={12} />
            <span>Locked (Receipt pending)</span>
          </div>
        ),
    },
    {
      key: 'actions',
      label: 'Audit & Inspect',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          icon={<Eye size={13} />}
          onClick={() => handleOpenPartnershipDetails(row)}
        >
          Audit Details
        </Button>
      ),
    },
  ]

  return (
    <div>
      {/* Admin Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p className="text-sm text-muted">
            Executive oversight, governance enforcement (Rules 1-8), user management, moderation, and operational settings.
          </p>
        </div>

        <Button
          variant="outline"
          icon={<RefreshCw size={15} />}
          onClick={() => {
            loadInitialData()
            if (activeAdminTab === 'users') loadUsers()
            if (activeAdminTab === 'listings') loadListings()
            if (activeAdminTab === 'campaigns') loadAllCampaigns()
            if (activeAdminTab === 'audit_logs') loadAuditLogs()
            if (activeAdminTab === 'settings') loadSettings()
            if (activeAdminTab === 'subscriptions') loadAdminSubscriptions()
            if (activeAdminTab === 'impact') loadPlatformImpact()
          }}
          loading={loading}
        >
          Refresh Data
        </Button>
      </div>

      {/* Navigation Tabs Bar (Scrollable) */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'overview', label: 'Platform Overview', icon: <LayoutDashboard size={17} /> },
          { id: 'users', label: 'User Management', icon: <Users size={17} /> },
          {
            id: 'verifications',
            label: `Verification Queue (${pendingVerifications.length})`,
            icon: <ShieldCheck size={17} />,
            badge: pendingVerifications.length > 0 ? pendingVerifications.length : null,
          },
          { id: 'listings', label: 'Listing Management', icon: <ShoppingBag size={17} /> },
          {
            id: 'campaigns',
            label: `Campaign Moderation (${pendingCampaigns.length})`,
            icon: <ClipboardList size={17} />,
            badge: pendingCampaigns.length > 0 ? pendingCampaigns.length : null,
          },
          { id: 'partnerships', label: 'Partnerships & Donations', icon: <Handshake size={17} /> },
          { id: 'subscriptions', label: 'Subscription Packages', icon: <CreditCard size={17} /> },
          { id: 'impact', label: 'Impact Reports', icon: <TrendingUp size={17} /> },
          { id: 'audit_logs', label: 'Audit Log Viewer', icon: <Activity size={17} /> },
          { id: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveAdminTab(tab.id)
              if (tab.id === 'users') loadUsers()
              if (tab.id === 'listings') loadListings()
              if (tab.id === 'campaigns') loadAllCampaigns()
              if (tab.id === 'partnerships') loadContributions()
              if (tab.id === 'audit_logs') loadAuditLogs()
              if (tab.id === 'settings') loadSettings()
              if (tab.id === 'subscriptions') loadAdminSubscriptions()
              if (tab.id === 'impact') loadPlatformImpact()
              if (tab.id === 'overview') loadOverview()
            }}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: 'none',
              border: 'none',
              borderBottom: activeAdminTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeAdminTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                  fontWeight: 800,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PLATFORM OVERVIEW & KEY METRICS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive Overview KPI Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted uppercase font-bold">Total Platform Users</span>
                <Users size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {overviewData?.totalUsers ?? '...'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.25rem' }}>
                {overviewData?.activeUsers ?? 0} Active • {overviewData?.suspendedUsers ?? 0} Suspended
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted uppercase font-bold">Partner Verifications</span>
                <ShieldCheck size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: overviewData?.pendingVerifications > 0 ? '#b45309' : '#0f172a' }}>
                {overviewData?.pendingVerifications ?? 0} Pending
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {(overviewData?.verifiedBusinesses || 0) + (overviewData?.verifiedCharities || 0) + (overviewData?.verifiedAnimalOrgs || 0)} Verified Orgs
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted uppercase font-bold">Active Marketplace</span>
                <ShoppingBag size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {(overviewData?.activeFoodListings || 0) + (overviewData?.activeGroceryOffers || 0)} Live
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {overviewData?.activeFoodListings ?? 0} Rescue • {overviewData?.activeGroceryOffers ?? 0} Grocery
              </div>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="text-xs text-muted uppercase font-bold">SaaS Revenue (Rule 8)</span>
                <DollarSign size={18} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed' }}>
                LKR {Number(overviewData?.platformRevenueLkr || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                {overviewData?.activeSubscriptions ?? 0} Active Subscriptions
              </div>
            </Card>
          </div>

          {/* Quick Action Navigation Banners */}
          <div className="grid grid-cols-3 gap-4">
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} />
                  <span>Review Verifications</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#1e3a8a', margin: 0 }}>
                  {pendingVerifications.length} businesses and non-profits are awaiting registration approval.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                style={{ marginTop: '1rem', width: 'fit-content' }}
                onClick={() => setActiveAdminTab('verifications')}
              >
                Go to Verification Queue &rarr;
              </Button>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #fef08a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#854d0e', marginBottom: '0.35rem' }}>
                  <ClipboardList size={18} />
                  <span>Moderate Campaigns</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#713f12', margin: 0 }}>
                  {pendingCampaigns.length} campaigns require credential & evidence verification (Rule 3).
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                style={{ marginTop: '1rem', width: 'fit-content', borderColor: '#ca8a04', color: '#854d0e' }}
                onClick={() => {
                  setActiveAdminTab('campaigns')
                  loadAllCampaigns()
                }}
              >
                Moderate Campaigns &rarr;
              </Button>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #ddd6fe',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#5b21b6', marginBottom: '0.35rem' }}>
                  <CreditCard size={18} />
                  <span>Subscription Bank Transfers</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#4c1d95', margin: 0 }}>
                  Verify manual bank transfer slips and activate commercial packages.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                style={{ marginTop: '1rem', width: 'fit-content', borderColor: '#8b5cf6', color: '#5b21b6' }}
                onClick={() => {
                  setActiveAdminTab('subscriptions')
                  loadAdminSubscriptions()
                }}
              >
                Manage Subscriptions &rarr;
              </Button>
            </div>
          </div>

          {/* Detailed Ecosystem Summary */}
          <div className="grid grid-cols-2 gap-6">
            <Card title="User Roles & Demographics" subtitle="Role-Based Access Control distribution across registered accounts (Rule 1)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {overviewData?.usersByRole &&
                  Object.entries(overviewData.usersByRole).map(([role, count]) => (
                    <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span className="font-semibold text-sm">{role}</span>
                      <span className="badge badge-slate">{count} Accounts</span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title="Verified Impact Aggregate" subtitle="Immutable verified relief metrics from completed handovers">
              <div className="grid grid-cols-3 gap-3" style={{ textAlign: 'center' }}>
                <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                    {Number(overviewData?.totalKgFoodRescued || 0).toLocaleString()} kg
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Food Rescued</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                    {Number(overviewData?.peopleSupported || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>People Fed</div>
                </div>
                <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9333ea' }}>
                    {Number(overviewData?.animalsSupported || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7e22ce', fontWeight: 600 }}>Animals Fed</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent System Activity Preview */}
          <Card
            title="Recent System Audit Activity"
            subtitle="Live feed of governance actions, verification changes, and system modifications"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveAdminTab('audit_logs')
                  loadAuditLogs()
                }}
              >
                View Full Audit Trail &rarr;
              </Button>
            }
          >
            {overviewData?.recentAuditLogs?.length > 0 ? (
              <Table columns={auditLogColumns} data={overviewData.recentAuditLogs} />
            ) : (
              <div className="text-center text-muted p-4">No recent audit events.</div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <Card
          title="Platform User Management"
          subtitle="Search, inspect, suspend, or update roles for all registered FoodBridge users."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={13} />}
              onClick={loadUsers}
              loading={loadingUsers}
            >
              Refresh Users
            </Button>
          }
        >
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value)
                setTimeout(loadUsers, 0)
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                background: 'var(--color-surface)',
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Citizen / Community</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="GROCERY">Grocery</option>
              <option value="CHARITY">Charity</option>
              <option value="ANIMAL_ORG">Animal Welfare</option>
              <option value="ADMIN">Administrator</option>
            </select>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setUserStatusFilter(st)
                    setTimeout(loadUsers, 0)
                  }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid var(--color-border)',
                    background: userStatusFilter === st ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: userStatusFilter === st ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <Button size="sm" variant="primary" onClick={loadUsers}>
              Filter
            </Button>
          </div>

          {loadingUsers ? (
            <Loader text="Loading users..." />
          ) : (
            <Table columns={userColumns} data={adminUsers} emptyMessage="No users found matching your search criteria." />
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VERIFICATION QUEUE (Rule 2) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'verifications' && (
        <Card
          title="Organization Verification Queue (Rule 2)"
          subtitle="Non-negotiable rule: Businesses, Charities, and Animal Shelters are strictly blocked from publishing listings or campaigns until verified by an Administrator."
          badge={
            <span className={`badge ${pendingVerifications.length > 0 ? 'badge-amber' : 'badge-emerald'}`}>
              {pendingVerifications.length} Pending
            </span>
          }
        >
          {loading ? (
            <Loader text="Loading pending verifications..." />
          ) : (
            <Table
              columns={verificationColumns}
              data={pendingVerifications}
              emptyMessage="All partner organizations have been verified. No pending items!"
            />
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LISTING MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'listings' && (
        <Card
          title="Marketplace Listing Management"
          subtitle="Monitor and moderate Food Rescue Surplus listings and Discounted Grocery Offers across the platform."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={13} />}
              onClick={loadListings}
              loading={loadingListings}
            >
              Refresh Listings
            </Button>
          }
        >
          {/* Listing Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search listings by title or business..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadListings()}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'FOOD_RESCUE', label: 'Food Surplus' },
                { id: 'GROCERY_OFFER', label: 'Grocery Deals' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setListingTypeFilter(t.id)
                    setTimeout(loadListings, 0)
                  }}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid var(--color-border)',
                    background: listingTypeFilter === t.id ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: listingTypeFilter === t.id ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={listingStatusFilter}
              onChange={(e) => {
                setListingStatusFilter(e.target.value)
                setTimeout(loadListings, 0)
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                background: 'var(--color-surface)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="COLLECTED">Collected / Sold Out</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <Button size="sm" variant="primary" onClick={loadListings}>
              Filter
            </Button>
          </div>

          {loadingListings ? (
            <Loader text="Loading listings..." />
          ) : (
            <Table columns={listingColumns} data={adminListings} emptyMessage="No listings found matching the criteria." />
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CAMPAIGN MODERATION */}
      {/* ========================================================================= */}
      {activeAdminTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Pending Approval Queue */}
          <Card
            title="Pending Campaign Approvals (Rule 3)"
            subtitle="Charity campaigns must have official credentials and Grama Niladhari or school evidence reviewed before going public."
            badge={<span className="badge badge-sky">{pendingCampaigns.length} Review</span>}
          >
            <Table
              columns={campaignColumns}
              data={pendingCampaigns}
              emptyMessage="No campaigns pending review. All submissions are current!"
            />
          </Card>

          {/* All Platform Campaigns Directory */}
          <Card
            title="Platform Campaigns Directory"
            subtitle="Inspect all community campaigns, toggle home banner featured placements, or cancel compromised campaigns."
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<RefreshCw size={13} />}
                onClick={loadAllCampaigns}
                loading={loadingAllCampaigns}
              >
                Refresh All
              </Button>
            }
          >
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search campaigns by title or district..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAllCampaigns()}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              />
              <select
                value={campaignStatusFilter}
                onChange={(e) => {
                  setCampaignStatusFilter(e.target.value)
                  setTimeout(loadAllCampaigns, 0)
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                  background: 'var(--color-surface)',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button size="sm" variant="primary" onClick={loadAllCampaigns}>
                Filter
              </Button>
            </div>

            {loadingAllCampaigns ? (
              <Loader text="Loading campaigns..." />
            ) : (
              <Table columns={campaignColumns} data={allCampaigns} emptyMessage="No campaigns found." />
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PARTNERSHIPS & CONTRIBUTIONS MONITORING */}
      {/* ========================================================================= */}
      {activeAdminTab === 'partnerships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Subtab Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '8px', width: 'fit-content' }}>
            <button
              onClick={() => setPartnershipSubTab('PARTNERSHIPS')}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                background: partnershipSubTab === 'PARTNERSHIPS' ? '#fff' : 'transparent',
                color: partnershipSubTab === 'PARTNERSHIPS' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: partnershipSubTab === 'PARTNERSHIPS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              CSR Corporate Partnerships ({adminPartnerships.length})
            </button>
            <button
              onClick={() => {
                setPartnershipSubTab('CONTRIBUTIONS')
                loadContributions()
              }}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                background: partnershipSubTab === 'CONTRIBUTIONS' ? '#fff' : 'transparent',
                color: partnershipSubTab === 'CONTRIBUTIONS' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: partnershipSubTab === 'CONTRIBUTIONS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              Public & Business Donations ({adminContributions.length})
            </button>
          </div>

          {partnershipSubTab === 'PARTNERSHIPS' ? (
            <Card
              title="CSR Business-to-Charity Partnership Governance"
              subtitle="Audit corporate sponsorship contracts, verify delivery confirmations, and ensure promotional recognition remains gated until delivery."
            >
              {loadingPartnerships ? (
                <Loader text="Loading partnerships..." />
              ) : (
                <Table columns={partnershipColumns} data={adminPartnerships} emptyMessage="No corporate partnerships registered yet." />
              )}
            </Card>
          ) : (
            <Card
              title="Campaign Contribution Monitoring"
              subtitle="Track public and business monetary pledges and in-kind food donations across campaigns."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  icon={<RefreshCw size={13} />}
                  onClick={loadContributions}
                  loading={loadingContributions}
                >
                  Refresh Contributions
                </Button>
              }
            >
              {/* Contribution KPI Summary */}
              {contributionSummary && (
                <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div className="text-xs text-muted uppercase font-bold">Total Recorded</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{contributionSummary.totalContributions}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div className="text-xs text-muted uppercase font-bold">Confirmed Monetary</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                      LKR {Number(contributionSummary.totalMonetaryAmountLkr || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div className="text-xs text-muted uppercase font-bold">Confirmed Food</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                      {Number(contributionSummary.totalFoodAmountKg || 0).toLocaleString()} kg
                    </div>
                  </div>
                  <div style={{ background: '#fefce8', padding: '1rem', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div className="text-xs text-muted uppercase font-bold">Pending Confirmation</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309' }}>
                      {contributionSummary.pledgedContributions} Pledges
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search donor or campaign..."
                  value={contribSearch}
                  onChange={(e) => setContribSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadContributions()}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                  }}
                />
                <select
                  value={contribStatusFilter}
                  onChange={(e) => {
                    setContribStatusFilter(e.target.value)
                    setTimeout(loadContributions, 0)
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    background: 'var(--color-surface)',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PLEDGED">Pledged</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                  value={contribTypeFilter}
                  onChange={(e) => {
                    setContribTypeFilter(e.target.value)
                    setTimeout(loadContributions, 0)
                  }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.85rem',
                    background: 'var(--color-surface)',
                  }}
                >
                  <option value="ALL">All Types</option>
                  <option value="MONETARY">Monetary</option>
                  <option value="FOOD_ITEMS">Food Items</option>
                  <option value="OTHER_RESOURCES">Other Resources</option>
                </select>
                <Button size="sm" variant="primary" onClick={loadContributions}>
                  Filter
                </Button>
              </div>

              {loadingContributions ? (
                <Loader text="Loading contributions..." />
              ) : (
                <Table columns={contributionColumns} data={adminContributions} emptyMessage="No contributions recorded." />
              )}
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SUBSCRIPTIONS (Rule 8) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Rule 8 Compliance Notice */}
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={28} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>
                  Rule 8 Financial Segregation Enforced
                </h3>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  SaaS Revenue Ledger
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#047857', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>
                Platform commercial subscription fees (Free, Promotion, Premium tiers) are maintained strictly within this operational ledger. They are completely separated from charitable relief donations and community campaign contributions.
              </p>
            </div>
          </div>

          {/* Subscriptions Table */}
          <Card
            title="Business Subscriptions & Manual Bank Transfer Verifications"
            subtitle="Verify manual bank transfer references, activate requested packages, renew durations, or cancel subscriptions."
            action={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ALL', 'PENDING_ACTIVATION', 'ACTIVE', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSubStatusFilter(st)
                      setTimeout(loadAdminSubscriptions, 0)
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid var(--color-border)',
                      background: subStatusFilter === st ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: subStatusFilter === st ? '#fff' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            }
          >
            {loadingSubscriptions ? (
              <Loader text="Loading subscriptions..." />
            ) : adminSubscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CreditCard size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                  No Business Subscriptions Found
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Business</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Cycle</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Payment Ref / Slip</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 1rem' }}>End Date</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSubscriptions
                      .filter((s) => subStatusFilter === 'ALL' || s.status === subStatusFilter)
                      .map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{sub.businessName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{sub.businessEmail}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
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
                          <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                            <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                              {sub.paymentReference || 'N/A'}
                            </code>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-emerald' : sub.status === 'PENDING_ACTIVATION' ? 'badge-amber' : 'badge-slate'}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Continuous'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {sub.status === 'PENDING_ACTIVATION' && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleActivateSub(sub.id)}
                                >
                                  Verify & Activate
                                </Button>
                              )}
                              {sub.status === 'ACTIVE' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleRenewSub(sub.id, 30)}>
                                    +30d
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleRenewSub(sub.id, 365)}>
                                    +1yr
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                    onClick={() => handleCancelSub(sub.id)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {sub.status === 'CANCELLED' && (
                                <Button size="sm" variant="outline" onClick={() => handleActivateSub(sub.id)}>
                                  Reactivate
                                </Button>
                              )}
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

      {/* ========================================================================= */}
      {/* TAB 8: IMPACT REPORTS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'impact' && (
        <Card
          title="National FoodBridge Impact Analytics & Verification Ledger"
          subtitle="All aggregated metrics are strictly computed from completed, organizer-verified actions (Rule 6). Unverified records are strictly excluded."
        >
          {loadingPlatformImpact ? (
            <Loader text="Loading national impact analytics..." />
          ) : (
            <ImpactAnalyticsView
              summary={platformImpact}
              title="National Impact Ledger"
              allowExport={true}
              onDateFilterChange={(start, end) => {
                setImpactStart(start)
                setImpactEnd(end)
                loadPlatformImpact(start, end)
              }}
            />
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: AUDIT LOG VIEWER */}
      {/* ========================================================================= */}
      {activeAdminTab === 'audit_logs' && (
        <Card
          title="System Security & Governance Audit Trail"
          subtitle="Complete immutable log of administrative decisions, role modifications, status changes, and workflow milestones."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<RefreshCw size={13} />}
              onClick={loadAuditLogs}
              loading={loadingAuditLogs}
            >
              Refresh Logs
            </Button>
          }
        >
          {/* Audit Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search audit details or user..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAuditLogs()}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <select
              value={auditEntityFilter}
              onChange={(e) => {
                setAuditEntityFilter(e.target.value)
                setTimeout(loadAuditLogs, 0)
              }}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                background: 'var(--color-surface)',
              }}
            >
              <option value="ALL">All Entities</option>
              <option value="USER">User</option>
              <option value="BUSINESS">Business</option>
              <option value="CHARITY">Charity</option>
              <option value="ANIMAL_ORG">Animal Org</option>
              <option value="CAMPAIGN">Campaign</option>
              <option value="FOOD_LISTING">Food Listing</option>
              <option value="GROCERY_OFFER">Grocery Offer</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="PLATFORM_SETTINGS">Platform Settings</option>
            </select>

            <Button size="sm" variant="primary" onClick={loadAuditLogs}>
              Filter
            </Button>
          </div>

          {loadingAuditLogs ? (
            <Loader text="Loading audit logs..." />
          ) : (
            <Table columns={auditLogColumns} data={adminAuditLogs} emptyMessage="No audit logs match the selected filter." />
          )}
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: SETTINGS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'settings' && (
        <Card
          title="Platform Operational Settings & Rules"
          subtitle="Configure system-wide settings, operational toggles, expiry rules, and bank transfer credentials."
        >
          <form onSubmit={handleSaveSettings}>
            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '1.5rem' }}>
              {/* General Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: 'var(--color-primary)' }}>
                  Platform Contact Information
                </h4>
                <Input
                  label="Platform Name"
                  required
                  value={platformSettings.platformName || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                />
                <Input
                  label="Support Email"
                  type="email"
                  required
                  value={platformSettings.supportEmail || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                />
                <Input
                  label="Support Phone"
                  value={platformSettings.supportPhone || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                />
                <Input
                  label="Official Physical Address"
                  value={platformSettings.contactAddress || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, contactAddress: e.target.value })}
                />
              </div>

              {/* Operational Rules & Expiry */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, color: 'var(--color-primary)' }}>
                  Operational Rules & Policies
                </h4>
                <Input
                  label="Minimum Food Expiry Notice (Hours)"
                  type="number"
                  required
                  min={1}
                  max={48}
                  value={platformSettings.minFoodExpiryHours || 2}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, minFoodExpiryHours: parseInt(e.target.value) || 2 })}
                  hint="Listings must have at least this many hours of shelf-life prior to publication."
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={platformSettings.requireDocumentVerification ?? true}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, requireDocumentVerification: e.target.checked })}
                    />
                    <strong>Require Document Verification (Rule 2)</strong>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={platformSettings.animalWelfareEnabled ?? true}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, animalWelfareEnabled: e.target.checked })}
                    />
                    <span>Animal Welfare Support Module Enabled (Rule 7)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={platformSettings.groceryCouponsEnabled ?? true}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, groceryCouponsEnabled: e.target.checked })}
                    />
                    <span>Budget Grocery Discount Module Enabled</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={platformSettings.emailNotificationsEnabled ?? true}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, emailNotificationsEnabled: e.target.checked })}
                    />
                    <span>In-App and Email Notification Delivery Enabled</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#dc2626' }}>
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode ?? false}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })}
                    />
                    <strong>Platform Maintenance Mode (Suspend Non-Admin Access)</strong>
                  </label>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
                Bank Transfer Credentials (for Manual Subscription Payments)
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <Input
                  label="Bank Name"
                  value={platformSettings.bankName || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, bankName: e.target.value })}
                />
                <Input
                  label="Account Holder Name"
                  value={platformSettings.bankAccountName || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, bankAccountName: e.target.value })}
                />
                <Input
                  label="Account Number"
                  value={platformSettings.bankAccountNumber || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, bankAccountNumber: e.target.value })}
                />
                <Input
                  label="Branch"
                  value={platformSettings.bankBranch || ''}
                  onChange={(e) => setPlatformSettings({ ...platformSettings, bankBranch: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" icon={<Save size={15} />} loading={savingSettings}>
                Save Platform Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Suspend / Reactivate User Modal */}
      <Modal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        title={suspendActionType === 'SUSPEND' ? `Suspend Account: ${selectedUser?.fullName}` : `Reactivate Account: ${selectedUser?.fullName}`}
        subtitle={`User email: ${selectedUser?.email} • Current status: ${selectedUser?.isActive ? 'ACTIVE' : 'SUSPENDED'}`}
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmUserStatus}>
          <Textarea
            label="Administrative Reason"
            required
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder={
              suspendActionType === 'SUSPEND'
                ? 'e.g. Account suspended due to reported listing violations.'
                : 'e.g. Account restored after resolution of verification requirements.'
            }
            helper="This reason is logged in audit_logs and visible in compliance reports."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={suspendActionType === 'SUSPEND' ? 'danger' : 'primary'}
              loading={processingUserStatus}
            >
              Confirm {suspendActionType === 'SUSPEND' ? 'Suspension' : 'Reactivation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change User Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Change Role: ${selectedUser?.fullName}`}
        subtitle={`Current Role: ${selectedUser?.role}`}
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmRoleChange}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">New System Role *</label>
            <select
              value={newSelectedRole}
              onChange={(e) => setNewSelectedRole(e.target.value)}
              className="form-select"
              required
            >
              <option value="USER">USER (Citizen / Member)</option>
              <option value="RESTAURANT">RESTAURANT (Commercial Kitchen)</option>
              <option value="GROCERY">GROCERY (Retail Supermarket)</option>
              <option value="CHARITY">CHARITY (Registered Relief Non-Profit)</option>
              <option value="ANIMAL_ORG">ANIMAL_ORG (Shelter / Welfare)</option>
              <option value="ADMIN">ADMIN (Platform Administrator)</option>
            </select>
          </div>

          <Textarea
            label="Reason for Role Change"
            rows={3}
            value={roleChangeReason}
            onChange={(e) => setRoleChangeReason(e.target.value)}
            placeholder="e.g. Upgrading verified community member to organization admin."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={processingRoleChange}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Override Listing Status Modal */}
      <Modal
        isOpen={isListingStatusModalOpen}
        onClose={() => setIsListingStatusModalOpen(false)}
        title={`Change Listing Status: ${selectedListing?.title}`}
        subtitle={`Type: ${selectedListing?.type} • Target: ${newListingStatus}`}
        maxWidth="500px"
      >
        <form onSubmit={handleConfirmListingStatus}>
          <Textarea
            label="Reason for Status Change"
            rows={3}
            value={listingStatusReason}
            onChange={(e) => setListingStatusReason(e.target.value)}
            placeholder="e.g. Listing expired prior to scheduled pickup window."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsListingStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={processingListingAction}>
              Confirm Status Override
            </Button>
          </div>
        </form>
      </Modal>

      {/* Organization Document Review Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedOrg?.name || 'Organization Review'}
        subtitle={`Type: ${selectedOrg?.organizationType} (${selectedOrg?.category}) • Reg No: ${selectedOrg?.registrationNumber || 'Pending'}`}
        maxWidth="700px"
      >
        {selectedOrg && (
          <div>
            <div
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Organization Summary
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {selectedOrg.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Physical Location
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <div>{selectedOrg.addressLine1}</div>
                  <div>{selectedOrg.city}, {selectedOrg.district} District</div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Users size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Contact Information
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <div><strong>Person:</strong> {selectedOrg.contactPerson || 'Not provided'}</div>
                  <div><strong>Email:</strong> {selectedOrg.contactEmail || 'Not provided'}</div>
                  <div><strong>Phone:</strong> {selectedOrg.contactPhone || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {selectedOrg.documentUrl && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af' }}>
                  <FileText size={24} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      Official Registration Certificate
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                      Verify official documentation before granting rights
                    </div>
                  </div>
                </div>
                <a
                  href={selectedOrg.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> Open Document
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="danger"
                icon={<X size={14} />}
                onClick={() => handleOpenReject(selectedOrg)}
                loading={processingAction}
              >
                Reject Profile
              </Button>
              <Button
                variant="primary"
                icon={<Check size={14} />}
                onClick={() => handleApprove(selectedOrg)}
                loading={processingAction}
              >
                Approve & Grant Rights
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Organization Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Verification: ${selectedOrg?.name}`}
        subtitle="A clear explanation is required. The organization will receive a notification with this reason."
        maxWidth="550px"
      >
        <form onSubmit={handleConfirmReject}>
          <Textarea
            label="Rejection Reason & Required Remediation"
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Registration certificate is missing or illegible. Please re-upload a clear copy."
            helper="Recorded in audit_logs and emailed to the organization owner."
          />
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" icon={<X size={14} />} loading={processingAction}>
              Confirm Rejection & Send Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Campaign Moderation Modal */}
      <Modal
        isOpen={isCampaignModerateModalOpen}
        onClose={() => setIsCampaignModerateModalOpen(false)}
        title={`${campaignModerationDecision === 'APPROVE' ? 'Approve' : 'Decline'} Campaign: ${selectedCampaign?.title}`}
        subtitle={`Status will be updated to ${campaignModerationDecision === 'APPROVE' ? 'ACTIVE' : 'REJECTED'} (Rule 3).`}
        maxWidth="550px"
      >
        <form onSubmit={handleConfirmCampaignModerate}>
          <Textarea
            label="Moderation Reason / Auditor Note"
            required={campaignModerationDecision === 'REJECT'}
            rows={4}
            value={campaignModerationReason}
            onChange={(e) => setCampaignModerationReason(e.target.value)}
            placeholder={
              campaignModerationDecision === 'APPROVE'
                ? 'e.g. Grama Niladhari letter and community evidence verified.'
                : 'e.g. Evidence document is unclear or lacks official seal.'
            }
            helper="Recorded in audit_logs for transparent governance."
          />
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="outline" onClick={() => setIsCampaignModerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={campaignModerationDecision === 'APPROVE' ? 'primary' : 'danger'}
              icon={campaignModerationDecision === 'APPROVE' ? <Check size={14} /> : <X size={14} />}
              loading={processingAction}
            >
              Confirm {campaignModerationDecision === 'APPROVE' ? 'Approval' : 'Decline'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Campaign Details Modal */}
      <Modal
        isOpen={isCampaignDetailsModalOpen}
        onClose={() => setIsCampaignDetailsModalOpen(false)}
        title={selectedCampaign?.title || 'Campaign Review'}
        subtitle={`Organized by ${selectedCampaign?.charityName || 'Charity'} • ${selectedCampaign?.district} District (Rule 3)`}
        maxWidth="650px"
      >
        {selectedCampaign && (
          <div>
            <div
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-sky">{selectedCampaign.needType}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Target: {selectedCampaign.targetQuantity} {selectedCampaign.targetUnit || 'units'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                {selectedCampaign.description || 'No description provided.'}
              </p>
            </div>

            {selectedCampaign.evidenceUrl && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af' }}>
                  <FileText size={24} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Supporting Community Evidence</div>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Official Grama Niladhari or School letter</div>
                  </div>
                </div>
                <a
                  href={selectedCampaign.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> View Evidence
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" onClick={() => setIsCampaignDetailsModalOpen(false)}>
                Close
              </Button>
              {selectedCampaign.status === 'PENDING_APPROVAL' && (
                <>
                  <Button
                    variant="danger"
                    icon={<X size={14} />}
                    onClick={() => handleOpenCampaignModerate(selectedCampaign, 'REJECT')}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Check size={14} />}
                    onClick={() => handleOpenCampaignModerate(selectedCampaign, 'APPROVE')}
                  >
                    Approve & Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Admin CSR Partnership Audit Modal */}
      <Modal
        isOpen={isAdminPartnershipModalOpen}
        onClose={() => setIsAdminPartnershipModalOpen(false)}
        title={selectedAdminPartnership ? `Audit Partnership: ${selectedAdminPartnership.campaignTitle}` : 'Partnership Audit'}
        subtitle={
          selectedAdminPartnership
            ? `Sponsor: ${selectedAdminPartnership.businessName} • Charity: ${selectedAdminPartnership.charityName}`
            : ''
        }
        maxWidth="850px"
      >
        {selectedAdminPartnership && (
          <div>
            <PartnershipTimeline
              currentStatus={selectedAdminPartnership.status}
              agreedTermsSnapshot={selectedAdminPartnership.agreedTermsSnapshot}
              recognitionActive={selectedAdminPartnership.recognitionActive}
              agreedRecognition={selectedAdminPartnership.agreedRecognition || selectedAdminPartnership.requestedRecognition}
            />

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem', color: '#0f172a' }}>
                Complete Negotiation Message Log ({selectedAdminPartnership.messages?.length || 0} messages)
              </div>
              <PartnershipMessageThread
                messages={selectedAdminPartnership.messages || []}
                currentUserRole="ADMIN"
                disabled={true}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsAdminPartnershipModalOpen(false)}>
                Close Audit View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
