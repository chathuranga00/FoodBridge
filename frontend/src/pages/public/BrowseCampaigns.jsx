import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Droplet,
  BookOpen,
  GraduationCap,
  Package,
  Utensils,
  ArrowRight,
  Info,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { campaignApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS, CAMPAIGN_NEED_TYPES } from '../../utils/constants'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Loader from '../../components/common/Loader'

export default function BrowseCampaigns() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedNeedType, setSelectedNeedType] = useState('ALL')
  const [selectedDistrict, setSelectedDistrict] = useState('All')

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (selectedNeedType !== 'ALL') params.needType = selectedNeedType
      if (selectedDistrict !== 'All') params.district = selectedDistrict

      const res = await campaignApi.getPublicCampaigns(params)
      setCampaigns(res.data || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      showToast('Failed to load community campaigns', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [selectedNeedType, selectedDistrict])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCampaigns()
  }

  const getNeedTypeIcon = (type) => {
    switch (type) {
      case 'CLEAN_WATER':
        return <Droplet size={14} style={{ color: '#0284c7' }} />
      case 'BOOKS_STATIONERY':
        return <BookOpen size={14} style={{ color: '#d97706' }} />
      case 'SCHOOL_SUPPLIES':
        return <GraduationCap size={14} style={{ color: '#7c3aed' }} />
      case 'FAMILY_ESSENTIALS':
        return <Package size={14} style={{ color: '#059669' }} />
      case 'FOOD':
      default:
        return <Utensils size={14} style={{ color: '#e11d48' }} />
    }
  }

  const getNeedTypeLabel = (type) => {
    const found = CAMPAIGN_NEED_TYPES.find((item) => item.value === type)
    return found ? found.label : type || 'Community Relief'
  }

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ maxWidth: '780px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: 'none',
                marginBottom: '1rem',
              }}
            >
              Rural Community Upliftment • Sri Lanka
            </span>
            <h1 style={{ fontSize: '2.25rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 800 }}>
              Verified Community Campaigns
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Direct aid for vulnerable rural schools, flood-affected farming hamlets, and remote villages. 
              Organized strictly by admin-verified Sri Lankan charities with zero monetary cuts, transparent proof of distribution, and direct community pledges.
            </p>
          </div>
        </div>

        {/* Privacy & Dignity Guarantee Notice */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <ShieldCheck size={26} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#166534', fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Strict Privacy & Dignity Protection Protocol
            </h4>
            <p style={{ color: '#14532d', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              To protect the safety, dignity, and privacy of vulnerable rural families and school children, campaign locations are disclosed <strong>strictly at the District level</strong>. Specific residential addresses, NIC numbers, or personally identifying data are never published. All charities are vetted by FoodBridge administrators.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div>
              <Input
                placeholder="Search campaigns or charities (e.g. Water Filters, Monaragala, School Books)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={selectedNeedType}
              onChange={(e) => setSelectedNeedType(e.target.value)}
              options={CAMPAIGN_NEED_TYPES}
            />

            <Select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              options={[
                { value: 'All', label: 'All Districts' },
                ...SRI_LANKA_DISTRICTS.map((d) => ({ value: d, label: d })),
              ]}
            />

            <Button type="submit" variant="primary" icon={<Search size={16} />}>
              Filter
            </Button>
          </form>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div style={{ padding: '4rem 0' }}>
            <Loader message="Loading verified community campaigns..." />
          </div>
        ) : campaigns.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <Heart size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No campaigns match your filters
            </h3>
            <p className="text-sm text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Try selecting a different need type or district, or reset your search parameters to view all verified campaigns.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedNeedType('ALL')
                setSelectedDistrict('All')
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Cover Image */}
                <div
                  style={{
                    height: '170px',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {camp.coverImageUrl ? (
                    <img
                      src={camp.coverImageUrl}
                      alt={camp.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Heart size={48} style={{ color: '#94a3b8' }} />
                  )}

                  {/* Need Type Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {getNeedTypeIcon(camp.needType)}
                    <span>{getNeedTypeLabel(camp.needType)}</span>
                  </div>

                  {/* District Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <MapPin size={13} style={{ color: '#dc2626' }} />
                    <span>{camp.district} District</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Verified Charity Line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <CheckCircle2 size={15} style={{ color: '#059669', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{camp.charityName}</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      Verified NGO
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.35,
                    }}
                  >
                    {camp.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-xs text-muted"
                    style={{
                      marginBottom: '1.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5,
                    }}
                  >
                    {camp.description}
                  </p>

                  {/* Progress Bar & Target Metrics */}
                  <div style={{ marginTop: 'auto', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {camp.currentQuantity || 0} / {camp.targetQuantity} {camp.targetUnit || 'units'}
                      </span>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#047857' }}>
                        {camp.progressPercentage}% Reached
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
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
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Link */}
                  <Button
                    variant="primary"
                    size="sm"
                    block
                    icon={<ArrowRight size={15} />}
                    onClick={() => navigate(`/campaigns/${camp.id}`)}
                  >
                    View Campaign & Proof
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
