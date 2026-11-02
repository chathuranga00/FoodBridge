import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, ShieldAlert } from 'lucide-react'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import { useToast } from '../../context/ToastContext'

export default function Contact() {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false)
      showToast('Thank you! Your message has been sent to the EcoConnect Sri Lanka team.', 'success')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      })
    }, 800)
  }

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '650px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Support & Partnerships</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Get in Touch</h1>
          <p className="text-muted" style={{ fontSize: '1.05rem' }}>
            Have questions about business verification, charity campaigns, or partnership opportunities in Sri Lanka?
            We are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Contact Details Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card title="EcoConnect Platform Secretariat">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <MapPin size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Colombo Central Hub</h5>
                    <p className="text-sm text-muted">
                      148 Vauxhall Street, Colombo 02, Western Province, Sri Lanka
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Phone size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Helpline & Dispatch</h5>
                    <p className="text-sm text-muted">
                      +94 11 234 5678 / +94 77 123 4567
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Mail size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Email Inquiries</h5>
                    <p className="text-sm text-muted">
                      support@foodbridge.lk &bull; partners@foodbridge.lk
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Clock size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Operating Hours</h5>
                    <p className="text-sm text-muted">
                      Monday &ndash; Sunday: 7:00 AM &ndash; 10:00 PM (Surplus Dispatch Active 24/7)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#064e3b', fontWeight: 700 }}>
                <ShieldAlert size={18} />
                <span>Urgent Food Rescue Hotline</span>
              </div>
              <p className="text-sm" style={{ color: '#047857', lineHeight: 1.5 }}>
                If you have large surplus quantities (e.g. banquet, event, or bulk produce over 50kg)
                expiring within 6 hours, please call our emergency hotline directly at <strong>+94 11 234 5678</strong>.
              </p>
            </div>
          </div>

          {/* Contact Form Card */}
          <Card title="Send Us a Message">
            <form onSubmit={handleSubmit} style={{ marginTop: '0.75rem' }}>
              <Input
                label="Your Name"
                name="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Priyantha Fernando"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. priyantha@domain.lk"
              />

              <Input
                label="Contact Number"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +94 77 123 4567"
              />

              <Textarea
                label="Message or Inquiry"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your organization, surplus quantities, or partnership questions..."
              />

              <Button
                type="submit"
                variant="primary"
                block
                isLoading={isSubmitting}
                icon={<Send size={16} />}
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

