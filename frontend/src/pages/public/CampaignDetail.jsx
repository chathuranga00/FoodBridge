import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  MapPin,
  ShieldCheck,
  Droplet,
  BookOpen,
  GraduationCap,
  Package,
  Utensils,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Share2,
  FileText,
  ExternalLink,
  Users,
  Camera,
  Gift,
  Building2,
  Phone,
  Mail,
  Info,
  CreditCard,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { campaignApi, contributionApi } from '../../api/client'
import { CAMPAIGN_NEED_TYPES } from '../../utils/constants'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [campaign, setCampaign] = useState(null)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  // Pledge Modal State
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false)
  const [submittingPledge, setSubmittingPledge] = useState(false)
  const [pledgeSuccessData, setPledgeSuccessData] = useState(null)
  const [isPledgeSuccessModalOpen, setIsPledgeSuccessModalOpen] = useState(false)
  const [pledgeForm, setPledgeForm] = useState({
    contributionType: 'MONETARY_PLEDGE', // 'MONETARY_PLEDGE', 'FOOD_ITEMS', 'OTHER_RESOURCES'
    monetaryAmount: '',
    quantity: '',
    unit: '',
    itemDescription: '',
    notes: '',
    contributorPhone: '',
  })

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      const [campRes, updatesRes] = await Promise.all([
        campaignApi.getCampaignById(id),
        campaignApi.getCampaignUpdates(id),
      ])
      setCampaign(campRes.data)
      setUpdates(updatesRes.data || [])
    } catch (err) {
      console.error('Failed to load campaign details:', err)
      showToast(err.response?.data?.message || 'Failed to load campaign details', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadCampaignData()
    }
  }, [id])

  const handleOpenPledge = () => {
    if (!isAuthenticated) {
      showToast('Please log in to pledge a contribution to this verified campaign.', 'warning')
      navigate('/login')
      return
    }
    setPledgeForm({
      contributionType: 'MONETARY_PLEDGE',
      monetaryAmount: '',
      quantity: '',
      unit: campaign?.targetUnit || 'Units',
      itemDescription: '',
      notes: '',
      contributorPhone: user?.phoneNumber || '',
    })
    setIsPledgeModalOpen(true)
  }

  const handlePledgeSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      contributionType: pledgeForm.contributionType,
      notes: pledgeForm.notes.trim(),
      contributorPhone: pledgeForm.contributorPhone.trim(),
    }

    if (pledgeForm.contributionType === 'MONETARY_PLEDGE') {
      const amount = parseFloat(pledgeForm.monetaryAmount)
      if (!amount || amount <= 0) {
        showToast('Please enter a valid monetary pledge amount in LKR.', 'error')
        return
      }
      payload.monetaryAmount = amount
      payload.quantity = parseInt(amount, 10)
      payload.unit = 'LKR'
    } else if (pledgeForm.contributionType === 'FOOD_ITEMS') {
      const qty = parseInt(pledgeForm.quantity, 10)
      if (!qty || qty <= 0) {
        showToast('Please enter a valid quantity of food items.', 'error')
        return
      }
      payload.quantity = qty
      payload.unit = pledgeForm.unit?.trim() || campaign?.targetUnit || 'Packs'
      payload.itemDescription = pledgeForm.itemDescription?.trim() || 'Food Supplies'
    } else {
      const qty = parseInt(pledgeForm.quantity, 10)
      if (!qty || qty <= 0) {
        showToast('Please enter a valid quantity of resources.', 'error')
        return
      }
      payload.quantity = qty
      payload.unit = pledgeForm.unit?.trim() || campaign?.targetUnit || 'Units'
      payload.itemDescription = pledgeForm.itemDescription?.trim() || 'Community Aid Supplies'
    }

    try {
      setSubmittingPledge(true)
      const res = await contributionApi.pledgeContribution(campaign.id, payload)
      setPledgeSuccessData(res.data)
      setIsPledgeModalOpen(false)
      setIsPledgeSuccessModalOpen(true)
      showToast('Pledge recorded! Status is PLEDGED awaiting charity receipt verification.', 'success')
      loadCampaignData()
    } catch (err) {
      console.error('Pledge error:', err)
      showToast(err.response?.data?.message || 'Failed to submit pledge', 'error')
    } finally {
      setSubmittingPledge(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    showToast('Campaign link copied to clipboard!', 'success')
  }

  const getNeedTypeIcon = (type) => {
    switch (type) {
      case 'CLEAN_WATER':
        return <Droplet size={18} style={{ color: '#0284c7' }} />
      case 'BOOKS_STATIONERY':
        return <BookOpen size={18} style={{ color: '#d97706' }} />
      case 'SCHOOL_SUPPLIES':
        return <GraduationCap size={18} style={{ color: '#7c3aed' }} />
      case 'FAMILY_ESSENTIALS':
        return <Package size={18} style={{ color: '#059669' }} />
      case 'FOOD':
      default:
        return <Utensils size={18} style={{ color: '#e11d48' }} />
    }
  }

  const getNeedTypeLabel = (type) => {
    const found = CAMPAIGN_NEED_TYPES.find((item) => item.value === type)
    return found ? found.label : type || 'Community Relief'
  }

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
        <Loader message="Loading verified community campaign..." />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ padding: '6rem 0', minHeight: '80vh', textAlign: 'center', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <Heart size={54} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Campaign Not Found</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            The requested community campaign does not exist or may not yet be approved by platform administrators.
          </p>
          <Button variant="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/campaigns')}>
            Back to All Campaigns
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/campaigns"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Community Campaigns
          </Link>
        </div>

        {/* Campaign Header / Hero */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          {/* Cover Image banner */}
          <div
            style={{
              height: '320px',
              backgroundColor: '#e2e8f0',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {campaign.coverImageUrl ? (
              <img
                src={campaign.coverImageUrl}
                alt={campaign.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                <Heart size={64} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>FoodBridge Rural Community Aid</span>
              </div>
            )}

            {/* Need Type Tag */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(6px)',
              }}
            >
              {getNeedTypeIcon(campaign.needType)}
              <span>{getNeedTypeLabel(campaign.needType)}</span>
            </div>

            {/* District Tag */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            >
              <MapPin size={16} style={{ color: '#dc2626' }} />
              <span>{campaign.district} District, Sri Lanka</span>
            </div>
          </div>

          {/* Title & Organization Banner */}
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#059669' }} />
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{campaign.charityName}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    Verified Sri Lankan NGO
                  </span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
                  {campaign.title}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="outline" size="sm" icon={<Share2 size={15} />} onClick={handleShare}>
                  Share Campaign
                </Button>
              </div>
            </div>

            {/* Strict Privacy & Safeguard Callout */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <ShieldCheck size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div style={{ fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5 }}>
                <strong>Beneficiary Dignity Guarantee:</strong> Recipient locations are strictly restricted to <strong>{campaign.district} District</strong> to prevent vulnerability exposure and protect children/families. Transparent delivery proof is provided below via verified photographic field updates.
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Details & Field Updates */}
          <div>
            {/* Description Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                About this Campaign & Relief Needs
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: '#334155',
                  whiteSpace: 'pre-line',
                  marginBottom: '1.5rem',
                }}
              >
                {campaign.description}
              </p>

              {/* Supporting Document Proof */}
              {campaign.evidenceUrl && (
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={22} style={{ color: '#2563eb' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af' }}>
                        Admin-Verified Supporting Evidence
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                        Official letter / Grama Niladhari or School confirmation on file
                      </div>
                    </div>
                  </div>
                  <a
                    href={campaign.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={14} /> View Evidence Document
                  </a>
                </div>
              )}
            </div>

            {/* Direct Handover & Payment Coordination Card */}
            {(campaign.paymentInstructions || campaign.handoverInstructions) && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '1.75rem',
                  marginBottom: '2rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={22} style={{ color: '#059669' }} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Direct Handover & Payment Coordination
                  </h2>
                </div>

                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    fontSize: '0.825rem',
                    color: '#166534',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                  }}
                >
                  <strong>100% Direct Model (0% Platform Fee):</strong> FoodBridge does not process financial transactions. Please follow the verified charity instructions below to transfer funds or drop off relief items directly.
                </div>

                {campaign.paymentInstructions && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a', marginBottom: '0.35rem' }}>
                      Bank Account Details for Direct Monetary Aid:
                    </div>
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-line',
                        color: '#1e293b',
                      }}
                    >
                      {campaign.paymentInstructions}
                    </div>
                  </div>
                )}

                {campaign.handoverInstructions && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', marginBottom: '0.35rem' }}>
                      Physical Supplies Drop-Off / Logistics Coordination:
                    </div>
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-line',
                        color: '#1e293b',
                      }}
                    >
                      {campaign.handoverInstructions}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field Updates & Distribution Proof Feed */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Camera size={22} style={{ color: 'var(--color-primary)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Field Updates & Distribution Proof ({updates.length})
                  </h2>
                </div>
                <span className="badge badge-emerald">Verified Photo Receipts</span>
              </div>

              {updates.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <Camera size={40} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    No Distribution Updates Yet
                  </h3>
                  <p className="text-xs text-muted" style={{ maxWidth: '420px', margin: '0 auto' }}>
                    Once our volunteer distribution team delivers relief supplies on the ground, photos and handover confirmations will be published here in real time.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      {/* Photo if present */}
                      {update.photoUrl && (
                        <div
                          style={{
                            height: '240px',
                            backgroundColor: '#f1f5f9',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={update.photoUrl}
                            alt={update.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}

                      <div style={{ padding: '1.25rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {update.title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                            <Calendar size={13} />
                            <span>
                              {update.distributionDate
                                ? new Date(update.distributionDate).toLocaleDateString([], {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Recent Delivery'}
                            </span>
                          </div>
                        </div>

                        {update.quantityDistributed && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                              Distributed: {update.quantityDistributed} {campaign.targetUnit || 'units'}
                            </span>
                          </div>
                        )}

                        <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                          {update.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Progress Card & Action */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {campaign.status}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#047857' }}>
                  {campaign.progressPercentage}%
                </span>
              </div>

              {/* Large Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, campaign.progressPercentage || 0))}%`,
                    height: '100%',
                    backgroundColor: '#059669',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* Quantity Metric */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '1.5rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {campaign.currentQuantity || 0}
                  </div>
                  <div className="text-xs text-muted">Confirmed Aid Delivered</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#64748b' }}>
                    {campaign.targetQuantity}
                  </div>
                  <div className="text-xs text-muted">Target {campaign.targetUnit || 'Units'}</div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="lg"
                block
                icon={<Gift size={18} />}
                onClick={handleOpenPledge}
                style={{ marginBottom: '1rem' }}
              >
                Pledge Supplies / Support
              </Button>

              <p className="text-xs text-muted" style={{ textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                100% direct community aid. No transaction fees. Coordinated directly with {campaign.charityName}.
              </p>
            </div>

            {/* Organizer Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
                Organizing Charity
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{campaign.charityName}</div>
                  <div className="text-xs text-muted">Sri Lanka Registered Charity</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} style={{ color: '#dc2626' }} />
                  <span>Serving {campaign.district} District</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={14} style={{ color: '#059669' }} />
                  <span>Admin Vetted & Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Pledge Support to Campaign */}
        <Modal
          isOpen={isPledgeModalOpen}
          onClose={() => setIsPledgeModalOpen(false)}
          title={`Pledge Support: ${campaign.title}`}
          subtitle={`Organized by ${campaign.charityName} • District: ${campaign.district}`}
          maxWidth="620px"
        >
          <form onSubmit={handlePledgeSubmit}>
            {/* Zero-Fee Model Notice */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#166534',
                lineHeight: 1.5,
              }}
            >
              <strong>Direct Handover / Transfer (Rule 8):</strong> FoodBridge does not process payments or deduct transaction fees. Your pledge will be recorded in status <strong>PLEDGED</strong>. Once {campaign.charityName} verifies receipt of funds in their bank account or goods at their depot, they will confirm receipt to update the campaign progress bar.
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Contribution Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'MONETARY_PLEDGE', label: '💳 Direct Money Aid', sub: 'Direct bank transfer' },
                  { id: 'FOOD_ITEMS', label: '🍲 Food Supplies', sub: 'Dry rations or meals' },
                  { id: 'OTHER_RESOURCES', label: '📦 Resources', sub: 'Filters, books, kits' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPledgeForm({ ...pledgeForm, contributionType: t.id })}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid',
                      borderColor: pledgeForm.contributionType === t.id ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: pledgeForm.contributionType === t.id ? 'var(--color-primary-50)' : '#ffffff',
                      color: pledgeForm.contributionType === t.id ? 'var(--color-primary-800)' : 'var(--color-text)',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {t.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type Specific Fields */}
            {pledgeForm.contributionType === 'MONETARY_PLEDGE' && (
              <div>
                <Input
                  label="Pledge Amount (LKR)"
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={pledgeForm.monetaryAmount}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, monetaryAmount: e.target.value })}
                  placeholder="e.g. 5000"
                  helper="Enter the amount you wish to deposit directly to the charity's bank account."
                />

                {/* Quick amount chips */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  {[2500, 5000, 10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPledgeForm({ ...pledgeForm, monetaryAmount: amt.toString() })}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: pledgeForm.monetaryAmount === amt.toString() ? 'var(--color-primary)' : '#f8fafc',
                        color: pledgeForm.monetaryAmount === amt.toString() ? '#ffffff' : 'var(--color-text)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      LKR {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {campaign.paymentInstructions && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                      Charity Bank Instructions Preview:
                    </div>
                    <div style={{ fontFamily: 'monospace', color: '#334155', whiteSpace: 'pre-line' }}>
                      {campaign.paymentInstructions}
                    </div>
                  </div>
                )}
              </div>
            )}

            {pledgeForm.contributionType === 'FOOD_ITEMS' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity of Food Items"
                    type="number"
                    min="1"
                    required
                    value={pledgeForm.quantity}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, quantity: e.target.value })}
                    placeholder="e.g. 50"
                  />
                  <Input
                    label="Unit Label"
                    required
                    value={pledgeForm.unit}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, unit: e.target.value })}
                    placeholder="e.g. Meal Packs, Ration Bags, kg"
                  />
                </div>
                <Input
                  label="Description of Food Items"
                  required
                  value={pledgeForm.itemDescription}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, itemDescription: e.target.value })}
                  placeholder="e.g. Dry rations package: 5kg rice, dhal, sugar, canned fish"
                />

                {campaign.handoverInstructions && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                      Charity Handover Instructions:
                    </div>
                    <div style={{ color: '#334155', whiteSpace: 'pre-line' }}>
                      {campaign.handoverInstructions}
                    </div>
                  </div>
                )}
              </div>
            )}

            {pledgeForm.contributionType === 'OTHER_RESOURCES' && (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    required
                    value={pledgeForm.quantity}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, quantity: e.target.value })}
                    placeholder="e.g. 20"
                  />
                  <Input
                    label="Unit Label"
                    required
                    value={pledgeForm.unit}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, unit: e.target.value })}
                    placeholder="e.g. Water Filters, School Kits, Desk Sets"
                  />
                </div>
                <Input
                  label="Resource Description"
                  required
                  value={pledgeForm.itemDescription}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, itemDescription: e.target.value })}
                  placeholder="e.g. Grade 5 stationery sets with exercise books and instrument box"
                />

                {campaign.handoverInstructions && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                      Charity Handover Instructions:
                    </div>
                    <div style={{ color: '#334155', whiteSpace: 'pre-line' }}>
                      {campaign.handoverInstructions}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Input
              label="Contact Phone Number for Handover Coordination"
              value={pledgeForm.contributorPhone}
              onChange={(e) => setPledgeForm({ ...pledgeForm, contributorPhone: e.target.value })}
              placeholder="e.g. 077 123 4567"
              helper="The organizing charity will use this to coordinate handover or confirm bank transfer."
            />

            <Textarea
              label="Logistics & Delivery Notes"
              rows={2}
              value={pledgeForm.notes}
              onChange={(e) => setPledgeForm({ ...pledgeForm, notes: e.target.value })}
              placeholder="e.g. Bank transfer will be made tomorrow morning / Can deliver directly to Anuradhapura depot on Saturday."
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setIsPledgeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Gift size={16} />} loading={submittingPledge}>
                Confirm Pledge
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Pledge Success & Agreed Handover Instructions */}
        <Modal
          isOpen={isPledgeSuccessModalOpen}
          onClose={() => setIsPledgeSuccessModalOpen(false)}
          title="Pledge Recorded Successfully!"
          subtitle={`Your pledge to ${campaign.title} is now in PLEDGED status.`}
          maxWidth="600px"
        >
          {pledgeSuccessData && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle2 size={32} style={{ color: '#059669', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                    Thank you for your generous pledge!
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.15rem' }}>
                    Status: <span className="badge badge-amber">PLEDGED</span> &bull; Recorded on{' '}
                    {new Date(pledgeSuccessData.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Pledge Summary */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="text-xs text-muted" style={{ marginBottom: '0.25rem' }}>
                  Your Committed Contribution:
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {pledgeSuccessData.contributionType === 'MONETARY_PLEDGE'
                    ? `LKR ${Number(pledgeSuccessData.monetaryAmount).toLocaleString()} Direct Monetary Aid`
                    : `${pledgeSuccessData.quantity} ${pledgeSuccessData.unit} (${pledgeSuccessData.itemDescription})`}
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                  Receiving Organization: <strong>{campaign.charityName}</strong> ({campaign.district} District)
                </div>
              </div>

              {/* Handover / Payment Instructions from Charity */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {pledgeSuccessData.contributionType === 'MONETARY_PLEDGE'
                    ? '🏦 Charity Bank Transfer Instructions'
                    : '📦 Supplies Handover & Drop-off Instructions'}
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-line',
                    fontFamily: pledgeSuccessData.contributionType === 'MONETARY_PLEDGE' ? 'monospace' : 'inherit',
                    color: '#1e293b',
                    lineHeight: 1.5,
                  }}
                >
                  {pledgeSuccessData.contributionType === 'MONETARY_PLEDGE'
                    ? campaign.paymentInstructions ||
                      'Bank: Bank of Ceylon\nAccount Name: FoodBridge Relief Trust\nAccount: 00987654321\nBranch: Colombo Central\nReference: CAMPAIGN-' + campaign.id.substring(0, 6)
                    : campaign.handoverInstructions ||
                      'Drop-off Depot: ' + campaign.district + ' Community Aid Hub\nOperating Hours: Mon - Fri 9:00 AM - 5:00 PM\nContact Person: ' + campaign.charityName + ' Logistics Coordinator'}
                </div>

                <div
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Info size={14} />
                  <span>
                    FoodBridge does not deduct fees. Once the charity confirms receipt, the campaign progress bar will update automatically.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="outline" onClick={() => setIsPledgeSuccessModalOpen(false)}>
                  Done
                </Button>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => {
                    setIsPledgeSuccessModalOpen(false)
                    navigate('/dashboard')
                  }}
                >
                  View in My Contributions
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

