import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Leaf, Menu, X, LogOut, LayoutDashboard, Bell, CheckCheck, ExternalLink, Calendar, Heart, ShieldCheck, Tag, Gift, Users } from 'lucide-react'
import Button from '../common/Button'
import { notificationApi } from '../../api/client'

export default function Navbar() {
  const { user, isAuthenticated, logout, dashboardPath } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Map', path: '/explore' },
    { label: 'Impact', path: '/impact' },
    { label: 'Volunteer', path: '/volunteer' },
    { label: 'Businesses', path: '/businesses' },
    { label: 'Partnerships', path: '/business-partnerships' },
    { label: 'Grocery Deals', path: '/grocery-offers' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'How It Works', path: '/how-it-works' },
  ]

  // Poll unread count on mount or every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setRecentNotifications([])
      return
    }

    const fetchNotificationsData = async () => {
      try {
        const countRes = await notificationApi.getUnreadCount()
        setUnreadCount(countRes.data?.unreadCount || 0)

        const notifsRes = await notificationApi.getAll()
        setRecentNotifications((notifsRes.data || []).slice(0, 5))
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    fetchNotificationsData()
    const interval = setInterval(fetchNotificationsData, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async (e) => {
    e.stopPropagation()
    try {
      await notificationApi.markAllAsRead()
      setUnreadCount(0)
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all read:', err)
    }
  }

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationApi.markAsRead(notif.id)
        setUnreadCount((prev) => Math.max(0, prev - 1))
        setRecentNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      }
    } catch (err) {
      console.error('Error marking notif as read:', err)
    }

    setNotificationsOpen(false)

    // Route based on reference
    if (notif.type === 'FOOD_REQUEST_APPROVED') {
      navigate(user?.role === 'ANIMAL_ORG' ? '/dashboard/animal-welfare' : '/dashboard/charity')
    } else if (notif.type === 'COUPON_RESERVED') {
      navigate('/dashboard/user')
    } else if (notif.type === 'PARTNERSHIP_UPDATE') {
      navigate(user?.role === 'BUSINESS' || user?.role === 'RESTAURANT' || user?.role === 'GROCERY' ? '/dashboard/business' : '/dashboard/charity')
    } else if (notif.type?.startsWith('VOLUNTEER')) {
      navigate('/volunteer')
    } else {
      navigate('/notifications')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const getNotifIcon = (type) => {
    switch (type) {
      case 'FOOD_REQUEST_APPROVED':
        return <Gift size={16} color="#16a34a" />
      case 'COUPON_RESERVED':
        return <Tag size={16} color="#2563eb" />
      case 'PARTNERSHIP_UPDATE':
        return <Heart size={16} color="#9333ea" />
      case 'VERIFICATION_APPROVED':
        return <ShieldCheck size={16} color="#059669" />
      case 'VOLUNTEER_SIGNUP':
      case 'VOLUNTEER_REGISTERED':
      case 'VOLUNTEER_ATTENDANCE':
        return <Users size={16} color="#ea580c" />
      default:
        return <Bell size={16} color="#4b5563" />
    }
  }

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
          style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: '0.9rem',
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

        {/* Auth & Notification Actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          className="desktop-nav"
        >
          {isAuthenticated ? (
            <>
              {/* Notification Center Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  style={{
                    position: 'relative',
                    background: notificationsOpen ? '#f3f4f6' : 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text)',
                    transition: 'all 0.15s ease',
                  }}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        height: '18px',
                        minWidth: '18px',
                        padding: '0 4px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {notificationsOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      width: '340px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid var(--color-border)',
                      zIndex: 50,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCheck size={14} /> Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {recentNotifications.length === 0 ? (
                        <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                          <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications yet</p>
                        </div>
                      ) : (
                        recentNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #f3f4f6',
                              cursor: 'pointer',
                              backgroundColor: n.isRead ? '#ffffff' : '#f0fdf4',
                              transition: 'background-color 0.15s ease',
                              display: 'flex',
                              gap: '10px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? '#f9fafb' : '#dcfce7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? '#ffffff' : '#f0fdf4')}
                          >
                            <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: n.isRead ? 600 : 700,
                                  color: 'var(--color-text)',
                                  marginBottom: '2px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {n.title}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.775rem',
                                  color: 'var(--color-text-muted)',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {n.message}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                            {!n.isRead && (
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--color-primary)',
                                  alignSelf: 'center',
                                }}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div
                      style={{
                        padding: '10px 16px',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: '#f9fafb',
                        textAlign: 'center',
                      }}
                    >
                      <Link
                        to="/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        View all notifications <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

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
                icon={<Bell size={18} />}
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/notifications')
                }}
              >
                Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
              </Button>
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
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
