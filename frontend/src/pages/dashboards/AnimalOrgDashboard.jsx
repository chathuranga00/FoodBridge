import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Dog,
  MapPin,
  Heart,
  Award,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'

export default function AnimalOrgDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Animal Feed Rescued', value: '1,450 kg', icon: <Dog size={20} style={{ color: '#0284c7' }} /> },
    { label: 'Feeding Spots Mapped', value: '14 Locations', icon: <MapPin size={20} style={{ color: '#059669' }} /> },
    { label: 'Animals Fed Monthly', value: '620 Dogs & Cats', icon: <Heart size={20} style={{ color: '#e11d48' }} /> },
    { label: 'Confirmed Supplies', value: '28 Donors', icon: <Award size={20} style={{ color: '#b45309' }} /> },
  ]

  const animalFeedListings = [
    { id: 'AF-1', donor: 'Cargills Food City (Colombo 07)', title: 'Clean Meat Trimmings & Bones', quantity: '20 KG', expiry: 'Today 5:00 PM', status: 'AVAILABLE' },
    { id: 'AF-2', donor: 'Arpico Supercentre (Hyde Park)', title: 'Damaged Packaging Dog Food Bags', quantity: '35 KG', expiry: 'Tomorrow 12:00 PM', status: 'AVAILABLE' },
    { id: 'AF-3', donor: 'Galle Face Hotel Butchery', title: 'Cooked Broth Scraping & Meat Stock', quantity: '15 KG', expiry: 'Today 7:00 PM', status: 'AVAILABLE' },
  ]

  const feedColumns = [
    { key: 'donor', label: 'Donor Business' },
    { key: 'title', label: 'Feed Item' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'expiry', label: 'Pickup Before' },
    {
      key: 'action',
      label: 'Claim',
      render: (_, row) => (
        <Button size="sm" variant="primary">
          Claim Feed
        </Button>
      ),
    },
  ]

  const feedingLocations = [
    { id: 'LOC-1', name: 'Galle Face Green Stray Colony', animals: 'Stray Dogs (approx. 25)', routine: 'Daily 6:30 PM', district: 'Colombo' },
    { id: 'LOC-2', name: 'Viharamahadevi Park Cat Colony', animals: 'Community Cats (approx. 18)', routine: 'Daily 5:00 PM', district: 'Colombo' },
    { id: 'LOC-3', name: 'Kandy Lake Round Feeder Point', animals: 'Stray Dogs (approx. 14)', routine: 'Every Morning 7:00 AM', district: 'Kandy' },
  ]

  const locationColumns = [
    { key: 'name', label: 'Location Name' },
    { key: 'animals', label: 'Animals Supported' },
    { key: 'routine', label: 'Feeding Routine' },
    { key: 'district', label: 'District' },
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Animal Welfare Operations</h1>
          <p className="text-sm text-muted">
            Claim surplus animal feed and coordinate community stray animal feeding points for {user?.fullName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={<MapPin size={16} />}>
            Add Feeding Spot
          </Button>
          <Button variant="primary" icon={<Plus size={16} />}>
            New Feeding Drive
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

      {/* Available Animal Feed */}
      <Card
        title="Surplus Animal Feed Batches (Rule 7 Partition)"
        subtitle="Only registered animal welfare organizations may claim animal feed items"
        badge={<span className="badge badge-sky">Dedicated Feed</span>}
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={feedColumns} data={animalFeedListings} />
      </Card>

      {/* Community Feeding Locations */}
      <Card
        title="Active Community Feeding Locations"
        subtitle="Mapped coordinates for volunteer feeders and stray animal caretakers in Sri Lanka"
        action={<Button size="sm" variant="secondary">View Map</Button>}
        style={{ marginBottom: '2rem' }}
      >
        <Table columns={locationColumns} data={feedingLocations} />
      </Card>
    </div>
  )
}

