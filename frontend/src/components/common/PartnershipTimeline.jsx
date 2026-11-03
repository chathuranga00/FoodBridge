import React from 'react'
import {
  Send,
  MessageSquare,
  Lock,
  Truck,
  CheckCircle2,
  Award,
  Clock,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'

export default function PartnershipTimeline({ partnership }) {
  if (!partnership) return null

  const { status, recognitionActive, agreedRecognition, requestedRecognition, timeline } = partnership

  const getStepIcon = (stepName) => {
    switch (stepName) {
      case 'PROPOSED':
        return <Send size={15} />
      case 'COUNTERED':
        return <MessageSquare size={15} />
      case 'AGREED':
        return <Lock size={15} />
      case 'DELIVERED':
        return <Truck size={15} />
      case 'COMPLETED':
        return <CheckCircle2 size={15} />
      case 'DECLINED':
        return <XCircle size={15} />
      default:
        return <Clock size={15} />
    }
  }

  const recognitionLabel = agreedRecognition || requestedRecognition || 'Official Corporate Partner'

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--color-primary)' }} />
          <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>
            Partnership Status & Accountability Timeline
          </h4>
        </div>

        {/* Promotional Recognition Banner */}
        {recognitionActive ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#065f46',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
          >
            <Award size={15} style={{ color: '#059669' }} />
            <span>Active CSR Badge: {recognitionLabel}</span>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              color: '#92400e',
              borderRadius: '999px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} style={{ color: '#d97706' }} />
            <span>Badge Locked (Activates only upon completed receipt)</span>
          </div>
        )}
      </div>

      {/* Timeline Steps visual */}
      <div style={{ position: 'relative', paddingLeft: '1.75rem', borderLeft: '2px solid #e2e8f0' }}>
        {timeline && timeline.length > 0 ? (
          timeline.map((item, index) => {
            const isLast = index === timeline.length - 1
            const isCompleted = item.completed
            const isCurrent = item.current

            let iconBg = '#94a3b8'
            if (item.step === 'DECLINED') {
              iconBg = '#ef4444'
            } else if (isCompleted) {
              iconBg = '#059669'
            } else if (isCurrent) {
              iconBg = '#0284c7'
            }

            return (
              <div
                key={index}
                style={{
                  position: 'relative',
                  marginBottom: isLast ? 0 : '1.5rem',
                }}
              >
                {/* Dot / Icon */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2.55rem',
                    top: '0',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: iconBg,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(2, 132, 199, 0.2)' : 'none',
                  }}
                >
                  {getStepIcon(item.step)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.925rem',
                        color: isCurrent ? 'var(--color-primary)' : '#0f172a',
                      }}
                    >
                      {item.title}
                    </span>
                    {isCurrent && (
                      <span className="badge badge-sky" style={{ fontSize: '0.675rem', padding: '0.1rem 0.4rem' }}>
                        Current Stage
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="text-xs text-muted">
                        {new Date(item.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#475569', margin: '0.2rem 0 0 0', lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-xs text-muted">Timeline initializing...</div>
        )}
      </div>
    </div>
  )
}

