import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
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
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import PartnershipTimeline from '../../components/common/PartnershipTimeline'
import PartnershipMessageThread from '../../components/common/PartnershipMessageThread'
import { adminApi, campaignApi, partnershipApi, impactApi, promotionApi } from '../../api/client'
import ImpactAnalyticsView from '../../components/impact/ImpactAnalyticsView'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [activeAdminTab, setActiveAdminTab] = useState('verifications')
  const [pendingVerifications, setPendingVerifications] = useState([])

  // Modal States for Organizations
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  // Pending Campaigns for Rule 3
  const [pendingCampaigns, setPendingCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCampaignDetailsModalOpen, setIsCampaignDetailsModalOpen] = useState(false)
  const [isCampaignModerateModalOpen, setIsCampaignModerateModalOpen] = useState(false)
  const [campaignModerationDecision, setCampaignModerationDecision] = useState('APPROVE')
  const [campaignModerationReason, setCampaignModerationReason] = useState('')

  // CSR Partnerships Monitoring State
  const [adminPartnerships, setAdminPartnerships] = useState([])
  const [loadingPartnerships, setLoadingPartnerships] = useState(false)
  const [selectedAdminPartnership, setSelectedAdminPartnership] = useState(null)
  const [isAdminPartnershipModalOpen, setIsAdminPartnershipModalOpen] = useState(false)
  const [adminPartnershipFilter, setAdminPartnershipFilter] = useState('ALL')

  // Platform Impact State
  const [platformImpact, setPlatformImpact] = useState(null)
  const [loadingPlatformImpact, setLoadingPlatformImpact] = useState(false)
  const [impactStart, setImpactStart] = useState(null)
  const [impactEnd, setImpactEnd] = useState(null)

  // Promotions & Featured Partners State
  const [adminPromotions, setAdminPromotions] = useState([])
  const [adminBusinesses, setAdminBusinesses] = useState([])
  const [loadingAdminPromos, setLoadingAdminPromos] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([loadPendingVerifications(), loadPendingCampaigns(), loadPartnerships()])
    setLoading(false)
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

  const loadPromotionsAndBusinesses = async () => {
    try {
      setLoadingAdminPromos(true)
      const [promosRes, businessesRes] = await Promise.all([
        promotionApi.getAllPromotions(),
        promotionApi.getAllBusinesses(),
      ])
      setAdminPromotions(promosRes.data || [])
      setAdminBusinesses(businessesRes.data || [])
    } catch (err) {
      console.error('Error fetching admin promotions or businesses', err)
      showToast('Could not load promotions or business directory', 'error')
    } finally {
      setLoadingAdminPromos(false)
    }
  }

  const handleToggleBusinessFeatured = async (businessId, currentFeatured) => {
    try {
      await promotionApi.toggleBusinessFeatured(businessId, !currentFeatured)
      showToast(currentFeatured ? 'Business profile unfeatured' : 'Business profile is now featured!', 'success')
      loadPromotionsAndBusinesses()
    } catch (err) {
      showToast('Failed to toggle featured status', 'error')
    }
  }

  const handleTogglePromotionFeatured = async (promoId, currentFeatured) => {
    try {
      await promotionApi.togglePromotionFeatured(promoId, !currentFeatured)
      showToast(currentFeatured ? 'Promotion unfeatured' : 'Promotion is now featured!', 'success')
      loadPromotionsAndBusinesses()
    } catch (err) {
      showToast('Failed to toggle promotion featured status', 'error')
    }
  }

  const loadPartnerships = async () => {
    try {
      setLoadingPartnerships(true)
      const res = await partnershipApi.getAdminPartnerships()
      setAdminPartnerships(res.data || [])
    } catch (err) {
      console.error('Failed to load admin partnerships', err)
      showToast('Failed to load CSR partnerships', 'error')
    } finally {
      setLoadingPartnerships(false)
    }
  }

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

  const loadPendingCampaigns = async () => {
    try {
      const res = await campaignApi.getPendingCampaigns()
      setPendingCampaigns(res.data || [])
    } catch (err) {
      console.error('Failed to load pending campaigns', err)
      showToast('Failed to load pending campaigns queue', 'error')
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
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject verification', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

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
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to moderate campaign', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const stats = [
    {
      label: 'Pending Verifications (Rule 2)',
      value: `${pendingVerifications.length} Organizations`,
      icon: <ShieldCheck size={20} style={{ color: '#f59e0b' }} />,
    },
    {
      label: 'Pending Campaigns (Rule 3)',
      value: `${pendingCampaigns.length} Campaigns`,
      icon: <ClipboardList size={20} style={{ color: '#0284c7' }} />,
    },
    {
      label: 'Platform Users',
      value: '1,420 Registered',
      icon: <Users size={20} style={{ color: '#059669' }} />,
    },
    {
      label: 'Platform Revenue (Rule 8)',
      value: 'Rs. 485,000 (Subs)',
      icon: <DollarSign size={20} style={{ color: '#10b981' }} />,
    },
  ]

  const verificationColumns = [
    {
      key: 'name',
      label: 'Organization Name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.name}</div>
          <div className="text-xs text-muted">Reg: {row.registrationNumber}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Role / Type',
      render: (val, row) => (
        <span
          className={`badge ${
            row.organizationType === 'CHARITY'
              ? 'badge-emerald'
              : val === 'GROCERY'
              ? 'badge-sky'
              : 'badge-amber'
          }`}
        >
          {val}
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
      label: 'Document',
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
            <FileText size={14} /> Review Doc
          </a>
        ) : (
          <span className="text-xs text-muted">No Doc</span>
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

  const campaignColumns = [
    {
      key: 'title',
      label: 'Campaign Title',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.title}</div>
          <div className="text-xs text-muted" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
            <span className="badge badge-sky" style={{ fontSize: '0.65rem' }}>{row.needType}</span>
            <span>• {row.district} District</span>
          </div>
        </div>
      ),
    },
    {
      key: 'charityName',
      label: 'Organizing Charity',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val || row.organizer || 'Charity'}</div>
          <div className="text-xs text-muted">Verified NGO</div>
        </div>
      ),
    },
    {
      key: 'target',
      label: 'Target Goal',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {row.targetQuantity} {row.targetUnit || 'units'}
          </div>
          <div className="text-xs text-muted">
            {row.currentQuantity || 0} collected
          </div>
        </div>
      ),
    },
    {
      key: 'evidenceUrl',
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
            <FileText size={14} /> Review Proof
          </a>
        ) : (
          <span className="text-xs text-muted">None attached</span>
        ),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (val) => (
        <span className="text-xs text-muted">
          {val ? new Date(val).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Moderation Decision',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<Eye size={13} />}
            onClick={() => handleOpenCampaignDetails(row)}
          >
            Review
          </Button>
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
            Decline
          </Button>
        </div>
      ),
    },
  ]

  const adminPartnershipColumns = [
    {
      key: 'businessName',
      label: 'Business Sponsor',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building2 size={14} style={{ color: '#0284c7' }} />
            <span>{val}</span>
          </div>
          <div className="text-xs text-muted" style={{ marginTop: '2px' }}>
            CSR Partnership ID: <code>{row.id.substring(0, 8)}</code>
          </div>
        </div>
      ),
    },
    {
      key: 'charityName',
      label: 'Charity & Campaign',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div className="text-xs text-muted">
            Campaign: <strong>{row.campaignTitle}</strong> ({row.campaignDistrict} Dist.)
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
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
            {type === 'MONETARY_PLEDGE' && row.monetaryAmount
              ? `Rs. ${Number(row.monetaryAmount).toLocaleString()}`
              : `${row.quantity} ${row.unit || 'units'}`}
          </div>
          {row.itemDescription && (
            <div className="text-xs text-muted" style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Award size={12} /> Active ({row.agreedRecognition || row.requestedRecognition || 'Official Partner'})
            </span>
          )
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.75rem' }}>
            <Lock size={12} />
            <span>Locked (Receipt pending)</span>
          </div>
        )
      },
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
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p className="text-sm text-muted">
            Enforce Rule 1 RBAC, Rule 2 Organization Verification, Rule 3 Campaign Approvals, and CSR Partnership Governance.
          </p>
        </div>

        <Button
          variant="outline"
          icon={<RefreshCw size={15} />}
          onClick={loadAllData}
          loading={loading}
        >
          Refresh All
        </Button>
      </div>

      {/* Metrics */}
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
          gap: '1rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveAdminTab('verifications')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeAdminTab === 'verifications' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeAdminTab === 'verifications' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldCheck size={18} />
          Partner Verifications ({pendingVerifications.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('campaigns')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeAdminTab === 'campaigns' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeAdminTab === 'campaigns' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ClipboardList size={18} />
          Campaign Approvals ({pendingCampaigns.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('partnerships')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeAdminTab === 'partnerships' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeAdminTab === 'partnerships' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Handshake size={18} />
          CSR Partnership Monitoring ({adminPartnerships.length})
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('impact')
            loadPlatformImpact()
          }}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeAdminTab === 'impact' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeAdminTab === 'impact' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <TrendingUp size={18} />
          National Impact Ledger
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('promotions')
            loadPromotionsAndBusinesses()
          }}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeAdminTab === 'promotions' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeAdminTab === 'promotions' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={18} />
          Promotions & Featured Partners
        </button>
      </div>

      {/* Tab: Organization Verification Queue (Rule 2) */}
      {activeAdminTab === 'verifications' && (
        <Card
          title="Pending Partner Verifications (Rule 2)"
          subtitle="Businesses and charities are strictly blocked from publishing until admin-approved. Every decision generates an audit_logs entry."
          badge={
            <span className={`badge ${pendingVerifications.length > 0 ? 'badge-amber' : 'badge-emerald'}`}>
              {pendingVerifications.length} Pending Review
            </span>
          }
        >
          {loading ? (
            <Loader text="Loading pending verifications..." />
          ) : (
            <Table
              columns={verificationColumns}
              data={pendingVerifications}
              emptyMessage="All partner organizations have been reviewed. No pending verifications!"
            />
          )}
        </Card>
      )}

      {/* Tab: Campaign Approvals Queue (Rule 3) */}
      {activeAdminTab === 'campaigns' && (
        <Card
          title="Campaign Approval Queue (Rule 3)"
          subtitle="Charity and animal welfare relief campaigns must receive Admin approval before going public"
          badge={<span className="badge badge-sky">{pendingCampaigns.length} Review</span>}
        >
          <Table
            columns={campaignColumns}
            data={pendingCampaigns}
            emptyMessage="No campaigns pending review."
          />
        </Card>
      )}

      {/* Tab: CSR Partnership Monitoring (Main Innovation) */}
      {activeAdminTab === 'partnerships' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Innovation Educational & Oversight Banner */}
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
                  CSR Business-to-Charity Partnership Governance
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  Platform Innovation Oversight
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#5b21b6', margin: '0.4rem 0 0.5rem 0', lineHeight: 1.5 }}>
                Monitor corporate sponsorship contracts across FoodBridge. Ensure agreed terms remain immutable once agreed, verify that promotional recognition is locked until confirmed delivery, and audit negotiation threads for ethical compliance.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={loadPartnerships}
              loading={loadingPartnerships}
            >
              Refresh
            </Button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-muted">Total Partnerships</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{adminPartnerships.length}</div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Active Negotiations</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>
                {adminPartnerships.filter((p) => p.status === 'PROPOSED' || p.status === 'COUNTERED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Terms Locked & Agreed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>
                {adminPartnerships.filter((p) => p.status === 'AGREED' || p.status === 'DELIVERED').length}
              </div>
            </Card>
            <Card>
              <div className="text-xs text-muted">Completed & Recognized</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                {adminPartnerships.filter((p) => p.status === 'COMPLETED').length}
              </div>
            </Card>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'PROPOSED', 'COUNTERED', 'AGREED', 'DELIVERED', 'COMPLETED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setAdminPartnershipFilter(filter)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: adminPartnershipFilter === filter ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: adminPartnershipFilter === filter ? 'var(--color-primary)' : '#fff',
                  color: adminPartnershipFilter === filter ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {filter === 'ALL' ? 'All Statuses' : filter}
              </button>
            ))}
          </div>

          {/* Table */}
          <Card
            title="All Corporate Sponsorship Partnerships"
            subtitle="Live status, locked terms, and recognition activation states across all campaigns."
          >
            {loadingPartnerships ? (
              <Loader message="Loading CSR partnerships..." />
            ) : adminPartnerships.filter((p) => {
                if (adminPartnershipFilter === 'ALL') return true
                return p.status === adminPartnershipFilter
              }).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Handshake size={44} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  No partnerships found in this status
                </div>
              </div>
            ) : (
              <Table
                columns={adminPartnershipColumns}
                data={adminPartnerships.filter((p) => {
                  if (adminPartnershipFilter === 'ALL') return true
                  return p.status === adminPartnershipFilter
                })}
                emptyMessage="No partnerships recorded."
              />
            )}
          </Card>
        </div>
      )}

      {/* Tab: Platform Impact & Compliance Overview */}
      {activeAdminTab === 'impact' && (
        <ImpactAnalyticsView
          data={platformImpact}
          loading={loadingPlatformImpact}
          isOrganization={false}
          title="National Zero-Waste & Relief Impact Audit"
          subtitle="Real-time verified platform ledger. Enforces Rule 4 zero-estimate accounting across businesses, charities, grocery discounts, and rural campaigns."
          onDateRangeChange={(start, end) => {
            setImpactStart(start)
            setImpactEnd(end)
            loadPlatformImpact(start, end)
          }}
          onExportCsv={() => {
            window.location.href = impactApi.getExportCsvUrl(null, impactStart, impactEnd)
          }}
        />
      )}

      {/* Tab: Promotions & Featured Partners Governance */}
      {activeAdminTab === 'promotions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Card 1: Business Profile Featured Placement Management */}
          <Card
            title="Business Directory & Featured Profile Placements"
            subtitle="Feature verified restaurant and grocery profiles on the public directory, search highlights, and interactive map."
            badge={<span className="badge badge-amber">{adminBusinesses.filter((b) => b.isFeatured).length} Featured</span>}
          >
            {loadingAdminPromos ? (
              <Loader text="Loading partner businesses..." />
            ) : adminBusinesses.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No registered businesses found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Business Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Verification</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Featured Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminBusinesses.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{b.businessName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Reg: {b.registrationNumber}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {b.businessType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                          {b.city}, {b.district}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: b.verificationStatus === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                              color: b.verificationStatus === 'VERIFIED' ? '#15803d' : '#b45309',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '999px',
                            }}
                          >
                            {b.verificationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {b.isFeatured ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                padding: '0.25rem 0.6rem',
                                borderRadius: '999px',
                                border: '1px solid #fde68a',
                              }}
                            >
                              <Star size={13} fill="#f59e0b" color="#f59e0b" /> FEATURED
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Standard</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Button
                            size="sm"
                            variant={b.isFeatured ? 'outline' : 'primary'}
                            onClick={() => handleToggleBusinessFeatured(b.id, b.isFeatured)}
                          >
                            {b.isFeatured ? 'Unfeature Profile' : 'Feature Profile'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Card 2: Promotional Campaigns & Ads Management */}
          <Card
            title="Promotional Campaigns & Ads Moderation (Rule 8 Revenue)"
            subtitle="Monitor business promotions, analyze views, clicks, and redemptions, and feature high-impact sustainable offers."
            badge={<span className="badge badge-sky">{adminPromotions.length} Campaigns</span>}
          >
            {loadingAdminPromos ? (
              <Loader text="Loading promotions..." />
            ) : adminPromotions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No active promotions published yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Business</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Promotion</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Analytics (Views/Clicks/Redeems)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Featured</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPromotions.map((promo) => (
                      <tr key={promo.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{promo.businessName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{promo.businessDistrict}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{promo.title}</div>
                          {promo.promoCode && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#f1f5f9', color: 'var(--color-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              CODE: {promo.promoCode}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#eff6ff', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {promo.promotionType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontSize: '0.82rem', display: 'flex', gap: '0.6rem' }}>
                            <span>👁️ {promo.viewsCount || 0}</span>
                            <span>🖱️ {promo.clicksCount || 0}</span>
                            <span>🎁 {promo.redemptionsCount || 0}</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>({promo.ctr || 0}% CTR)</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {promo.isFeatured ? (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                              FEATURED AD
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Standard</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Button
                            size="sm"
                            variant={promo.isFeatured ? 'outline' : 'primary'}
                            onClick={() => handleTogglePromotionFeatured(promo.id, promo.isFeatured)}
                          >
                            {promo.isFeatured ? 'Unfeature Ad' : 'Feature Ad'}
                          </Button>
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

      {/* Organization Review & Document Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedOrg?.name || 'Organization Review'}
        subtitle={`Type: ${selectedOrg?.organizationType} (${selectedOrg?.category}) • Reg No: ${selectedOrg?.registrationNumber}`}
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

              {selectedOrg.operatingArea && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Operating Area:</strong> {selectedOrg.operatingArea}
                </div>
              )}

              {selectedOrg.capacityPeople && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Feeding Capacity:</strong> {selectedOrg.capacityPeople} beneficiaries
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Physical Location
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <div>{selectedOrg.addressLine1}</div>
                  {selectedOrg.addressLine2 && <div>{selectedOrg.addressLine2}</div>}
                  <div>{selectedOrg.city}, {selectedOrg.district} District</div>
                  <div className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
                    Coords: {selectedOrg.latitude}, {selectedOrg.longitude}
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
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

            {/* Supporting Document Section */}
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
                    Verify BR/NGO certification before granting publishing authorization
                  </div>
                </div>
              </div>
              {selectedOrg.documentUrl ? (
                <a
                  href={selectedOrg.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> Open Document
                </a>
              ) : (
                <span className="badge badge-amber">No Document Attached</span>
              )}
            </div>

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

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Verification: ${selectedOrg?.name}`}
        subtitle="A clear explanation is required. The organization will receive an email stub notification with this reason."
        maxWidth="550px"
      >
        <form onSubmit={handleConfirmReject}>
          <Textarea
            label="Rejection Reason & Required Remediation"
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. The uploaded Business Registration certificate is illegible. Please re-upload a clear copy of form 1/20."
            helper="This reason will be recorded in audit_logs and emailed to the organization owner."
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              icon={<X size={14} />}
              loading={processingAction}
            >
              Confirm Rejection & Send Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Campaign Details & Evidence Modal */}
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
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Campaign Summary & Objective
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                {selectedCampaign.description || 'No description provided.'}
              </p>
            </div>

            {/* Evidence Document Section */}
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
                    Supporting Community Evidence
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                    Official Grama Niladhari or School confirmation document
                  </div>
                </div>
              </div>
              {selectedCampaign.evidenceUrl ? (
                <a
                  href={selectedCampaign.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> View Evidence
                </a>
              ) : (
                <span className="badge badge-amber">No Document</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" onClick={() => setIsCampaignDetailsModalOpen(false)}>
                Close
              </Button>
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
            </div>
          </div>
        )}
      </Modal>

      {/* Campaign Moderation Reason Modal */}
      <Modal
        isOpen={isCampaignModerateModalOpen}
        onClose={() => setIsCampaignModerateModalOpen(false)}
        title={`${campaignModerationDecision === 'APPROVE' ? 'Approve' : 'Decline'} Campaign: ${selectedCampaign?.title}`}
        subtitle={`This action will update the campaign status to ${campaignModerationDecision === 'APPROVE' ? 'ACTIVE' : 'REJECTED'} and record an entry in audit_logs (Rule 3).`}
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
                ? 'e.g. Grama Niladhari letter and school supply requirements verified.'
                : 'e.g. Evidence document is unclear or lacks official seal. Please re-submit with letterhead.'
            }
            helper="Recorded in audit_logs for transparent platform governance."
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCampaignModerateModalOpen(false)}
            >
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
      {/* Modal: Admin CSR Partnership Audit & Inspection */}
      <Modal
        isOpen={isAdminPartnershipModalOpen}
        onClose={() => setIsAdminPartnershipModalOpen(false)}
        title={selectedAdminPartnership ? `Audit Partnership: ${selectedAdminPartnership.campaignTitle}` : 'Partnership Audit'}
        subtitle={
          selectedAdminPartnership
            ? `Sponsor: ${selectedAdminPartnership.businessName} • Charity: ${selectedAdminPartnership.charityName} • District: ${selectedAdminPartnership.campaignDistrict || 'Rural'}`
            : ''
        }
        maxWidth="850px"
      >
        {selectedAdminPartnership && (
          <div>
            {/* Visual Status Timeline */}
            <PartnershipTimeline
              currentStatus={selectedAdminPartnership.status}
              agreedTermsSnapshot={selectedAdminPartnership.agreedTermsSnapshot}
              recognitionActive={selectedAdminPartnership.recognitionActive}
              agreedRecognition={
                selectedAdminPartnership.agreedRecognition || selectedAdminPartnership.requestedRecognition
              }
            />

            {/* Audit Milestone Timestamps */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#0f172a' }}>
                Contract Audit Trail & Milestone History
              </div>
              <div className="grid grid-cols-3 gap-4" style={{ fontSize: '0.8rem' }}>
                <div>
                  <span className="text-muted">Proposed At:</span>
                  <div>{selectedAdminPartnership.createdAt ? new Date(selectedAdminPartnership.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted">Terms Locked (Agreed At):</span>
                  <div>{selectedAdminPartnership.agreedAt ? new Date(selectedAdminPartnership.agreedAt).toLocaleString() : 'Not agreed yet'}</div>
                </div>
                <div>
                  <span className="text-muted">Support Delivered:</span>
                  <div>{selectedAdminPartnership.deliveredAt ? new Date(selectedAdminPartnership.deliveredAt).toLocaleString() : 'Pending delivery'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ fontSize: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                <div>
                  <span className="text-muted">Receipt Verified & Completed:</span>
                  <div>{selectedAdminPartnership.completedAt ? new Date(selectedAdminPartnership.completedAt).toLocaleString() : 'Pending confirmation'}</div>
                </div>
                <div>
                  <span className="text-muted">Promotional Recognition Status:</span>
                  <div style={{ fontWeight: 700, color: selectedAdminPartnership.recognitionActive ? '#059669' : '#d97706' }}>
                    {selectedAdminPartnership.recognitionActive ? 'ACTIVE (Verified Badges Live)' : 'LOCKED (Gated until receipt)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Locked Immutable Agreement Snapshot */}
            {selectedAdminPartnership.agreedTermsSnapshot && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
                  <Lock size={15} />
                  <span>Locked Immutable Agreement Snapshot</span>
                </div>
                <pre
                  style={{
                    backgroundColor: '#fff',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    border: '1px solid #86efac',
                    color: '#14532d',
                  }}
                >
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedAdminPartnership.agreedTermsSnapshot), null, 2)
                    } catch {
                      return selectedAdminPartnership.agreedTermsSnapshot
                    }
                  })()}
                </pre>
              </div>
            )}

            {/* Negotiation Message Thread for Audit */}
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
