import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, getDashboardForRole } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Leaf, UserPlus, Mail, Lock, User, Phone, ShieldAlert, CheckCircle2 } from 'lucide-react'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'USER',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const roles = [
    { value: 'USER', label: 'General Community User & Volunteer' },
    { value: 'RESTAURANT', label: 'Restaurant & Catering Food Donor' },
    { value: 'GROCERY', label: 'Supermarket & Grocery Retailer' },
    { value: 'CHARITY', label: 'Registered Non-Profit Charity / Food Bank' },
    { value: 'ANIMAL_ORG', label: 'Animal Welfare Organization / Shelter' },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setIsLoading(true)

    try {
      const user = await register(formData)
      showToast('Registration successful! Welcome to FoodBridge.', 'success')

      const targetDashboard = getDashboardForRole(user.role)
      navigate(targetDashboard, { replace: true })
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors)
      }
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      setGeneralError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isBusinessOrCharity = ['RESTAURANT', 'GROCERY', 'CHARITY', 'ANIMAL_ORG'].includes(formData.role)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h1>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
            Join the FoodBridge community network in Sri Lanka
          </p>
        </div>

        <Card>
          {generalError && (
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
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Select
              label="Select Your Role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              options={roles}
              placeholder=""
              error={fieldErrors.role}
              hint="Select your organization type or individual user profile"
            />

            {isBusinessOrCharity && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Rule 2 Notice:</strong> Food businesses and charities are subject to administrative
                  verification before publishing or claiming surplus food.
                </span>
              </div>
            )}

            <Input
              label="Full Name / Organization Contact"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Kasun Wickramasinghe"
              error={fieldErrors.fullName}
              icon={<User size={16} />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. kasun@example.lk"
              error={fieldErrors.email}
              icon={<Mail size={16} />}
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +94 77 123 4567"
              error={fieldErrors.phoneNumber}
              icon={<Phone size={16} />}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              error={fieldErrors.password}
              icon={<Lock size={16} />}
            />

            <Button
              type="submit"
              variant="primary"
              block
              isLoading={isLoading}
              icon={<UserPlus size={16} />}
              style={{ marginTop: '0.5rem' }}
            >
              Complete Registration
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
            <span className="text-muted">Already registered? </span>
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

