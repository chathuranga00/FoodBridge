import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Heart,
  ShoppingBag,
  Users,
  Award,
  CheckCircle2,
  Plus,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'

export default function CharityDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Food Rescues Claimed', value: '38 Batches', icon: <ShoppingBag size={20} style={{ color: '#059669' }} /> },
    { label: 'Beneficiaries Fed', value: '4,850 People', icon: <Users size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Active Campaigns', value: '2 Approved', icon: <Heart size={20} style={{ color: '#e11d48' }} /> },
    { label: 'Verified Impact (Kg)', value: '2,400 kg', icon: <Award size={20} style={{ color: '#10b981' }} /> },
  ]

  const availableListings = [
    { id: '1', business: 'Hilton Colombo Kitchen', title: '50 Cooked Lunch Meal Packs', quantity: '50 Portions', expires: 'Today 3:30 PM', status: 'AVAILABLE' },
    { id: '2', business: 'Keells Super (Union Place)', title: 'Fresh Vegetables & Greens Assortment', quantity: '30 KG', expires: 'Today 6:00 PM', status: 'AVAILABLE' },
    { id: '3', business: 'Perera & Sons Bakery', title: 'Bread Loaves, Buns, Roti', quantity: '60 Units', expires: 'Today 7:00 PM', status: 'AVAILABLE' },
  ]

  const availableColumns = [
    { key: 'business', label: 'Donor Business' },
    { key: 'title', label: 'Listing Title' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'expires', label: 'Pickup Before' },
    {
      key: 'action',
      label: 'Claim',
      render: (_, row) => (
        <Button size="sm" variant="primary">
          Claim Batch
        </Button>
      ),
    },
  ]

  const campaigns = [
    { id: 'C-1', title: 'Grandpass Weekly Community Meal', target: '200 People', raised: 'Rs. 45,000 Pledged', status: 'APPROVED' },
    { id: 'C-2', title: 'Elderly Nutrition Drive - Modara', target: '80 Seniors', raised: 'Rs. 20,000 Pledged', status: 'APPROVED' },
    { id: 'C-3', title: 'Flood Relief Emergency Pantry', target: '500 Families', raised: 'Rs. 0', status: 'PENDING_APPROVAL' },
  ]

  const campaignColumns = [
    { key: 'title', label: 'Campaign Title' },
    { key: 'target', label: 'Target Beneficiaries' },
    { key: 'raised', label: 'Contributions (Rule 5)' },
    {
      key: 'status',
      label: 'Admin Status (Rule 3)',
      render: (val) => (
        <span className={`badge ${val === 'APPROVED' ? 'badge-emerald' : 'badge-amber'}`}>
          {val === 'APPROVED' ? 'Admin Approved' : 'Pending Admin Review'}
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Charity Operations Portal</h1>
          <p className="text-sm text-muted">
            Claim verified surplus food for human consumption and manage relief drives for {user?.fullName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<FileCheck size={16} />}>
            Confirm Contributions
          </Button>
          <Button variant="primary" icon={<Plus size={16} />}>
            Create New Campaign
          </Button>
        </div>
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

      {/* Live Available Food to Claim */}
      <Card
        title="Available Human-Edible Surplus (Ready for Pickup)"
        subtitle="Rule 7: Charities can only claim human consumption food"
        badge={<span className="badge badge-emerald">Live Feed</span>}
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={availableColumns} data={availableListings} />
      </Card>

      {/* Campaigns Table */}
      <Card
        title="Relief & Distribution Campaigns"
        subtitle="Rule 3: Campaigns must be admin-approved before going public to users"
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={campaignColumns} data={campaigns} />
      </Card>
    </div>
  )
}
