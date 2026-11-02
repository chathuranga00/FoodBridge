import { ShieldCheck, Leaf, Heart, Users, CheckCircle2 } from 'lucide-react'
import Card from '../../components/common/Card'

export default function About() {
  const rules = [
    {
      num: 1,
      title: 'Role-Based Access Control',
      desc: 'Every endpoint and dashboard view enforces strict authorization rules based on authenticated JWT tokens.',
    },
    {
      num: 2,
      title: 'Admin-Verified Publishers',
      desc: 'Businesses and charities must undergo admin document verification before they can post or claim surplus food.',
    },
    {
      num: 3,
      title: 'Campaign Approval Gate',
      desc: 'All relief and feeding campaigns submitted by charities require explicit administrator review before going public.',
    },
    {
      num: 4,
      title: 'Verified Completed Impact Only',
      desc: 'Platform statistics only count operations that are marked as completed and verified by all participating parties.',
    },
    {
      num: 5,
      title: 'Zero Payment Processing',
      desc: 'FoodBridge never processes donor money directly. Financial pledges are confirmed out-of-band by recipient charities.',
    },
    {
      num: 6,
      title: 'Privacy & Dignity Protection',
      desc: 'Vulnerable beneficiaries and private residential addresses are never exposed in public feeds or search results.',
    },
    {
      num: 7,
      title: 'Human Food vs. Animal Feed Separation',
      desc: 'Strict suitability protocols prevent cross-contamination. Human food requires safety checks; animal feed is categorized distinctly.',
    },
    {
      num: 8,
      title: 'Ledger Segregation',
      desc: 'Charity contributions are held in separate accounts and records from FoodBridge platform operational revenue.',
    },
    {
      num: 9,
      title: 'High Code & Safety Quality',
      desc: 'Built with rigorous validation, transactional integrity, and automated security audit logging.',
    },
  ]

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '750px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Our Mission</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Empowering Sri Lanka Through Food Redistribution
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            FoodBridge is an initiative by <strong>Team EcoConnect</strong>, addressing the twin challenges
            of urban food waste and community food insecurity across Sri Lanka.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '4rem' }}>
          <Card>
            <div style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
              <Leaf size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Eliminating Food Waste</h3>
            <p className="text-sm text-muted">
              Every day, kilograms of fresh, edible food from restaurants, hotels, and supermarkets
              are discarded. We divert this surplus to those who need it most.
            </p>
          </Card>

          <Card>
            <div style={{ marginBottom: '1rem', color: '#0284c7' }}>
              <Heart size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Nourishing Communities</h3>
            <p className="text-sm text-muted">
              We empower verified charities, soup kitchens, eldercare homes, and orphanages
              to claim nutritious food with dignity, speed, and transparency.
            </p>
          </Card>

          <Card>
            <div style={{ marginBottom: '1rem', color: '#b45309' }}>
              <Users size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Animal Welfare Inclusion</h3>
            <p className="text-sm text-muted">
              Safe surplus unsuitable for human consumption is directed to registered animal shelters
              and stray feeders caring for community animals across the island.
            </p>
          </Card>
        </div>

        {/* 9 Non-Negotiable Rules */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span className="badge badge-rose" style={{ marginBottom: '0.5rem' }}>Integrity First</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              The 9 Non-Negotiable Platform Rules
            </h2>
            <p className="text-muted">
              Every system feature and API endpoint strictly adheres to these non-negotiable principles.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {rules.map((rule) => (
              <Card key={rule.num} style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {rule.num}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{rule.title}</h4>
                </div>
                <p className="text-sm text-muted" style={{ paddingLeft: '2rem' }}>
                  {rule.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
