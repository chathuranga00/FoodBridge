import { Link } from 'react-router-dom'
import {
  Handshake,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  MessageSquare,
  Truck,
  ArrowRight,
  Building2,
  Heart,
  TrendingUp,
  FileCheck,
  Users
} from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

export default function BusinessPartnerships() {
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
          borderRadius: '24px',
          padding: '4rem 2.5rem',
          color: 'white',
          marginBottom: '3.5rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Handshake size={18} color="#fde68a" /> Main Platform Innovation
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 1.25rem', lineHeight: 1.2 }}>
            Business-to-Charity Partnerships
          </h1>

          <p style={{ fontSize: '1.2rem', lineHeight: 1.6, color: '#d1fae5', margin: '0 0 2rem' }}>
            Empowering restaurants, supermarkets, and corporate donors to co-sponsor verified community relief campaigns, eliminate food waste, and earn audited public recognition.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/campaigns">
              <Button variant="secondary" style={{ fontWeight: 800, padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                Browse Active Campaigns <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" style={{ color: 'white', borderColor: 'white', padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                Register Your Business
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Why Partner Section */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Why Partner on FoodBridge?
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Traditional corporate philanthropy often lacks transparency and direct feedback. FoodBridge connects your business directly to verified grassroots campaigns with complete accountability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          <Card>
            <div style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                100% Direct & Transparent
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Every charity on FoodBridge is vetted by human administrators with verified registration certificates. You communicate directly with charity directors without middlemen or commissions.
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                Audited Recognition Badges
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Gain valuable goodwill for your brand. When a partnership is completed, your agreed sponsor badges appear on your public profile and on the campaign page for the whole community to see.
              </p>
            </div>
          </Card>

          <Card>
            <div style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                Flexible Contribution Types
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Provide prepared nutritious meals, dry ration packs, water purification filters, school stationery, or financial pledges. You can support communities using your surplus stock or budget.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* The 5-Step Journey */}
      <div style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            The 5-Step Partnership Journey
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Designed for total clarity, mutual respect, and legal and social accountability.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Step 1 */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              1
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
                Browse Verified Community Campaigns
              </h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                Explore active community relief campaigns across Sri Lanka. Each campaign lists its exact community need (cooked food, clean water filters, school stationery), target quantity, and verified receiving charity.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              2
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
                Propose a Partnership & Recognition
              </h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                Select how you wish to support: offer surplus meals, logistics, supplies, or financial pledges. You can also specify the promotional recognition you would like in return (e.g., &quot;Headline Nutrition Sponsor Badge&quot; or co-branded distribution banners).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              3
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
                Direct In-Platform Negotiation
              </h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                The charity reviews your proposal. They can accept, decline, or counter-propose with adjusted quantities or delivery schedules. An encrypted messaging thread lets both teams align transparently before finalizing terms.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              4
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
                Immutable Agreement Lock
              </h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                Once both parties agree, the status changes to <strong>AGREED</strong>. An immutable snapshot of the agreed terms is permanently locked in the database. Neither party can unilaterally alter terms or expectations.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              padding: '1.75rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#15803d',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              5
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text)' }}>
                Verified Delivery & Recognition Activation
              </h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
                Your business delivers the support. The charity confirms receipt, uploads photo evidence, and marks the partnership <strong>COMPLETED</strong>. The platform instantly unlocks your verified recognition badge on your profile and updates national CSR metrics!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recognition Integrity Callout Banner */}
      <div
        style={{
          background: '#fef3c7',
          border: '2px solid #fde68a',
          borderRadius: '18px',
          padding: '2.5rem',
          marginBottom: '4rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f59e0b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Lock size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#92400e', margin: '0 0 0.5rem' }}>
              The Zero Pre-Mature Recognition Policy
            </h3>
            <p style={{ color: '#78350f', fontSize: '0.98rem', lineHeight: 1.6, margin: 0 }}>
              At FoodBridge, <strong>recognition is only given for agreed, completed partnerships</strong>. A proposal or pledge in negotiation never earns public badges. This ensures that every badge displayed on a business profile reflects real, audited, and charity-verified impact.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          Ready to Make a Measurable Impact?
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 1.75rem' }}>
          Join leading food businesses across Sri Lanka in transforming surplus stock into life-changing community support.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/campaigns">
            <Button variant="primary" style={{ fontWeight: 700, padding: '0.75rem 1.75rem' }}>
              Explore Active Campaigns
            </Button>
          </Link>
          <Link to="/businesses">
            <Button variant="outline" style={{ fontWeight: 700, padding: '0.75rem 1.75rem' }}>
              Browse Partner Directory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
