import React, { useState } from 'react'
import { MessageSquare, Send, Award, DollarSign, Package } from 'lucide-react'
import Button from './Button'
import Input from './Input'

export default function PartnershipMessageThread({ messages, onSendMessage, sendingMessage, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || sendingMessage) return
    onSendMessage(text.trim())
    setText('')
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <MessageSquare size={18} style={{ color: 'var(--color-primary)' }} />
        <h4 style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>
          Negotiation & Direct Coordination Thread ({messages ? messages.length : 0})
        </h4>
      </div>

      {/* Messages scrollable area */}
      <div
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {!messages || messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No messages yet. Send a message to coordinate terms or delivery details.
          </div>
        ) : (
          messages.map((msg) => {
            const isSystem = msg.senderRole === 'SYSTEM'
            const isBiz = msg.senderRole === 'BUSINESS'

            let roleBadgeClass = isBiz ? 'badge-sky' : 'badge-emerald'
            if (isSystem) roleBadgeClass = 'badge-amber'

            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: msg.isCounterProposal ? '#fffbeb' : '#f8fafc',
                  border: msg.isCounterProposal ? '1px solid #fde68a' : '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{msg.senderName}</span>
                    <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.675rem' }}>
                      {msg.senderRole}
                    </span>
                    {msg.isCounterProposal && (
                      <span className="badge badge-amber" style={{ fontSize: '0.675rem', fontWeight: 800 }}>
                        ⚡ Counter-Proposal
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(msg.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Counter Terms Banner if present */}
                {msg.isCounterProposal && (
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #fcd34d',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0.6rem',
                      fontSize: '0.825rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>
                      Counter-Proposed Terms:
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', color: '#78350f' }}>
                      {msg.counterMonetaryAmount && (
                        <span>
                          <strong>Amount:</strong> LKR {Number(msg.counterMonetaryAmount).toLocaleString()}
                        </span>
                      )}
                      {msg.counterQuantity && (
                        <span>
                          <strong>Quantity:</strong> {msg.counterQuantity} {msg.counterUnit || 'Units'} ({msg.counterItemDescription || ''})
                        </span>
                      )}
                      {msg.counterRecognition && (
                        <span>
                          <strong>Recognition:</strong> {msg.counterRecognition}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {msg.messageText}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* Message input */}
      {!disabled && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Type a message to coordinate terms or logistics..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={sendingMessage}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            icon={<Send size={15} />}
            loading={sendingMessage}
            disabled={!text.trim() || sendingMessage}
          >
            Send
          </Button>
        </form>
      )}
    </div>
  )
}

