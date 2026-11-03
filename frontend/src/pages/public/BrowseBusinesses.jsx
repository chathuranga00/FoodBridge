import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Star,
  Award,
  ShoppingBag,
  Tag,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Store,
  Utensils
} from 'lucide-react'
import { businessApi } from '../../api/client'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { SRI_LANKA_DISTRICTS } from '../../utils/constants'

export default function BrowseBusinesses() {
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  useEffect(() => {
    loadBusinesses()
  }, [selectedDistrict, selectedType, featuredOnly])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedDistrict) params.district = selectedDistrict
      if (selectedType) params.type = selectedType
      if (featuredOnly) params.featuredOnly = true

      const res = await businessApi.getPublicBusinesses(params)
      setBusinesses(res.data || [])
    } catch (err) {
      console.error('Failed to load businesses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Client-side text filter on name or description
  const filteredBusinesses = businesses.filter((b) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      b.businessName?.toLowerCase().includes(term) ||
      b.description?.toLowerCase().includes(term) ||
      b.city?.toLowerCase().includes(term)
    )
  })

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          color: 'white',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Sparkles size={15} color="#fde68a" /> Verified Corporate & Local Partners
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.2 }}>
            Partner Businesses Driving Zero Food Waste
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#d1fae5', margin: '0 0 1.75rem' }}>
            Discover restaurants, bakeries, grocers, and supermarkets across Sri Lanka dedicated to surplus food rescue, affordable grocery discounts, and audited community partnerships.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/business-partnerships">
              <Button variant="secondary" style={{ fontWeight: 700 }}>
                How Business Partnerships Work
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" style={{ color: 'white', borderColor: 'white' }}>
                <MapPin size={16} style={{ marginRight: '0.4rem' }} /> Explore on Interactive Map
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--color-surface)',
          padding: '1.25rem',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by business name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* District Selector */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            >
              <option value="">All Districts ({SRI_LANKA_DISTRICTS?.length || 25})</option>
              {SRI_LANKA_DISTRICTS?.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Business Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            >
              <option value="">All Business Types</option>
              <option value="RESTAURANT">Restaurants & Cafes</option>
              <option value="GROCERY">Grocers & Supermarkets</option>
            </select>
          </div>

          {/* Featured Only Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: 'var(--color-text)',
              }}
            >
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: 'var(--color-primary)' }}
              />
              <Star size={16} fill={featuredOnly ? '#f59e0b' : 'none'} color={featuredOnly ? '#f59e0b' : '#64748b'} />
              Featured Partners Only
            </label>
          </div>
        </div>
      </div>

      {/* Directory Results */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <Loader text="Loading verified partner businesses..." />
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <Card>
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Building2 size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Businesses Found</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>
              No verified businesses match your selected filters. Try broadening your district or type filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedDistrict('')
                setSelectedType('')
                setFeaturedOnly(false)
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Showing {filteredBusinesses.length} verified partner {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredBusinesses.map((b) => (
              <div
                key={b.id}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: '16px',
                  border: b.isFeatured ? '2px solid #f59e0b' : '1px solid var(--color-border)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Featured Badge Bar */}
                {b.isFeatured && (
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '0.3rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      letterSpacing: '0.5px',
                    }}
                  >
                    <Star size={13} fill="white" /> FEATURED SUSTAINABILITY PARTNER
                  </div>
                )}

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Business Top Row: Avatar & Title */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.businessName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : b.businessType === 'RESTAURANT' ? (
                        <Utensils size={28} color="var(--color-primary)" />
                      ) : (
                        <Store size={28} color="var(--color-primary)" />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                          {b.businessName}
                        </h3>
                        {b.verificationStatus === 'VERIFIED' && (
                          <ShieldCheck size={16} color="#15803d" title="Verified business" />
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                        <MapPin size={13} color="var(--color-primary)" />
                        <span>{b.city}, {b.district}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description snippet */}
                  {b.description && (
                    <p
                      style={{
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        color: 'var(--color-text)',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {b.description}
                    </p>
                  )}

                  {/* Impact & Offer Stats Badges */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1.25rem',
                      textAlign: 'center',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#065f46' }}>
                        {b.totalKgRescued || 0}kg
                      </div>
                      <div style={{ color: '#64748b' }}>Rescued</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e40af' }}>
                        {b.completedPartnershipsCount || 0}
                      </div>
                      <div style={{ color: '#64748b' }}>Partnerships</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#92400e' }}>
                        {(b.activeOffersCount || 0) + (b.activeListingsCount || 0)}
                      </div>
                      <div style={{ color: '#64748b' }}>Active Offers</div>
                    </div>
                  </div>

                  {/* View Profile Action */}
                  <Link to={`/businesses/${b.id}`} style={{ marginTop: 'auto', textDecoration: 'none' }}>
                    <Button variant={b.isFeatured ? 'primary' : 'outline'} style={{ width: '100%', fontWeight: 700 }}>
                      View Profile & Offers <ChevronRight size={16} style={{ marginLeft: '0.3rem' }} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

