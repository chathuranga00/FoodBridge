import { useState } from 'react'
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
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [pendingVerifications, setPendingVerifications] = useState([
    { id: 'V-1', name: 'Shangri-La Hotel Colombo', type: 'RESTAURANT', regNumber: 'PV-89210', district: 'Colombo', date: '2026-11-02' },
    { id: 'V-2', name: 'Galle Eldercare Foundation', type: 'CHARITY', regNumber: 'NGO-4412', district: 'Galle', date: '2026-11-01' },
    { id: 'V-3', name: 'Kandy Animal Rescue Shelter', type: 'ANIMAL_ORG', regNumber: 'AW-9901', district: 'Kandy', date: '2026-10-31' },
  ])

  const [pendingCampaigns, setPendingCampaigns] = useState([
    { id: 'C-1', title: 'Flood Relief Soup Kitchen 2026', organizer: 'Colombo Red Cross Help', target: '500 Families', foodAmount: '300 KG', date: '2026-11-02' },
    { id: 'C-2', title: 'Stray Puppies Feeding Drive', organizer: 'Bambalapitiya Animal Aid', target: '80 Dogs', foodAmount: '80 KG', date: '2026-11-01' },
  ])

  const stats = [
    { label: 'Pending Verifications', value: `${pendingVerifications.length} Organizations`, icon: <ShieldCheck size={20} style={{ color: '#f59e0b' }} /> },
    { label: 'Pending Campaigns', value: `${pendingCampaigns.length} Campaigns`, icon: <ClipboardList size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Platform Users', value: '1,420 Registered', icon: <Users size={20} style={{ color: '#059669' }} /> },
    { label: 'Platform Revenue', value: 'Rs. 485,000 (Subs)', icon: <DollarSign size={20} style={{ color: '#10b981' }} /> },
  ]

  const handleApproveOrg = (id, name) => {
    setPendingVerifications((prev) => prev.filter((o) => o.id !== id))
    showToast(`Approved ${name}! Publishing privileges enabled (Rule 2).`, 'success')
  }

  const handleRejectOrg = (id, name) => {
    setPendingVerifications((prev) => prev.filter((o) => o.id !== id))
    showToast(`Rejected verification for ${name}.`, 'warning')
  }

  const handleApproveCampaign = (id, title) => {
    setPendingCampaigns((prev) => prev.filter((c) => c.id !== id))
    showToast(`Approved campaign "${title}" for public viewing (Rule 3).`, 'success')
  }

  const handleRejectCampaign = (id, title) => {
    setPendingCampaigns((prev) => prev.filter((c) => c.id !== id))
    showToast(`Rejected campaign "${title}".`, 'warning')
  }

  const verificationColumns = [
    { key: 'name', label: 'Organization Name' },
    {
      key: 'type',
      label: 'Role / Type',
      render: (val) => (
        <span className={`badge ${val === 'CHARITY' ? 'badge-emerald' : val === 'ANIMAL_ORG' ? 'badge-sky' : 'badge-amber'}`}>
          {val}
        </span>
      ),
    },
    { key: 'regNumber', label: 'Govt Reg Number' },
    { key: 'district', label: 'District' },
    { key: 'date', label: 'Requested' },
    {
      key: 'action',
      label: 'Action (Rule 2)',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={14} />}
            onClick={() => handleApproveOrg(row.id, row.name)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<X size={14} />}
            onClick={() => handleRejectOrg(row.id, row.name)}
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
            Approve Public
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Administration</h1>
        <p className="text-sm text-muted">
          Oversee organization verifications, campaign moderation, governance rules, and global sustainability metrics.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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
        subtitle="Businesses and charities cannot publish until verified by an Administrator"
        badge={<span className="badge badge-amber">{pendingVerifications.length} Pending</span>}
        style={{ marginBottom: '2rem' }}
      >
        <Table
          columns={verificationColumns}
          data={pendingVerifications}
          emptyMessage="No pending verifications. All organizations are up to date."
        />
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
    </div>
  )
}
