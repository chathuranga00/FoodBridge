import { Link } from 'react-router-dom'
import { Leaf, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '3rem' }}>
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <Leaf size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Food<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Community sustainability platform connecting restaurants, grocers, charities, and
              citizens across Sri Lanka to redistribute surplus food and eliminate food waste.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> Admin-Verified & Zero Waste
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
              <li><Link to="/about" style={{ color: '#94a3b8' }}>About Team EcoConnect</Link></li>
              <li><Link to="/how-it-works" style={{ color: '#94a3b8' }}>How It Works</Link></li>
              <li><Link to="/contact" style={{ color: '#94a3b8' }}>Contact & Support</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Portal Sign In</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>Register as Partner</Link></li>
            </ul>
          </div>

          {/* Core Rules */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Integrity & Rules</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>Role-Based Access Control</li>
              <li>Admin-Verified Businesses</li>
              <li>Admin-Approved Campaigns</li>
              <li>Strict Food Suitability Rules</li>
              <li>No In-App Payment Handling</li>
              <li>Beneficiary Privacy Shield</li>
            </ul>
          </div>

          {/* Contact & Sri Lanka Hub */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1.25rem' }}>EcoConnect Sri Lanka</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Colombo & Regional Hubs, Sri Lanka</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>Hotline: +94 11 234 5678</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <span>support@foodbridge.lk</span>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #1e293b', marginBottom: '2rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem' }}>
          <div>
            &copy; {new Date().getFullYear()} FoodBridge &bull; Developed with <Heart size={14} style={{ display: 'inline', color: '#e11d48' }} /> by Team EcoConnect Sri Lanka.
          </div>
          <div>
            Empowering communities, nourishing families, protecting animals.
          </div>
        </div>
      </div>
    </footer>
  )
}

