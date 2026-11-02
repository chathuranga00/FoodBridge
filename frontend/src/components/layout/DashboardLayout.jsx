import { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Leaf,
  LogOut,
  Menu,
  X,
  User,
  LayoutDashboard,
  MapPin,
  ShoppingBag,
  Heart,
  Dog,
  ShieldCheck,
  Tag,
  ClipboardList,
  DollarSign,
  FileText,
  BarChart3,
  Award,
} from 'lucide-react'
import Button from '../common/Button'

export default function DashboardLayout({ title = 'Dashboard' }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Define sidebar navigation items for each role
  const getNavItems = () => {
    const role = user?.role

    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Admin Overview', path: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
          { label: 'Pending Verifications', path: '/dashboard/admin/verifications', icon: <ShieldCheck size={18} /> },
          { label: 'Campaign Approvals', path: '/dashboard/admin/campaigns', icon: <ClipboardList size={18} /> },
          { label: 'User Management', path: '/dashboard/admin/users', icon: <User size={18} /> },
          { label: 'Platform Revenue', path: '/dashboard/admin/revenue', icon: <DollarSign size={18} /> },
          { label: 'Global Impact Stats', path: '/dashboard/admin/impact', icon: <BarChart3 size={18} /> },
          { label: 'Audit Logs', path: '/dashboard/admin/audit', icon: <FileText size={18} /> },
        ]

      case 'RESTAURANT':
      case 'GROCERY':
        return [
          { label: 'Business Overview', path: '/dashboard/business', icon: <LayoutDashboard size={18} /> },
          { label: 'Surplus Food Listings', path: '/dashboard/business/listings', icon: <ShoppingBag size={18} /> },
          { label: 'Post Surplus Food', path: '/dashboard/business/listings/new', icon: <ShoppingBag size={18} /> },
          { label: 'Grocery Near-Expiry Offers', path: '/dashboard/business/grocery-offers', icon: <Tag size={18} /> },
          { label: 'Discount Coupons', path: '/dashboard/business/coupons', icon: <Tag size={18} /> },
          { label: 'Verification Status', path: '/dashboard/business/verification', icon: <ShieldCheck size={18} /> },
          { label: 'Waste Reduction Stats', path: '/dashboard/business/analytics', icon: <BarChart3 size={18} /> },
        ]

      case 'CHARITY':
        return [
          { label: 'Charity Overview', path: '/dashboard/charity', icon: <LayoutDashboard size={18} /> },
          { label: 'Available Surplus Food', path: '/dashboard/charity/available-food', icon: <ShoppingBag size={18} /> },
          { label: 'My Food Requests', path: '/dashboard/charity/requests', icon: <ClipboardList size={18} /> },
          { label: 'Relief Campaigns', path: '/dashboard/charity/campaigns', icon: <Heart size={18} /> },
          { label: 'Received Contributions', path: '/dashboard/charity/contributions', icon: <DollarSign size={18} /> },
          { label: 'Verified Impact Tracker', path: '/dashboard/charity/impact', icon: <Award size={18} /> },
        ]

      case 'ANIMAL_ORG':
        return [
          { label: 'Animal Welfare Overview', path: '/dashboard/animal-welfare', icon: <LayoutDashboard size={18} /> },
          { label: 'Surplus Animal Feed', path: '/dashboard/animal-welfare/feed-listings', icon: <Dog size={18} /> },
          { label: 'Feeding Locations Map', path: '/dashboard/animal-welfare/locations', icon: <MapPin size={18} /> },
          { label: 'Feeding Campaigns', path: '/dashboard/animal-welfare/campaigns', icon: <Heart size={18} /> },
          { label: 'Donations Confirmed', path: '/dashboard/animal-welfare/contributions', icon: <DollarSign size={18} /> },
          { label: 'Animals Fed Impact', path: '/dashboard/animal-welfare/impact', icon: <Award size={18} /> },
        ]

      case 'USER':
      default:
        return [
          { label: 'My Overview', path: '/dashboard/user', icon: <LayoutDashboard size={18} /> },
          { label: 'Surplus Food Map', path: '/dashboard/user/map', icon: <MapPin size={18} /> },
          { label: 'Grocery Deals', path: '/dashboard/user/deals', icon: <Tag size={18} /> },
          { label: 'My Pledged Contributions', path: '/dashboard/user/contributions', icon: <Heart size={18} /> },
          { label: 'Volunteer Tasks', path: '/dashboard/user/volunteer', icon: <Award size={18} /> },
          { label: 'My Profile', path: '/dashboard/user/profile', icon: <User size={18} /> },
        ]
    }
  }

  const navItems = getNavItems()
  const isActive = (path) => location.pathname === path

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-rose'
      case 'RESTAURANT':
      case 'GROCERY': return 'badge-amber'
      case 'CHARITY': return 'badge-emerald'
      case 'ANIMAL_ORG': return 'badge-sky'
      default: return 'badge-slate'
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 30,
          transition: 'transform 0.2s',
        }}
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand */}
        <div
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            gap: '0.6rem',
          }}
        >
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
          <div>
            <Link to="/" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)', textDecoration: 'none' }}>
              Food<span style={{ color: 'var(--color-primary)' }}>Bridge</span>
            </Link>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
              PORTAL: {user?.role}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
            className="mobile-close-sidebar"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', padding: '0 0.75rem 0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  backgroundColor: isActive(item.path) ? 'var(--color-primary-light)' : 'transparent',
                  color: isActive(item.path) ? 'var(--color-primary)' : 'var(--color-text)',
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ color: isActive(item.path) ? 'var(--color-primary)' : '#64748b' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.fullName || 'User'}
              </div>
              <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {user?.role}
              </span>
            </div>
          </div>
          <Button
            block
            variant="secondary"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
              className="mobile-hamburger-btn"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
              {title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
              Role: {user?.role}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }} className="user-email-header">
              {user?.email}
            </span>
          </div>
        </header>

        {/* Body content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: var(--shadow-xl);
          }
          .sidebar.sidebar-open {
            transform: translateX(0) !important;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
          .user-email-header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
