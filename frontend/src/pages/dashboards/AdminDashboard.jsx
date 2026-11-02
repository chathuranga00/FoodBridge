import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  ShieldCheck,
  ClipboardList,
  Users,
  DollarSign,
  Check,
  X,
  FileText,
  AlertTriangle,
  Award,
  ExternalLink,
  Eye,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Textarea from '../../components/common/Textarea'
import Loader from '../../components/common/Loader'
import { adminApi } from '../../api/client'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [pendingVerifications, setPendingVerifications] = useState([])

  // Modal States
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  // Pending Campaigns Mock Queue for Rule 3
  const [pendingCampaigns, setPendingCampaigns] = useState([
    { id: 'C-1', title: 'Flood Relief Soup Kitchen 2026', organizer: 'Colombo Red Cross Help', target: '500 Families', foodAmount: '300 KG', date: '2026-11-02' },
    { id: 'C-2', title: 'Stray Puppies Feeding Drive', organizer: 'Bambalapitiya Animal Aid', target: '80 Dogs', foodAmount: '80 KG', date: '2026-11-01' },
  ])

  useEffect(() => {
    loadPendingVerifications()
  }, [])

  const loadPendingVerifications = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getPendingVerifications()
      setPendingVerifications(res.data || [])
    } catch (err) {
      console.error('Failed to load pending verifications', err)
      showToast('Failed to load pending verifications queue', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (org) => {
    setSelectedOrg(org)
    setIsDetailsModalOpen(true)
  }

  const handleApprove = async (org) => {
    setProcessingAction(true)
    try {
      await adminApi.decideVerification(org.organizationType, org.id, {
        status: 'VERIFIED',
        reason: 'Organization registration documents verified by Administrator.',
      })
      showToast(`Approved ${org.name}! Audit log created and notification dispatched (Rule 2).`, 'success')
      setIsDetailsModalOpen(false)
      loadPendingVerifications()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve verification', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleOpenReject = (org) => {
    setSelectedOrg(org)
    setRejectionReason('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = async (e) => {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      showToast('A rejection reason is required to notify the organization.', 'error')
      return
    }

    setProcessingAction(true)
    try {
      await adminApi.decideVerification(selectedOrg.organizationType, selectedOrg.id, {
        status: 'REJECTED',
        reason: rejectionReason.trim(),
      })
      showToast(`Rejected verification for ${selectedOrg.name}. Audit log recorded.`, 'warning')
      setIsRejectModalOpen(false)
      setIsDetailsModalOpen(false)
      loadPendingVerifications()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject verification', 'error')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleApproveCampaign = (id, title) => {
    setPendingCampaigns((prev) => prev.filter((c) => c.id !== id))
    showToast(`Approved campaign "${title}" for public viewing (Rule 3).`, 'success')
  }

  const handleRejectCampaign = (id, title) => {
    setPendingCampaigns((prev) => prev.filter((c) => c.id !== id))
    showToast(`Rejected campaign "${title}".`, 'warning')
  }

  const stats = [
    {
      label: 'Pending Verifications (Rule 2)',
      value: `${pendingVerifications.length} Organizations`,
      icon: <ShieldCheck size={20} style={{ color: '#f59e0b' }} />,
    },
    {
      label: 'Pending Campaigns (Rule 3)',
      value: `${pendingCampaigns.length} Campaigns`,
      icon: <ClipboardList size={20} style={{ color: '#0284c7' }} />,
    },
    {
      label: 'Platform Users',
      value: '1,420 Registered',
      icon: <Users size={20} style={{ color: '#059669' }} />,
    },
    {
      label: 'Platform Revenue (Rule 8)',
      value: 'Rs. 485,000 (Subs)',
      icon: <DollarSign size={20} style={{ color: '#10b981' }} />,
    },
  ]

  const verificationColumns = [
    {
      key: 'name',
      label: 'Organization Name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.name}</div>
          <div className="text-xs text-muted">Reg: {row.registrationNumber}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Role / Type',
      render: (val, row) => (
        <span
          className={`badge ${
            row.organizationType === 'CHARITY'
              ? 'badge-emerald'
              : val === 'GROCERY'
              ? 'badge-sky'
              : 'badge-amber'
          }`}
        >
          {val}
        </span>
      ),
    },
    { key: 'district', label: 'District' },
    {
      key: 'contact',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="text-xs">
          <div>{row.contactPerson || 'N/A'}</div>
          <div className="text-muted">{row.contactPhone || row.contactEmail}</div>
        </div>
      ),
    },
    {
      key: 'documentUrl',
      label: 'Document',
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--color-primary-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <FileText size={14} /> Review Doc
          </a>
        ) : (
          <span className="text-xs text-muted">No Doc</span>
        ),
    },
    {
      key: 'actions',
      label: 'Decision (Rule 2)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={<Eye size={13} />}
            onClick={() => handleOpenDetails(row)}
          >
            Review
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={13} />}
            onClick={() => handleApprove(row)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<X size={13} />}
            onClick={() => handleOpenReject(row)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ]

  const campaignColumns = [
    { key: 'title', label: 'Campaign Title' },
    { key: 'organizer', label: 'Organizer' },
    { key: 'target', label: 'Beneficiaries' },
    { key: 'foodAmount', label: 'Food Target' },
    { key: 'date', label: 'Submitted' },
    {
      key: 'action',
      label: 'Approval (Rule 3)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={14} />}
            onClick={() => handleApproveCampaign(row.id, row.title)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<X size={14} />}
            onClick={() => handleRejectCampaign(row.id, row.title)}
          >
            Decline
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Admin Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
          <p className="text-sm text-muted">
            Enforce Rule 1 RBAC, Rule 2 Organization Verification, Rule 3 Campaign Approvals, and Audit Logging.
          </p>
        </div>

        <Button
          variant="outline"
          icon={<RefreshCw size={15} />}
          onClick={loadPendingVerifications}
          loading={loading}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span className="text-sm text-muted">{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Organization Verification Queue (Rule 2) */}
      <Card
        title="Pending Partner Verifications (Rule 2)"
        subtitle="Businesses and charities are strictly blocked from publishing until admin-approved. Every decision generates an audit_logs entry."
        badge={
          <span className={`badge ${pendingVerifications.length > 0 ? 'badge-amber' : 'badge-emerald'}`}>
            {pendingVerifications.length} Pending Review
          </span>
        }
        style={{ marginBottom: '2rem' }}
      >
        {loading ? (
          <Loader text="Loading pending verifications..." />
        ) : (
          <Table
            columns={verificationColumns}
            data={pendingVerifications}
            emptyMessage="All partner organizations have been reviewed. No pending verifications!"
          />
        )}
      </Card>

      {/* Campaign Approvals Queue (Rule 3) */}
      <Card
        title="Campaign Approval Queue (Rule 3)"
        subtitle="Charity and animal welfare relief campaigns must receive Admin approval before going public"
        badge={<span className="badge badge-sky">{pendingCampaigns.length} Review</span>}
        style={{ marginBottom: '2rem' }}
      >
        <Table
          columns={campaignColumns}
          data={pendingCampaigns}
          emptyMessage="No campaigns pending review."
        />
      </Card>

      {/* Organization Review & Document Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={selectedOrg?.name || 'Organization Review'}
        subtitle={`Type: ${selectedOrg?.organizationType} (${selectedOrg?.category}) • Reg No: ${selectedOrg?.registrationNumber}`}
        maxWidth="700px"
      >
        {selectedOrg && (
          <div>
            <div
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Organization Summary
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                {selectedOrg.description || 'No description provided.'}
              </p>

              {selectedOrg.operatingArea && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Operating Area:</strong> {selectedOrg.operatingArea}
                </div>
              )}

              {selectedOrg.capacityPeople && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <strong>Feeding Capacity:</strong> {selectedOrg.capacityPeople} beneficiaries
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Physical Location
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <div>{selectedOrg.addressLine1}</div>
                  {selectedOrg.addressLine2 && <div>{selectedOrg.addressLine2}</div>}
                  <div>{selectedOrg.city}, {selectedOrg.district} District</div>
                  <div className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>
                    Coords: {selectedOrg.latitude}, {selectedOrg.longitude}
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <Users size={16} style={{ color: 'var(--color-primary-600)' }} />
                  Contact Information
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <div><strong>Person:</strong> {selectedOrg.contactPerson || 'Not provided'}</div>
                  <div><strong>Email:</strong> {selectedOrg.contactEmail || 'Not provided'}</div>
                  <div><strong>Phone:</strong> {selectedOrg.contactPhone || 'Not provided'}</div>
                </div>
              </div>
            </div>

            {/* Supporting Document Section */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af' }}>
                <FileText size={24} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Official Registration Certificate
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                    Verify BR/NGO certification before granting publishing authorization
                  </div>
                </div>
              </div>
              {selectedOrg.documentUrl ? (
                <a
                  href={selectedOrg.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} /> Open Document
                </a>
              ) : (
                <span className="badge badge-amber">No Document Attached</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="danger"
                icon={<X size={14} />}
                onClick={() => handleOpenReject(selectedOrg)}
                loading={processingAction}
              >
                Reject Profile
              </Button>
              <Button
                variant="primary"
                icon={<Check size={14} />}
                onClick={() => handleApprove(selectedOrg)}
                loading={processingAction}
              >
                Approve & Grant Rights
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject Verification: ${selectedOrg?.name}`}
        subtitle="A clear explanation is required. The organization will receive an email stub notification with this reason."
        maxWidth="550px"
      >
        <form onSubmit={handleConfirmReject}>
          <Textarea
            label="Rejection Reason & Required Remediation"
            required
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. The uploaded Business Registration certificate is illegible. Please re-upload a clear copy of form 1/20."
            helper="This reason will be recorded in audit_logs and emailed to the organization owner."
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              icon={<X size={14} />}
              loading={processingAction}
            >
              Confirm Rejection & Send Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
