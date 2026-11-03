import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Leaf, Menu, X, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react'
import Button from '../common/Button'

export default function Navbar() {
  const { user, isAuthenticated, logout, dashboardPath } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Map', path: '/explore' },
    { label: 'Grocery Deals', path: '/grocery-offers' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'About', path: '/about' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Contact', path: '/contact' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              padding: '0.45rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Leaf size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Food<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              EcoConnect Sri Lanka
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '0.925rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text)',
                borderBottom: isActive(link.path) ? '2px solid var(--color-primary)' : 'none',
                paddingBottom: '4px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          className="desktop-nav"
        >
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<LayoutDashboard size={16} />}
                onClick={() => navigate(dashboardPath)}
              >
                Dashboard ({user?.role})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--color-text)',
          }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--color-border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1rem',
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                block
                variant="outline"
                icon={<LayoutDashboard size={18} />}
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate(dashboardPath)
                }}
              >
                My Dashboard ({user?.role})
              </Button>
              <Button
                block
                variant="secondary"
                icon={<LogOut size={18} />}
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                block
                variant="secondary"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/login')
                }}
              >
                Sign In
              </Button>
              <Button
                block
                variant="primary"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/register')
                }}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

