import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [healthData, setHealthData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      // Connect to Spring Boot backend health endpoint
      const response = await fetch(`${apiBaseUrl}/health`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setHealthData(data)
    } catch (err) {
      setError(err.message || 'Failed to reach backend server')
      setHealthData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const roles = [
    { name: 'ADMIN', desc: 'Platform oversight, approvals, and analytics' },
    { name: 'RESTAURANT', desc: 'Verified food donors listing surplus meals' },
    { name: 'GROCERY', desc: 'Supermarkets listing surplus produce and animal feed' },
    { name: 'CHARITY', desc: 'Verified non-profits claiming food for human consumption' },
    { name: 'ANIMAL_ORG', desc: 'Animal welfare groups claiming animal feed' },
    { name: 'USER', desc: 'Community members, volunteers, and donors' },
  ]

  return (
    <div className="foodbridge-container">
      <header className="header-banner">
        <span className="team-pill">Team EcoConnect &bull; Sri Lanka</span>
        <h1>FoodBridge</h1>
        <p className="tagline">
          Connecting restaurants, grocers, charities, animal welfare groups, and volunteers to end food waste.
        </p>
      </header>

      <div className="grid-2">
        {/* Backend & DB Health Card */}
        <section className="card">
          <div className="card-title">
            <span>Backend API Status</span>
            {loading ? (
              <span className="status-badge loading">Checking...</span>
            ) : healthData ? (
              <span className="status-badge up">Online</span>
            ) : (
              <span className="status-badge down">Offline</span>
            )}
          </div>
          <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
            Endpoint: <code>{apiBaseUrl}/health</code>
          </p>

          {healthData ? (
            <div>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Service:</strong> {healthData.service} (v{healthData.version})
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Team:</strong> {healthData.team}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Database:</strong>{' '}
                {healthData.database?.connected ? (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Connected ({healthData.database?.productName || 'PostgreSQL'})
                  </span>
                ) : (
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    Pending configuration (Offline/Local)
                  </span>
                )}
              </p>
              <pre className="code-block">{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                {error || 'Backend not responding. Start the Spring Boot API at port 8080.'}
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="probe-button"
              onClick={checkHealth}
              disabled={loading}
            >
              {loading ? 'Probing...' : 'Re-check Connection'}
            </button>
          </div>
        </section>

        {/* Roles & RBAC Card */}
        <section className="card">
          <div className="card-title">
            <span>Platform Roles & Access</span>
            <span className="status-badge up">RBAC Enforced</span>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
            Role-based access control applies to every endpoint.
          </p>
          <div className="roles-grid">
            {roles.map((r) => (
              <div key={r.name} className="role-badge-card">
                <div className="role-name">{r.name}</div>
                <div className="role-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Core Rules Section */}
      <section className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Core Platform Rules</h2>
        <ul className="rules-list">
          <li><strong>Role-Based Access Control:</strong> Enforced on every endpoint.</li>
          <li><strong>Admin Verification:</strong> Businesses and charities must be admin-verified prior to publishing.</li>
          <li><strong>Campaign Approvals:</strong> Fundraising and food campaigns require admin review before going public.</li>
          <li><strong>Impact Integrity:</strong> Only verified, completed activities count toward platform metrics.</li>
          <li><strong>No Payment Processing:</strong> Contributions are recorded and verified by recipient charities.</li>
          <li><strong>Privacy Safeguards:</strong> Private addresses and sensitive beneficiary details are never exposed.</li>
          <li><strong>Safety Separation:</strong> Distinct criteria and suitability checks for human food vs. animal feed.</li>
          <li><strong>Ledger Separation:</strong> Charity contributions are isolated from FoodBridge operational records.</li>
        </ul>
      </section>

      <footer>
        FoodBridge &copy; {new Date().getFullYear()} &bull; EcoConnect Team &bull; Sri Lanka
      </footer>
    </div>
  )
}
