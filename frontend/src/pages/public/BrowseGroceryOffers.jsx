import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Info,
  ChevronRight,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { groceryApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS, GROCERY_CATEGORIES } from '../../utils/constants'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Loader from '../../components/common/Loader'

export default function BrowseGroceryOffers() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDistrict, setSelectedDistrict] = useState('All')

  // Reservation Modal States
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false)
  const [reserveQuantity, setReserveQuantity] = useState(1)
  const [submittingReserve, setSubmittingReserve] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search.trim()) params.search = search.trim()
      if (selectedCategory !== 'All') params.category = selectedCategory
      if (selectedDistrict !== 'All') params.district = selectedDistrict

      const res = await groceryApi.getPublicOffers(params)
      setOffers(res.data || [])
    } catch (err) {
      console.error('Error fetching grocery offers:', err)
      showToast(err.response?.data?.message || 'Failed to load grocery offers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [selectedCategory, selectedDistrict])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchOffers()
  }

  const handleOpenReserve = (offer) => {
    setSelectedOffer(offer)
    setReserveQuantity(1)
    setReservationSuccess(null)
    setCopiedCode(false)
    setIsReserveModalOpen(true)
  }

  const handleConfirmReservation = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to reserve discounted grocery items', 'info')
      navigate('/login?redirect=/grocery-offers')
      return
    }

    try {
      setSubmittingReserve(true)
      const res = await groceryApi.reserveOffer(selectedOffer.id, {
        quantity: parseInt(reserveQuantity, 10),
      })
      setReservationSuccess(res.data)
      showToast('Reservation successful! Unique redemption code generated.', 'success')
      // Refresh offers to reflect decreased stock
      fetchOffers()
    } catch (err) {
      console.error('Error reserving offer:', err)
      showToast(err.response?.data?.message || 'Failed to complete reservation', 'error')
    } finally {
      setSubmittingReserve(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    showToast('Redemption code copied to clipboard!', 'success')
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const formatTimeWindow = (start, end) => {
    if (!start || !end) return 'Check store hours'
    try {
      const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const e = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const d = new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric' })
      return `${d}, ${s} - ${e}`
    } catch {
      return 'Scheduled Window'
    }
  }

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh', backgroundColor: '#f8fafc' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ maxWidth: '750px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: 'none',
                marginBottom: '1rem',
              }}
            >
              Zero-Waste Grocery Network • Sri Lanka
            </span>
            <h1 style={{ fontSize: '2.25rem', color: '#ffffff', marginBottom: '0.75rem', fontWeight: 800 }}>
              Discounted Near-Date Groceries
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Save up to 70% on quality branded groceries, pantry essentials, fresh produce, and baked goods. 
              Reserve online for free and pick up in-store using your unique redemption coupon code.
            </p>
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ShoppingBag size={16} />}
                onClick={() => navigate('/dashboard/user')}
              >
                View My Reserved Coupons
              </Button>
            )}
          </div>
        </div>

        {/* Mandatory Best-Before vs Use-By Safety Notice Card */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <Info size={24} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ color: '#1e3a8a', fontSize: '0.975rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Understanding "Best-Before" vs "Use-By" Dates
            </h4>
            <p style={{ color: '#1e40af', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              <strong>Best-Before</strong> indicates optimal flavor, freshness, and quality. Shelf-stable goods, dry foods, and packaged items near or past their best-before date are safe, wholesome, and perfectly legal to consume. 
              In contrast, <strong>Use-By / Expiry</strong> relates strictly to microbiological safety on perishable goods. FoodBridge merchants are verified and required to certify safety compliance for every listed item.
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
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Search products or stores (e.g. Milk, Rice, Keells)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={GROCERY_CATEGORIES.map((c) => ({ value: c, label: c }))}
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
              Filter Deals
            </Button>
          </form>
        </div>

        {/* Active Offers Grid */}
        {loading ? (
          <div style={{ padding: '4rem 0' }}>
            <Loader message="Loading available grocery deals..." />
          </div>
        ) : offers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No grocery deals found
            </h3>
            <p className="text-sm text-muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              We couldn't find any offers matching your selected category, district, or search terms. Try clearing your filters or checking back soon!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedCategory('All')
                setSelectedDistrict('All')
              }}
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
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
                {/* Offer Image or Decorative Header */}
                <div
                  style={{
                    height: '160px',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {offer.imageUrl ? (
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ShoppingBag size={48} style={{ color: '#94a3b8' }} />
                  )}

                  {/* Discount Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.825rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      letterSpacing: '0.02em',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    {offer.discountPercentage}% OFF
                  </div>

                  {/* Category Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {offer.category || 'Grocery'}
                  </div>
                </div>

                {/* Offer Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Shop Info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.8rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <Store size={14} />
                    <span style={{ fontWeight: 600 }}>{offer.businessName}</span>
                    <span>•</span>
                    <span>{offer.businessDistrict || offer.businessCity}</span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {offer.title}
                  </h3>

                  {offer.description && (
                    <p
                      className="text-xs text-muted"
                      style={{
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {offer.description}
                    </p>
                  )}

                  {/* Pricing Block */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      Rs. {Number(offer.discountedPrice).toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--color-text-muted)',
                        textDecoration: 'line-through',
                      }}
                    >
                      Rs. {Number(offer.originalPrice).toLocaleString()}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} style={{ color: '#d97706' }} />
                      <span>
                        Best-Before: <strong>{formatDate(offer.bestBeforeDate)}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} style={{ color: '#0284c7' }} />
                      <span>
                        Collection: <strong>{formatTimeWindow(offer.pickupStart, offer.pickupEnd)}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: '#64748b' }} />
                      <span className="truncate">{offer.pickupAddress || offer.businessAddress}</span>
                    </div>
                  </div>

                  {/* Card Footer with Stock & Reserve Action */}
                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <span
                      className={`badge ${offer.availableQuantity > 3 ? 'badge-emerald' : 'badge-amber'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {offer.availableQuantity} in stock
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenReserve(offer)}
                    >
                      Reserve Deal
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reservation Modal */}
        <Modal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          title={reservationSuccess ? 'Coupon Issued Successfully' : 'Reserve Grocery Discount Deal'}
          size="md"
        >
          {reservationSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#d1fae5',
                  color: '#059669',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Deal Reserved Successfully!
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
                Stock has been locked for you. Present your unique redemption code at the store checkout counter to collect your items at the discounted price.
              </p>

              {/* Unique Redemption Code Display Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed var(--color-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Unique Store Redemption Code
                </span>
                <div
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 900,
                    color: 'var(--color-primary)',
                    letterSpacing: '0.1em',
                    margin: '0.5rem 0',
                    fontFamily: 'monospace',
                  }}
                >
                  {reservationSuccess.redemptionCode}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  onClick={() => copyToClipboard(reservationSuccess.redemptionCode)}
                >
                  {copiedCode ? 'Code Copied!' : 'Copy Code'}
                </Button>
              </div>

              {/* Pickup Instructions */}
              <div
                style={{
                  textAlign: 'left',
                  backgroundColor: '#eff6ff',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  color: '#1e40af',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Pickup Details:</div>
                <div>Store: <strong>{reservationSuccess.businessName}</strong></div>
                <div>Address: {reservationSuccess.pickupAddress}</div>
                <div>Window: {formatTimeWindow(reservationSuccess.pickupStart, reservationSuccess.pickupEnd)}</div>
                <div>Quantity: {reservationSuccess.quantity} unit(s) • Total: <strong>Rs. {Number(reservationSuccess.totalPrice).toLocaleString()}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setIsReserveModalOpen(false)}>
                  Browse More Deals
                </Button>
                <Button variant="primary" onClick={() => navigate('/dashboard/user')}>
                  Go to My Coupons
                </Button>
              </div>
            </div>
          ) : selectedOffer ? (
            <div>
              {/* Product Mini Header */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {selectedOffer.title}
                    </h4>
                    <span className="text-xs text-muted">
                      Offered by <strong>{selectedOffer.businessName}</strong> ({selectedOffer.businessCity})
                    </span>
                  </div>
                  <span className="badge badge-emerald">
                    {selectedOffer.discountPercentage}% OFF
                  </span>
                </div>
              </div>

              {/* Quantity Picker & Pricing breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Quantity to Reserve (Max: {selectedOffer.availableQuantity})
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={reserveQuantity <= 1}
                    onClick={() => setReserveQuantity(Math.max(1, reserveQuantity - 1))}
                  >
                    -
                  </Button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, minWidth: '40px', textAlign: 'center' }}>
                    {reserveQuantity}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={reserveQuantity >= selectedOffer.availableQuantity}
                    onClick={() => setReserveQuantity(Math.min(selectedOffer.availableQuantity, reserveQuantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span className="text-xs text-muted">Total Payable at Store:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    Rs. {(Number(selectedOffer.discountedPrice) * reserveQuantity).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs text-muted">You Save:</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>
                    Rs. {((Number(selectedOffer.originalPrice) - Number(selectedOffer.discountedPrice)) * reserveQuantity).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <p className="text-xs text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.4 }}>
                * No online payment is processed (Rule 5). You pay in cash or card directly at the store when presenting your code. Reservations uncollected after the collection window automatically expire and release stock back to the community.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="secondary" onClick={() => setIsReserveModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={submittingReserve}
                  onClick={handleConfirmReservation}
                >
                  {isAuthenticated ? 'Confirm & Get Code' : 'Sign In to Reserve'}
                </Button>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </div>
  )
}
