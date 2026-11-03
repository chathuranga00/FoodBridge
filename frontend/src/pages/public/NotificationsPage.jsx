import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationApi } from '../../api/client'
import {
  Bell,
  CheckCheck,
  Check,
  Gift,
  Tag,
  Heart,
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // 'ALL' | 'UNREAD'
  const [markingId, setMarkingId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationApi.getAll()
      setNotifications(res.data || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/notifications')
      return
    }
    fetchNotifications()
  }, [isAuthenticated])

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingId(id)
      await notificationApi.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true)
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    } finally {
      setMarkingAll(false)
    }
  }

  const getNotificationDetails = (notif) => {
    switch (notif.type) {
      case 'FOOD_REQUEST_APPROVED':
        return {
          icon: <Gift size={20} color="#16a34a" />,
          bgColor: '#dcfce7',
          color: '#16a34a',
          label: 'Food Rescue Approved',
          actionText: 'View Food Requests',
          actionPath: user?.role === 'CHARITY' ? '/dashboard/charity' : '/dashboard/business'
        }
      case 'COUPON_RESERVED':
        return {
          icon: <Tag size={20} color="#2563eb" />,
          bgColor: '#dbeafe',
          color: '#2563eb',
          label: 'Coupon Reserved',
          actionText: 'View Reserved Coupons',
          actionPath: '/dashboard/user'
        }
      case 'PARTNERSHIP_UPDATE':
        return {
          icon: <Heart size={20} color="#9333ea" />,
          bgColor: '#f3e8ff',
          color: '#9333ea',
          label: 'Partnership Update',
          actionText: 'View Partnership',
          actionPath: user?.role === 'CHARITY' ? '/dashboard/charity' : '/dashboard/business'
        }
      case 'VERIFICATION_APPROVED':
        return {
          icon: <ShieldCheck size={20} color="#059669" />,
          bgColor: '#d1fae5',
          color: '#059669',
          label: 'Verification Approved',
          actionText: 'Go to Dashboard',
          actionPath: user?.role === 'CHARITY' ? '/dashboard/charity' : '/dashboard/business'
        }
      case 'VERIFICATION_REJECTED':
        return {
          icon: <Info size={20} color="#dc2626" />,
          bgColor: '#fee2e2',
          color: '#dc2626',
          label: 'Verification Notice',
          actionText: 'Update Profile',
          actionPath: user?.role === 'CHARITY' ? '/dashboard/charity' : '/dashboard/business'
        }
      case 'VOLUNTEER_SIGNUP':
        return {
          icon: <Users size={20} color="#ea580c" />,
          bgColor: '#ffedd5',
          color: '#ea580c',
          label: 'New Volunteer Sign-up',
          actionText: 'Manage Volunteers',
          actionPath: '/dashboard/charity'
        }
      case 'VOLUNTEER_REGISTERED':
        return {
          icon: <Users size={20} color="#0284c7" />,
          bgColor: '#e0f2fe',
          color: '#0284c7',
          label: 'Volunteer Confirmation',
          actionText: 'My Volunteering',
          actionPath: '/volunteer'
        }
      case 'VOLUNTEER_ATTENDANCE':
        return {
          icon: <CheckCheck size={20} color="#16a34a" />,
          bgColor: '#dcfce7',
          color: '#16a34a',
          label: 'Attendance Recorded',
          actionText: 'View Impact',
          actionPath: '/impact'
        }
      default:
        return {
          icon: <Bell size={20} color="#4b5563" />,
          bgColor: '#f3f4f6',
          color: '#4b5563',
          label: 'Notification',
          actionText: 'View Details',
          actionPath: '/'
        }
    }
  }

  const filteredNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.isRead : true
  )

  const unreadTotal = notifications.filter((n) => !n.isRead).length

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                Notification Center
              </h1>
              {unreadTotal > 0 && (
                <span
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadTotal} unread
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Real-time in-app alerts and email notifications for your FoodBridge activities.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={15} />}
              onClick={fetchNotifications}
              disabled={loading}
            >
              Refresh
            </Button>
            {unreadTotal > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCheck size={16} />}
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
              >
                {markingAll ? 'Marking...' : 'Mark All as Read'}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem',
          }}
        >
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: filter === 'ALL' ? 'var(--color-primary)' : 'transparent',
              color: filter === 'ALL' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: filter === 'UNREAD' ? 'var(--color-primary)' : 'transparent',
              color: filter === 'UNREAD' ? '#ffffff' : 'var(--color-text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            Unread ({unreadTotal})
          </button>
        </div>

        {/* Notification List */}
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <Loader message="Loading notifications..." />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Bell size={28} color="#9ca3af" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              {filter === 'UNREAD' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
              {filter === 'UNREAD'
                ? 'You have reviewed all your alerts and messages.'
                : 'As you participate in food rescues, discount grocery offers, campaigns, or volunteer drives, updates will appear here.'}
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredNotifications.map((notif) => {
              const details = getNotificationDetails(notif)
              return (
                <div
                  key={notif.id}
                  style={{
                    backgroundColor: notif.isRead ? '#ffffff' : '#f0fdf4',
                    border: notif.isRead ? '1px solid var(--color-border)' : '1px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    boxShadow: notif.isRead ? 'none' : '0 2px 8px rgba(34, 197, 94, 0.08)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Category / Type Icon */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: details.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {details.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: details.color,
                          backgroundColor: details.bgColor,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {details.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: notif.isRead ? 600 : 700,
                        color: 'var(--color-text)',
                        margin: '0 0 0.4rem',
                      }}
                    >
                      {notif.title}
                    </h4>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text)',
                        margin: '0 0 0.85rem',
                        lineHeight: 1.45,
                      }}
                    >
                      {notif.message}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        to={details.actionPath}
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
                        {details.actionText} <ArrowRight size={14} />
                      </Link>

                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          disabled={markingId === notif.id}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                          }}
                        >
                          <Check size={14} /> {markingId === notif.id ? 'Saving...' : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        flexShrink: 0,
                        marginTop: '6px',
                      }}
                      title="Unread"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

