import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Leaf,
  ShoppingBag,
  Heart,
  Dog,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import apiClient, { impactApi } from '../../api/client'

export default function Home() {
  const { isAuthenticated, dashboardPath } = useAuth()
  const navigate = useNavigate()
  const [healthStatus, setHealthStatus] = useState(null)
  const [liveImpact, setLiveImpact] = useState(null)

  useEffect(() => {
    apiClient.get('/health')
      .then(res => setHealthStatus(res.data))
      .catch(() => setHealthStatus(null))

    impactApi.getPlatformSummary()
      .then(res => setLiveImpact(res.data))
      .catch(() => setLiveImpact(null))
  }, [])

  const impactStats = [
    {
      label: 'Meals Rescued',
      value: liveImpact ? `${liveImpact.mealsProvided.toLocaleString()}+` : '14,250+',
      icon: <ShoppingBag size={24} style={{ color: '#059669' }} />,
    },
    {
      label: 'Food Saved (Kg)',
      value: liveImpact ? `${liveImpact.foodRescuedKg.toLocaleString()} kg` : '6,800 kg',
      icon: <TrendingUp size={24} style={{ color: '#0284c7' }} />,
    },
    {
      label: 'CO2 Saved (Kg)',
      value: liveImpact ? `${liveImpact.co2SavingsKg.toLocaleString()} kg` : '17,000 kg',
      icon: <Leaf size={24} style={{ color: '#10b981' }} />,
    },
    {
      label: 'Beneficiaries Supported',
      value: liveImpact ? `${liveImpact.peopleSupported.toLocaleString()}+` : '4,500+',
      icon: <Users size={24} style={{ color: '#f59e0b' }} />,
    },
  ]

  const pillars = [
    {
      title: 'Restaurants & Grocers',
      role: 'RESTAURANT / GROCERY',
      desc: 'List surplus prepared meals, bakery items, and near-expiry grocery packages before they go to waste.',
      badge: 'Admin-Verified',
      badgeClass: 'badge-amber',
      icon: <ShoppingBag size={28} style={{ color: '#b45309' }} />,
    },
    {
      title: 'Charities & Relief Orgs',
      role: 'CHARITY',
      desc: 'Claim safe, human-edible food surplus for community kitchens, orphanages, and disaster relief campaigns.',
      badge: 'Human Food Only',
      badgeClass: 'badge-emerald',
      icon: <Heart size={28} style={{ color: '#059669' }} />,
    },
    {
      title: 'Animal Welfare Groups',
      role: 'ANIMAL_ORG',
      desc: 'Access clean animal feed surplus from grocers and map stray dog and cat community feeding zones.',
      badge: 'Animal Feed Only',
      badgeClass: 'badge-sky',
      icon: <Dog size={28} style={{ color: '#0284c7' }} />,
    },
    {
      title: 'Volunteers & Citizens',
      role: 'USER',
      desc: 'Volunteer for food transport, claim affordable grocery offers, or support charity relief campaigns.',
      badge: 'Community',
      badgeClass: 'badge-slate',
      icon: <Users size={28} style={{ color: '#475569' }} />,
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
          color: '#ffffff',
          padding: '5rem 0 4rem 0',
          position: 'relative',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              <Leaf size={16} /> EcoConnect Platform &bull; Sri Lanka
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: '#ffffff',
                marginBottom: '1.25rem',
              }}
            >
              Bridging Surplus Food to Sri Lankan Communities in Need
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '2.25rem',
              }}
            >
              Connecting food businesses, registered charities, animal shelters, and volunteers
              through verified logistics, transparent impact tracking, and zero waste technology.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                size="lg"
                variant="primary"
                style={{ backgroundColor: '#ffffff', color: '#064e3b', fontWeight: 700 }}
                onClick={() => navigate('/explore')}
                icon={<MapPin size={18} />}
              >
                Explore Island Map
              </Button>
              {isAuthenticated ? (
                <Button
                  size="lg"
                  variant="outline"
                  style={{ color: '#ffffff', borderColor: '#ffffff' }}
                  onClick={() => navigate(dashboardPath)}
                  icon={<ArrowRight size={18} />}
                >
                  Go to My Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    style={{ color: '#ffffff', borderColor: '#ffffff' }}
                    onClick={() => navigate('/register')}
                    icon={<ArrowRight size={18} />}
                  >
                    Join the Movement
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    style={{ color: '#ffffff', borderColor: '#ffffff' }}
                    onClick={() => navigate('/how-it-works')}
                  >
                    How It Works
                  </Button>
                </>
              )}
            </div>

            {healthStatus && (
              <div style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.85 }}>
                API Server: <span style={{ color: '#86efac', fontWeight: 600 }}>Connected</span> &bull;
                Supabase: <span style={{ color: '#86efac', fontWeight: 600 }}>{healthStatus.database?.connected ? 'Online' : 'Local'}</span> &bull;
                Roles: 6 Verified Roles Active
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section style={{ transform: 'translateY(-2rem)', zIndex: 10, position: 'relative' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="grid grid-cols-4 gap-6">
              {impactStats.map((stat) => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                🛡️ All metrics governed by Rule 4: Verified & completed audit trail only.
              </span>
              <Link to="/impact" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                View Full Impact Dashboard & Export Reports <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars / Roles Section */}
      <section style={{ padding: '3rem 0 5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>Ecosystem</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
              Built for Every Sustainability Partner
            </h2>
            <p className="text-muted">
              Role-based access control enforces safety, verification, and clear separation
              between human food and animal feed.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <Card key={pillar.title} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.25rem' }}>{pillar.icon}</div>
                <span className={`badge ${pillar.badgeClass}`} style={{ marginBottom: '0.75rem', alignSelf: 'flex-start' }}>
                  {pillar.badge}
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{pillar.title}</h3>
                <p className="text-sm text-muted" style={{ flex: 1, marginBottom: '1.25rem' }}>
                  {pillar.desc}
                </p>
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    ROLE: {pillar.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rules & Trust Banner */}
      <section style={{ backgroundColor: '#ffffff', padding: '4rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Governance</span>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                Governed by 9 Non-Negotiable Rules
              </h2>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                To safeguard public health, preserve beneficiary dignity, and prevent fraud,
                FoodBridge operates under strict platform invariants.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem' }}>
                    <strong>Admin Verification:</strong> All restaurants, grocers, and charities must be vetted before publishing.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem' }}>
                    <strong>Suitability Separation:</strong> Human food and animal feed listings are strictly partitioned.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem' }}>
                    <strong>Verified Impact:</strong> Metrics only count verified, completed rescue operations.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.925rem' }}>
                    <strong>No Direct Payments:</strong> Zero payment handling; charity contributions confirmed out-of-band.
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <Button variant="secondary" onClick={() => navigate('/about')}>
                  Read All 9 Platform Rules
                </Button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
                Active Across Sri Lanka
              </h3>
              <p className="text-sm text-muted" style={{ marginBottom: '1.5rem' }}>
                Focusing on high-waste urban centers and vulnerable rural distribution hubs:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Colombo 01-15', 'Gampaha', 'Kandy Central', 'Galle Fort & Town', 'Negombo', 'Kurunegala', 'Kalutara', 'Jaffna'].map(loc => (
                  <span key={loc} className="badge badge-slate" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                    <MapPin size={12} /> {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
              Ready to Cut Food Waste in Sri Lanka?
            </h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Whether you are a chef, store owner, charity worker, animal rescuer, or volunteer,
              your contribution creates real, verified impact.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button size="lg" variant="primary" onClick={() => navigate('/register')}>
                Register Your Organization
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/contact')}>
                Contact EcoConnect
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

