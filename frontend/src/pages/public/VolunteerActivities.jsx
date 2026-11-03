import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { volunteerApi } from '../../api/client'
import { SRI_LANKA_DISTRICTS } from '../../utils/constants'
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  Heart,
  BookOpen,
  Trees,
  Dog,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'

export default function VolunteerActivities() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('BROWSE') // 'BROWSE' | 'MY_HISTORY'
  const [opportunities, setOpportunities] = useState([])
  const [myParticipations, setMyParticipations] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modals
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [selectedOppForSignUp, setSelectedOppForSignUp] = useState(null)
  const [signUpNotes, setSignUpNotes] = useState('')
  const [signingUp, setSigningUp] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [oppToCancel, setOppToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  // Post Opportunity Modal (for Charity / Animal Org / Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'FOOD_DISTRIBUTION',
    district: user?.district || 'Colombo',
    city: '',
    addressLine: '',
    eventDate: '',
    startTime: '09:00 AM',
    endTime: '01:00 PM',
    estimatedHours: 4.0,
    volunteersNeeded: 5,
    skillsRequired: '',
    contactPhone: user?.phoneNumber || '',
  })

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isOrganizerRole =
    user?.role === 'CHARITY' || user?.role === 'ANIMAL_ORG' || user?.role === 'ADMIN'

  const categories = [
    { id: '', label: 'All Opportunities', icon: <Users size={16} /> },
    { id: 'FOOD_DISTRIBUTION', label: 'Food Distribution', icon: <Heart size={16} /> },
    { id: 'SCHOOL_SUPPLIES', label: 'School Supplies', icon: <BookOpen size={16} /> },
    { id: 'ENVIRONMENTAL', label: 'Environmental', icon: <Trees size={16} /> },
    { id: 'ANIMAL_WELFARE', label: 'Animal Welfare', icon: <Dog size={16} /> },
  ]

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedCategory) params.category = selectedCategory
      if (selectedDistrict) params.district = selectedDistrict
      if (searchTerm) params.search = searchTerm

      const res = await volunteerApi.getOpportunities(params)
      setOpportunities(res.data || [])
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      setErrorMessage('Failed to load opportunities.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyParticipations = async () => {
    if (!isAuthenticated) return
    try {
      const res = await volunteerApi.getMyParticipations()
      setMyParticipations(res.data || [])
    } catch (err) {
      console.error('Error fetching participations:', err)
    }
  }

  useEffect(() => {
    fetchOpportunities()
    if (isAuthenticated) {
      fetchMyParticipations()
    }
  }, [selectedCategory, selectedDistrict, isAuthenticated])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchOpportunities()
  }

  const handleOpenSignUp = (opp) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/volunteer')
      return
    }
    setSelectedOppForSignUp(opp)
    setSignUpNotes('')
    setSignUpModalOpen(true)
  }

  const handleConfirmSignUp = async () => {
    if (!selectedOppForSignUp) return
    try {
      setSigningUp(true)
      setErrorMessage('')
      await volunteerApi.signUp(selectedOppForSignUp.id, { notes: signUpNotes })
      setSuccessMessage(`You have successfully registered for "${selectedOppForSignUp.title}"!`)
      setSignUpModalOpen(false)
      fetchOpportunities()
      fetchMyParticipations()
    } catch (err) {
      console.error('Sign up error:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to sign up for opportunity.')
    } finally {
      setSigningUp(false)
    }
  }

  const handleCancelSignUp = async () => {
    if (!oppToCancel) return
    try {
      setCancelling(true)
      setErrorMessage('')
      await volunteerApi.cancelSignUp(oppToCancel.id)
      setSuccessMessage('Volunteer registration cancelled.')
      setCancelModalOpen(false)
      fetchOpportunities()
      fetchMyParticipations()
    } catch (err) {
      console.error('Cancel registration error:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to cancel registration.')
    } finally {
      setCancelling(false)
    }
  }

  const handleCreateOpportunity = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      setErrorMessage('')
      await volunteerApi.createOpportunity({
        ...createForm,
        estimatedHours: parseFloat(createForm.estimatedHours) || 2.0,
        volunteersNeeded: parseInt(createForm.volunteersNeeded, 10) || 1,
      })
      setSuccessMessage('Volunteer opportunity published successfully!')
      setCreateModalOpen(false)
      fetchOpportunities()
    } catch (err) {
      console.error('Create error:', err)
      setErrorMessage(err.response?.data?.message || 'Failed to publish opportunity.')
    } finally {
      setCreating(false)
    }
  }

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'FOOD_DISTRIBUTION':
        return { color: '#16a34a', bg: '#dcfce7', label: 'Food Distribution', icon: <Heart size={14} /> }
      case 'SCHOOL_SUPPLIES':
        return { color: '#2563eb', bg: '#dbeafe', label: 'School Supplies', icon: <BookOpen size={14} /> }
      case 'ENVIRONMENTAL':
        return { color: '#059669', bg: '#d1fae5', label: 'Environmental', icon: <Trees size={14} /> }
      case 'ANIMAL_WELFARE':
        return { color: '#ea580c', bg: '#ffedd5', label: 'Animal Welfare', icon: <Dog size={14} /> }
      default:
        return { color: '#4b5563', bg: '#f3f4f6', label: 'Community', icon: <Users size={14} /> }
    }
  }

  const getParticipationBadge = (status) => {
    switch (status) {
      case 'ATTENDED':
        return <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Attended & Verified</span>
      case 'REGISTERED':
        return <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Registered</span>
      case 'NO_SHOW':
        return <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>No-Show</span>
      case 'CANCELLED':
        return <span style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Cancelled</span>
      default:
        return null
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '0.75rem',
              }}
            >
              Community Action Hub
            </span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Volunteer for Change Across Sri Lanka
            </h1>
            <p style={{ margin: 0, fontSize: '1rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Join hands with verified charities and local initiatives to rescue food, distribute school supplies, plant trees, and care for community animals. Your completed volunteer hours feed directly into the national Impact Dashboard!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isOrganizerRole && (
              <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
                onClick={() => setCreateModalOpen(true)}
                style={{ backgroundColor: '#ffffff', color: '#15803d', fontWeight: 700 }}
              >
                Post Volunteer Drive
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => setActiveTab(activeTab === 'BROWSE' ? 'MY_HISTORY' : 'BROWSE')}
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                {activeTab === 'BROWSE' ? `My Volunteering (${myParticipations.length})` : 'Browse Opportunities'}
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div
            style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* View Tabs */}
        {isAuthenticated && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.5rem',
            }}
          >
            <button
              onClick={() => setActiveTab('BROWSE')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'BROWSE' ? '3px solid var(--color-primary)' : '3px solid transparent',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: activeTab === 'BROWSE' ? 700 : 500,
                color: activeTab === 'BROWSE' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              Available Opportunities ({opportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('MY_HISTORY')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'MY_HISTORY' ? '3px solid var(--color-primary)' : '3px solid transparent',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: activeTab === 'MY_HISTORY' ? 700 : 500,
                color: activeTab === 'MY_HISTORY' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              My Volunteering History ({myParticipations.length})
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: BROWSE OPPORTUNITIES */}
        {/* ========================================================================= */}
        {activeTab === 'BROWSE' && (
          <>
            {/* Filter Bar */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Category pills */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: selectedCategory === c.id ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: selectedCategory === c.id ? 'var(--color-primary)' : '#ffffff',
                      color: selectedCategory === c.id ? '#ffffff' : 'var(--color-text)',
                      fontSize: '0.85rem',
                      fontWeight: selectedCategory === c.id ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {c.icon}
                    {c.label}
                  </button>
                ))}
              </div>

              {/* District & Search Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                    Filter by District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="">All 25 Districts</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                      size={16}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                    />
                    <input
                      type="text"
                      placeholder="Search title, organizer, city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.9rem',
                      }}
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="md">
                    Search
                  </Button>
                </form>
              </div>
            </div>

            {/* Opportunities Grid */}
            {loading ? (
              <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <Loader message="Loading opportunities..." />
              </div>
            ) : opportunities.length === 0 ? (
              <Card style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Users size={40} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  No Volunteer Opportunities Found
                </h3>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                  Try adjusting your category or district filters, or check back soon for upcoming drives.
                </p>
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {opportunities.map((opp) => {
                  const theme = getCategoryTheme(opp.category)
                  const percentFilled = Math.min(100, Math.round((opp.volunteersRegistered / opp.volunteersNeeded) * 100))
                  const isFull = opp.volunteersRegistered >= opp.volunteersNeeded
                  const isRegistered = opp.isUserRegistered

                  return (
                    <Card
                      key={opp.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--color-border)',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                    >
                      <div>
                        {/* Top Meta Bar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.85rem',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: theme.color,
                              backgroundColor: theme.bg,
                              padding: '3px 10px',
                              borderRadius: '999px',
                            }}
                          >
                            {theme.icon}
                            {theme.label}
                          </span>

                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {opp.city ? `${opp.city}, ` : ''}{opp.district}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            margin: '0 0 0.5rem',
                            lineHeight: 1.3,
                          }}
                        >
                          {opp.title}
                        </h3>

                        {/* Organizer */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                            by {opp.organizerName}
                          </span>
                          <span title="Verified Organizer" style={{ display: 'flex', alignItems: 'center', color: '#16a34a' }}>
                            <ShieldCheck size={16} />
                          </span>
                        </div>

                        {/* Description */}
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-text)',
                            margin: '0 0 1rem',
                            lineHeight: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {opp.description}
                        </p>

                        {/* Details Grid */}
                        <div
                          style={{
                            backgroundColor: '#f9fafb',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            marginBottom: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            fontSize: '0.825rem',
                            color: 'var(--color-text)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#6b7280" />
                            <span>
                              <strong>Date:</strong> {opp.eventDate}
                            </span>
                          </div>
                          {(opp.startTime || opp.endTime) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={14} color="#6b7280" />
                              <span>
                                <strong>Hours:</strong> {opp.startTime || 'Start'} - {opp.endTime || 'End'} ({opp.estimatedHours} hrs)
                              </span>
                            </div>
                          )}
                          {opp.skillsRequired && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <CheckCircle2 size={14} color="#6b7280" style={{ marginTop: '2px' }} />
                              <span>
                                <strong>Skills:</strong> {opp.skillsRequired}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Capacity Progress */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              marginBottom: '4px',
                            }}
                          >
                            <span>Volunteers Registered</span>
                            <span style={{ color: isFull ? '#dc2626' : 'var(--color-primary)' }}>
                              {opp.volunteersRegistered} / {opp.volunteersNeeded}
                            </span>
                          </div>
                          <div
                            style={{
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '999px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${percentFilled}%`,
                                height: '100%',
                                backgroundColor: isFull ? '#ea580c' : 'var(--color-primary)',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isRegistered ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span
                              style={{
                                flex: 1,
                                textAlign: 'center',
                                backgroundColor: '#dcfce7',
                                color: '#16a34a',
                                padding: '8px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <Check size={16} /> Registered
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOppToCancel(opp)
                                setCancelModalOpen(true)
                              }}
                              style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : isFull ? (
                          <Button block disabled variant="secondary">
                            Capacity Filled
                          </Button>
                        ) : (
                          <Button
                            block
                            variant="primary"
                            icon={<Users size={16} />}
                            onClick={() => handleOpenSignUp(opp)}
                          >
                            Sign Up to Volunteer
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY PARTICIPATION HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'MY_HISTORY' && (
          <div>
            {myParticipations.length === 0 ? (
              <Card style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <Users size={40} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  No Volunteer Registrations Yet
                </h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.25rem', fontSize: '0.9rem' }}>
                  Browse our active drives and lend your skills to support your neighborhood.
                </p>
                <Button variant="primary" onClick={() => setActiveTab('BROWSE')}>
                  Explore Volunteer Opportunities
                </Button>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myParticipations.map((part) => {
                  const theme = getCategoryTheme(part.category)
                  return (
                    <Card
                      key={part.id}
                      style={{
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ maxWidth: '580px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: theme.color,
                              backgroundColor: theme.bg,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {theme.label}
                          </span>
                          {getParticipationBadge(part.status)}
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Registered: {part.registeredAt ? new Date(part.registeredAt).toLocaleDateString() : ''}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--color-text)' }}>
                          {part.opportunityTitle}
                        </h3>

                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                          <span>
                            <strong>Organizer:</strong> {part.organizerName}
                          </span>
                          <span>
                            <strong>Date:</strong> {part.eventDate}
                          </span>
                          <span>
                            <strong>Location:</strong> {part.city ? `${part.city}, ` : ''}{part.district}
                          </span>
                        </div>

                        {part.status === 'ATTENDED' && (
                          <div
                            style={{
                              marginTop: '0.75rem',
                              padding: '8px 12px',
                              backgroundColor: '#f0fdf4',
                              borderRadius: '8px',
                              border: '1px solid #bbf7d0',
                              fontSize: '0.85rem',
                              color: '#15803d',
                            }}
                          >
                            <strong>Verified Impact:</strong> {part.hoursVolunteered} hours served! Credited to your community record and platform stats.
                            {part.attendanceNotes && <div style={{ marginTop: '2px', fontStyle: 'italic' }}>"{part.attendanceNotes}"</div>}
                          </div>
                        )}
                      </div>

                      <div>
                        {part.status === 'REGISTERED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOppToCancel({ id: part.opportunityId, title: part.opportunityTitle })
                              setCancelModalOpen(true)
                            }}
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            Cancel Registration
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SIGN UP MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        title="Confirm Volunteer Registration"
      >
        {selectedOppForSignUp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700 }}>
                {selectedOppForSignUp.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Organizer: {selectedOppForSignUp.organizerName} | Date: {selectedOppForSignUp.eventDate}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Note to Organizer (Optional)
              </label>
              <Textarea
                placeholder="Share any relevant skills, transport availability, or availability details..."
                value={signUpNotes}
                onChange={(e) => setSignUpNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setSignUpModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSignUp}
                disabled={signingUp}
              >
                {signingUp ? 'Registering...' : 'Confirm Sign Up'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* CANCEL REGISTRATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Volunteer Registration"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', margin: '0 0 1.25rem' }}>
          Are you sure you want to cancel your registration for{' '}
          <strong>{oppToCancel?.title}</strong>? Your spot will be made available to other community members.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
            Keep Registration
          </Button>
          <Button
            variant="primary"
            onClick={handleCancelSignUp}
            disabled={cancelling}
            style={{ backgroundColor: '#dc2626' }}
          >
            {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* CREATE OPPORTUNITY MODAL (Organizers) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post New Volunteer Drive"
      >
        <form onSubmit={handleCreateOpportunity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Opportunity Title *"
            required
            placeholder="e.g., Weekend Cooked Meal Distribution"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Category *
            </label>
            <select
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                fontSize: '0.9rem',
              }}
            >
              <option value="FOOD_DISTRIBUTION">Food Collection & Distribution</option>
              <option value="SCHOOL_SUPPLIES">School Supply Drives</option>
              <option value="ENVIRONMENTAL">Environmental & Cleanups</option>
              <option value="ANIMAL_WELFARE">Animal Welfare & Stray Feeding</option>
            </select>
          </div>

          <Textarea
            label="Description *"
            required
            rows={3}
            placeholder="Describe the activity, role of volunteers, and community impact..."
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                District *
              </label>
              <select
                value={createForm.district}
                onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '0.9rem',
                }}
              >
                {SRI_LANKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="City / Town"
              placeholder="e.g., Kandy Town"
              value={createForm.city}
              onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
            />
          </div>

          <Input
            label="Street Address / Meeting Point"
            placeholder="e.g., Community Hall, Temple Road"
            value={createForm.addressLine}
            onChange={(e) => setCreateForm({ ...createForm, addressLine: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Event Date *"
              type="date"
              required
              value={createForm.eventDate}
              onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
            />

            <Input
              label="Volunteers Needed *"
              type="number"
              min="1"
              required
              value={createForm.volunteersNeeded}
              onChange={(e) => setCreateForm({ ...createForm, volunteersNeeded: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Start Time"
              placeholder="09:00 AM"
              value={createForm.startTime}
              onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
            />

            <Input
              label="End Time"
              placeholder="01:00 PM"
              value={createForm.endTime}
              onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
            />

            <Input
              label="Hours (est.)"
              type="number"
              step="0.5"
              value={createForm.estimatedHours}
              onChange={(e) => setCreateForm({ ...createForm, estimatedHours: e.target.value })}
            />
          </div>

          <Input
            label="Skills / Equipment Required"
            placeholder="e.g., Gloves, sorting skills, comfortable shoes"
            value={createForm.skillsRequired}
            onChange={(e) => setCreateForm({ ...createForm, skillsRequired: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creating}>
              {creating ? 'Publishing...' : 'Publish Drive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

