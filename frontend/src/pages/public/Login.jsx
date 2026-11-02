import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, getDashboardForRole } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Leaf, LogIn, Lock, Mail, ShieldAlert } from 'lucide-react'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const user = await login(email, password)
      showToast(`Welcome back, ${user.fullName}!`, 'success')

      // Redirect to target path or user's assigned role dashboard
      const targetDashboard = from || getDashboardForRole(user.role)
      navigate(targetDashboard, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick fill helper for demo/testing
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 140px)',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.65rem',
              borderRadius: '16px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              marginBottom: '1rem',
            }}
          >
            <Leaf size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome to FoodBridge</h1>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            Sign in to access your role-based portal
          </p>
        </div>

        <Card>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--color-danger)',
                fontSize: '0.875rem',
              }}
            >
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="login-email"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@foodbridge.lk"
              icon={<Mail size={16} />}
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              block
              isLoading={isLoading}
              icon={<LogIn size={16} />}
              style={{ marginTop: '0.5rem' }}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Fill Buttons */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Fill for Evaluation
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillCredentials('admin@foodbridge.lk', 'Admin@FoodBridge2026')}
              >
                Default Admin
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillCredentials('volunteer.colombo@gmail.com', 'Password123!')}
              >
                Sample User
              </Button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <span className="text-muted">Don&apos;t have an account? </span>
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
