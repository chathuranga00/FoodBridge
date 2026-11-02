import { useState } from 'react'
import {
  ShoppingBag,
  Heart,
  Dog,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('business')

  const tabs = [
    { id: 'business', label: 'Restaurants & Grocers', icon: <ShoppingBag size={18} /> },
    { id: 'charity', label: 'Charity Organizations', icon: <Heart size={18} /> },
    { id: 'animal', label: 'Animal Welfare', icon: <Dog size={18} /> },
    { id: 'volunteer', label: 'Volunteers & Public', icon: <Users size={18} /> },
  ]

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '720px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>User Guide</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            How FoodBridge Operates
          </h1>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>
            Transparent, safe, and community-driven workflows ensuring surplus food reaches the right beneficiaries.
          </p>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              icon={tab.icon}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ maxWidth: '850px', margin: '0 auto 4rem auto' }}>
          {activeTab === 'business' && (
            <Card title="Workflow for Food Donors (Restaurants & Grocers)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Registration & Admin Verification (Rule 2)</h4>
                    <p className="text-sm text-muted">
                      Register your food establishment with official business registration details.
                      An EcoConnect administrator verifies your credentials before you can publish listings.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>List Surplus Food with Suitability Tagging (Rule 7)</h4>
                    <p className="text-sm text-muted">
                      Select suitability type: <code>HUMAN_CONSUMPTION</code> or <code>ANIMAL_FEED</code>.
                      Specify food category, quantity, prepared timestamp, expiry time, and pickup window.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Review Claims & Handover to Verified Recipient</h4>
                    <p className="text-sm text-muted">
                      Verified charities or animal shelters claim the listing. Once collected, confirm the handover
                      in the dashboard to log verified impact statistics.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'charity' && (
            <Card title="Workflow for Charities & Community Kitchens">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Charity Verification & Capacity Setting</h4>
                    <p className="text-sm text-muted">
                      Provide NGO registration details and beneficiary capacity. Once verified, gain access to live
                      human-edible surplus listings across Sri Lanka.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Claim Food & Organize Pickup Logistics</h4>
                    <p className="text-sm text-muted">
                      Browse surplus food items on the map. Reserve the quantity needed, coordinate pickup with staff
                      or request volunteer courier assistance.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Create Admin-Approved Campaigns (Rule 3)</h4>
                    <p className="text-sm text-muted">
                      Submit food relief campaigns for community drives. Once approved by an Admin, campaigns go
                      public to gather volunteer help and verified supply pledges.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'animal' && (
            <Card title="Workflow for Animal Welfare Organizations & Shelters">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Shelter Verification & Stray Map Mapping</h4>
                    <p className="text-sm text-muted">
                      Register as an animal shelter or welfare organization. Mark public animal feeding locations,
                      stray dog colonies, and community cat feeding spots on the OpenStreetMap.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Claim Dedicated Animal Feed (Rule 7)</h4>
                    <p className="text-sm text-muted">
                      Access safe, non-human-grade surplus (meat trimmings, broth bones, damaged dry dog food packages)
                      donated specifically for animal feeding.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'volunteer' && (
            <Card title="Workflow for Volunteers & General Users">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Volunteer for Food Rescue Transport</h4>
                    <p className="text-sm text-muted">
                      Register as a transport volunteer (motorbike, three-wheeler, car, or van). Receive notifications
                      when a nearby charity needs surplus food collected and delivered quickly.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>Support Campaigns with Verified Pledges (Rule 5)</h4>
                    <p className="text-sm text-muted">
                      Pledge food items, equipment, or direct support for approved charity campaigns.
                      No digital payment processing is conducted on FoodBridge.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Food Safety & Suitability Callout */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ color: '#b45309', flexShrink: 0, marginTop: '2px' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#92400e', marginBottom: '0.5rem' }}>
                Strict Food Safety & Suitability Guidelines (Rule 7)
              </h3>
              <p className="text-sm" style={{ color: '#78350f', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Under no circumstances may spoiled, contaminated, or improperly stored food be listed.
                Surplus prepared food must have strict temperature logging, clean packaging, and be collected
                within the designated safe pickup window.
              </p>
              <ul className="text-sm" style={{ color: '#78350f', paddingLeft: '1.25rem' }}>
                <li>Human food cannot be claimed by animal welfare organizations and vice versa.</li>
                <li>Expired or damaged high-risk items (dairy, raw seafood) are strictly ineligible.</li>
                <li>Every batch must carry accurate allergen tags and storage instructions.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
