import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ShoppingBag,
  TrendingUp,
  Tag,
  ShieldCheck,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'

export default function BusinessDashboard() {
  const { user } = useAuth()
  const [verificationStatus] = useState('VERIFIED') // Mock status: VERIFIED / PENDING

  const stats = [
    { label: 'Active Food Listings', value: '4 Listings', icon: <ShoppingBag size={20} style={{ color: '#059669' }} /> },
    { label: 'Surplus Rescued', value: '1,280 kg', icon: <TrendingUp size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Near-Expiry Offers', value: '6 Live Deals', icon: <Tag size={20} style={{ color: '#b45309' }} /> },
    { label: 'CO2 Footprint Saved', value: '3,200 kg', icon: <ShieldCheck size={20} style={{ color: '#10b981' }} /> },
  ]

  const activeListings = [
    {
      id: 'L-101',
      title: 'Buffet Prepared Lunch Trays (Rice & Curry)',
      category: 'PREPARED_MEALS',
      suitability: 'HUMAN_CONSUMPTION',
      quantity: '25 KG',
      expiry: 'Today, 4:00 PM',
      status: 'AVAILABLE',
    },
    {
      id: 'L-102',
      title: 'Surplus Fresh Breads & Pastries',
      category: 'BAKERY',
      suitability: 'HUMAN_CONSUMPTION',
      quantity: '40 MEALS',
      expiry: 'Today, 8:00 PM',
      status: 'RESERVED',
    },
    {
      id: 'L-103',
      title: 'Meat Trimmings & Soup Bones (Animal Feed)',
      category: 'MEAT_SURPLUS',
      suitability: 'ANIMAL_FEED',
      quantity: '15 KG',
      expiry: 'Tomorrow, 10:00 AM',
      status: 'AVAILABLE',
    },
  ]

  const listingColumns = [
    { key: 'title', label: 'Listing Title' },
    { key: 'category', label: 'Category' },
    {
      key: 'suitability',
      label: 'Suitability (Rule 7)',
      render: (val) => (
        <span className={`badge ${val === 'HUMAN_CONSUMPTION' ? 'badge-emerald' : 'badge-sky'}`}>
          {val === 'HUMAN_CONSUMPTION' ? 'Human Edible' : 'Animal Feed'}
        </span>
      ),
    },
    { key: 'quantity', label: 'Quantity' },
    { key: 'expiry', label: 'Expires' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`badge ${val === 'AVAILABLE' ? 'badge-emerald' : 'badge-amber'}`}>
          {val}
        </span>
      ),
    },
  ]

  return (
    <div>
      {/* Verification Status Banner (Rule 2) */}
      {verificationStatus === 'VERIFIED' ? (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#065f46' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Verified Business Partner: Your establishment is verified by EcoConnect Admin. Full publishing rights active.
            </span>
          </div>
          <span className="badge badge-emerald">Verified</span>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#92400e' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Verification Pending (Rule 2): Your business registration is under review by FoodBridge administrators.
            </span>
          </div>
          <span className="badge badge-amber">Pending Approval</span>
        </div>
      )}

      {/* Top Banner */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Business Food Donor Portal</h1>
          <p className="text-sm text-muted">
            Manage surplus food listings, grocery promotions, and zero-waste analytics for {user?.fullName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<Tag size={16} />}>
            New Grocery Offer
          </Button>
          <Button variant="primary" icon={<Plus size={16} />}>
            List Surplus Food
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
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

      {/* Active Listings Table */}
      <Card
        title="Active Surplus Food Listings"
        subtitle="Rule 7: Strict suitability separation is applied to all published batches"
        action={<Button size="sm" variant="secondary">View All Batches</Button>}
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={listingColumns} data={activeListings} />
      </Card>
    </div>
  )
}
