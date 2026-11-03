import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Star,
  Award,
  ShoppingBag,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  Share2,
  CheckCircle,
  Copy,
  Sparkles,
  HeartHandshake,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { businessApi, promotionApi } from '../../api/client'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { useToast } from '../../context/ToastContext'

export default function BusinessProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    loadProfile()
    window.scrollTo(0, 0)
  }, [id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await businessApi.getPublicBusinessProfile(id)
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to load business profile:', err)
      setError(err.response?.data?.message || 'Could not find business profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (promo) => {
    if (!promo?.promoCode) return
    navigator.clipboard.writeText(promo.promoCode)
    setCopiedCode(promo.id)
    showToast(`Promo code ${promo.promoCode} copied to clipboard!`, 'success')
    
    // Record click/view analytics
    promotionApi.recordClick(promo.id).catch(() => {})
    setTimeout(() => setCopiedCode(null), 3000)
  }

  const handlePromoRedeem = (promo) => {
    promotionApi.recordRedeem(promo.id).catch(() => {})
    if (promo.ctaLink) {
      window.open(promo.ctaLink, '_blank', 'noopener,noreferrer')
    } else {
      showToast('Show this promo code at checkout or use on order!', 'info')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.businessName} on FoodBridge`,
        text: `Check out ${profile?.businessName}'s surplus food offers and verified community contributions on FoodBridge!`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Profile link copied to clipboard!', 'success')
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <Loader text="Loading verified business profile..." />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <Card>
          <div style={{ padding: '3rem 1.5rem' }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Business Profile Not Found</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              {error || 'The requested business profile does not exist or has not yet been verified.'}
            </p>
            <Button variant="primary" onClick={() => navigate('/businesses')}>
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Partner Directory
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/businesses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Verified Business Directory
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Banner Top Strip */}
        <div
          style={{
            height: '140px',
            background: profile.isFeatured
              ? 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #f59e0b 100%)'
              : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            position: 'relative',
          }}
        >
          {profile.isFeatured && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.5rem',
                background: '#fef3c7',
                color: '#b45309',
                padding: '0.4rem 0.9rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #fde68a',
              }}
            >
              <Star size={15} fill="#f59e0b" color="#f59e0b" /> FEATURED SUSTAINABILITY PARTNER
            </div>
          )}
        </div>

        {/* Profile Info Row */}
        <div style={{ padding: '0 2rem 2rem', marginTop: '-60px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              {/* Logo / Avatar */}
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '16px',
                  border: '4px solid var(--color-surface)',
                  background: 'var(--color-surface)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  flexShrink: 0,
                }}
              >
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt={profile.businessName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'var(--color-primary-light, #ecfdf5)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '2rem',
                    }}
                  >
                    {profile.businessName?.charAt(0) || 'B'}
                  </div>
                )}
              </div>

              {/* Title & Badges */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                    {profile.businessName}
                  </h1>
                  {profile.verificationStatus === 'VERIFIED' && (
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        border: '1px solid #bbf7d0',
                      }}
                      title="Verified legal enterprise vetted by FoodBridge administration"
                    >
                      <ShieldCheck size={14} /> Verified Partner
                    </span>
                  )}
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                    }}
                  >
                    {profile.businessType === 'RESTAURANT' ? 'Restaurant & Hospitality' : 'Grocery & Supermarket'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} color="var(--color-primary)" />
                    {profile.city}, {profile.district} District
                  </span>
                  {profile.registrationNumber && (
                    <span style={{ fontSize: '0.85rem' }}>
                      Reg: <strong style={{ color: 'var(--color-text)' }}>{profile.registrationNumber}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={handleShare}>
                <Share2 size={16} style={{ marginRight: '0.4rem' }} /> Share
              </Button>
              <Link to={`/explore?district=${encodeURIComponent(profile.district)}`}>
                <Button variant="outline">
                  <MapPin size={16} style={{ marginRight: '0.4rem' }} /> View on Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                color: 'var(--color-text)',
                maxWidth: '900px',
                marginBottom: '1.5rem',
              }}
            >
              {profile.description}
            </p>
          )}

          {/* Contact Details & Safe Location info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.88rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                Store Location
              </span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {profile.addressLine1}{profile.addressLine2 ? `, ${profile.addressLine2}` : ''}, {profile.city}
              </span>
            </div>
            {profile.contactPerson && (
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Contact Representative
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {profile.contactPerson}
                </span>
              </div>
            )}
            {profile.contactPhone && (
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Phone Inquiry
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {profile.contactPhone}
                </span>
              </div>
            )}
            {profile.contactEmail && (
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Official Email
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {profile.contactEmail}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verified CSR Impact Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ background: '#ecfdf5', padding: '1.25rem', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', marginBottom: '0.25rem' }}>
            <ShoppingBag size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Food Rescued</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#065f46' }}>
            {profile.totalKgRescued || 0} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#047857' }}>Directly diverted from landfill</div>
        </div>

        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', marginBottom: '0.25rem' }}>
            <CheckCircle size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Completed Collections</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#166534' }}>
            {profile.completedCollectionsCount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Verified by receiving charities</div>
        </div>

        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.25rem' }}>
            <HeartHandshake size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Completed Partnerships</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e40af' }}>
            {profile.completedPartnershipsCount || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Full agreement terms fulfilled</div>
        </div>

        <div style={{ background: '#fef3c7', padding: '1.25rem', borderRadius: '14px', border: '1px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', marginBottom: '0.25rem' }}>
            <Tag size={20} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Active Offers</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#92400e' }}>
            {(profile.activeGroceryOffers?.length || 0) + (profile.activeFoodListings?.length || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Available right now</div>
        </div>
      </div>

      {/* SECTION: Promoted Offers & Special Highlights */}
      {profile.activePromotions && profile.activePromotions.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Sparkles size={22} color="#f59e0b" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              Promotions & Exclusive Deals
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {profile.activePromotions.map((promo) => (
              <div
                key={promo.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '14px',
                  border: promo.isFeatured ? '2px solid #f59e0b' : '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {promo.bannerUrl && (
                  <div style={{ height: '140px', overflow: 'hidden', background: '#f1f5f9' }}>
                    <img
                      src={promo.bannerUrl}
                      alt={promo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                      {promo.title}
                    </h3>
                    {promo.isFeatured && (
                      <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        FEATURED
                      </span>
                    )}
                  </div>

                  {promo.description && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem', flex: 1 }}>
                      {promo.description}
                    </p>
                  )}

                  {promo.discountDetails && (
                    <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                      🎁 {promo.discountDetails}
                    </div>
                  )}

                  {promo.promoCode ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '2px dashed #cbd5e1',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '1rem',
                          letterSpacing: '1px',
                          color: 'var(--color-primary)',
                          flex: 1,
                          textAlign: 'center',
                        }}
                      >
                        {promo.promoCode}
                      </div>
                      <Button
                        variant={copiedCode === promo.id ? 'primary' : 'outline'}
                        onClick={() => handleCopyCode(promo)}
                        title="Copy promo code"
                      >
                        {copiedCode === promo.id ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </Button>
                      <Button variant="primary" onClick={() => handlePromoRedeem(promo)}>
                        Redeem
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" onClick={() => handlePromoRedeem(promo)} style={{ marginTop: 'auto' }}>
                      View Offer <ExternalLink size={14} style={{ marginLeft: '0.4rem' }} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Verified Community Recognitions & Badges (Audited Rule Enforcement) */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={24} color="#059669" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              Verified Community Recognitions & CSR Badges
            </h2>
          </div>
          <Link to="/business-partnerships" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            How Recognitions Work →
          </Link>
        </div>

        {/* Audited Recognition Rule Disclaimer */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            fontSize: '0.84rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
          <span>
            <strong>Zero Pre-mature Recognition Policy:</strong> Recognitions and badges on FoodBridge are awarded <em>strictly</em> after both parties finalize terms and the receiving charity confirms verified delivery of resources.
          </span>
        </div>

        {profile.verifiedRecognitions && profile.verifiedRecognitions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {profile.verifiedRecognitions.map((badge, idx) => (
              <div
                key={badge.partnershipId || idx}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  gap: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#b45309',
                    flexShrink: 0,
                  }}
                >
                  <Award size={26} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                      {badge.recognitionBadge || 'Verified Community Partner'}
                    </span>
                  </div>

                  {badge.campaignTitle && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      Supporting Campaign:{' '}
                      {badge.campaignId ? (
                        <Link
                          to={`/campaigns/${badge.campaignId}`}
                          style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {badge.campaignTitle}
                        </Link>
                      ) : (
                        <strong style={{ color: 'var(--color-text)' }}>{badge.campaignTitle}</strong>
                      )}
                    </div>
                  )}

                  {badge.impactSummary && (
                    <div style={{ fontSize: '0.85rem', color: '#166534', background: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '6px', fontWeight: 600, marginBottom: '0.5rem' }}>
                      🌱 {badge.impactSummary}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <CheckCircle size={13} color="#16a34a" />
                    <span>Verified Completed on {new Date(badge.completedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
              <HeartHandshake size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Completed Partnership Recognitions Yet</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                This business is verified and active. Once mutual support with registered charities is agreed and successfully delivered, their verified sponsor badges will be proudly displayed here.
              </p>
              <Link to="/campaigns">
                <Button variant="outline">
                  Browse Active Campaigns <ChevronRight size={16} style={{ marginLeft: '0.3rem' }} />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* SECTION: Active Grocery Discount Offers */}
      {profile.activeGroceryOffers && profile.activeGroceryOffers.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Tag size={22} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Active Grocery Discounts & Coupons ({profile.activeGroceryOffers.length})
              </h2>
            </div>
            <Link to="/grocery-offers" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Browse All Grocery Deals →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {profile.activeGroceryOffers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {offer.imageUrl && (
                  <div style={{ height: '140px', overflow: 'hidden', background: '#f8fafc' }}>
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {offer.category || 'Grocery'}
                    </span>
                    {offer.discountPercentage > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {offer.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                    {offer.title}
                  </h3>

                  {offer.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.75rem', flex: 1 }}>
                      {offer.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      LKR {offer.discountedPrice}
                    </span>
                    {offer.originalPrice && (
                      <span style={{ fontSize: '0.88rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                        LKR {offer.originalPrice}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>📦 {offer.availableQuantity} in stock</span>
                    {offer.expiryDate && (
                      <span>⏰ Valid till {new Date(offer.expiryDate).toLocaleDateString()}</span>
                    )}
                  </div>

                  <Link to="/grocery-offers" style={{ marginTop: 'auto', textDecoration: 'none' }}>
                    <Button variant="primary" style={{ width: '100%' }}>
                      Reserve Coupon
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: Available Surplus Food Listings */}
      {profile.activeFoodListings && profile.activeFoodListings.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShoppingBag size={22} color="#059669" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Surplus Food Rescue ({profile.activeFoodListings.length})
              </h2>
            </div>
            <Link to="/explore" style={{ fontSize: '0.88rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Explore Live Map →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {profile.activeFoodListings.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {item.foodType || 'Prepared Meals'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>
                    AVAILABLE
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
                  {item.title}
                </h3>

                {item.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                    {item.description}
                  </p>
                )}

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                  Quantity: {item.quantity} {item.unit || 'portions'}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Pickup till: {item.pickupEnd ? new Date(item.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Callout for Charities */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          borderRadius: '16px',
          padding: '2.5rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'white' }}>
            Are you a verified Charity or Community Organization?
          </h3>
          <p style={{ color: '#a7f3d0', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Propose a mutual partnership with {profile.businessName} to co-sponsor relief supplies, food rations, or essential support for your campaigns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/campaigns">
            <Button variant="secondary" style={{ fontWeight: 700 }}>
              Browse Campaigns
            </Button>
          </Link>
          <Link to="/business-partnerships">
            <Button variant="outline" style={{ color: 'white', borderColor: 'white' }}>
              How Partnerships Work
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

