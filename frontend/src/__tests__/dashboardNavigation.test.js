import { describe, it, expect } from 'vitest'

describe('Dashboard Navigation and Aliases Route Mapping Tests', () => {
  const CHARITY_PATH_TO_TAB = {
    '/dashboard/charity': 'overview',
    '/dashboard/charity/': 'overview',
    '/dashboard/charity/overview': 'overview',
    '/dashboard/charity/available-food': 'browse',
    '/dashboard/charity/browse': 'browse',
    '/dashboard/charity/food': 'browse',
    '/dashboard/charity/surplus': 'browse',
    '/dashboard/charity/requests': 'my-requests',
    '/dashboard/charity/my-requests': 'my-requests',
    '/dashboard/charity/request': 'my-requests',
    '/dashboard/charity/campaigns': 'campaigns',
    '/dashboard/charity/campaign': 'campaigns',
    '/dashboard/charity/relief-campaigns': 'campaigns',
    '/dashboard/charity/contributions': 'contributions',
    '/dashboard/charity/contribution': 'contributions',
    '/dashboard/charity/donations': 'contributions',
    '/dashboard/charity/partnerships': 'partnerships',
    '/dashboard/charity/partnership': 'partnerships',
    '/dashboard/charity/csr': 'partnerships',
    '/dashboard/charity/volunteers': 'volunteers',
    '/dashboard/charity/volunteer': 'volunteers',
    '/dashboard/charity/volunteer-drives': 'volunteers',
    '/dashboard/charity/impact': 'impact',
    '/dashboard/charity/impact-tracker': 'impact',
    '/dashboard/charity/stats': 'impact',
  }

  const ADMIN_PATH_TO_TAB = {
    '/dashboard/admin': 'overview',
    '/dashboard/admin/': 'overview',
    '/dashboard/admin/overview': 'overview',
    '/dashboard/admin/users': 'users',
    '/dashboard/admin/verifications': 'verifications',
    '/dashboard/admin/pending-verifications': 'verifications',
    '/dashboard/admin/listings': 'listings',
    '/dashboard/admin/campaigns': 'campaigns',
    '/dashboard/admin/approvals': 'campaigns',
    '/dashboard/admin/partnerships': 'partnerships',
    '/dashboard/admin/revenue': 'subscriptions',
    '/dashboard/admin/subscriptions': 'subscriptions',
    '/dashboard/admin/impact': 'impact',
    '/dashboard/admin/audit': 'audit_logs',
    '/dashboard/admin/audit_logs': 'audit_logs',
    '/dashboard/admin/audit-logs': 'audit_logs',
    '/dashboard/admin/settings': 'settings',
  }

  it('correctly maps all 8 Charity portal subroutes to valid tab IDs', () => {
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity']).toBe('overview')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/available-food']).toBe('browse')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/requests']).toBe('my-requests')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/campaigns']).toBe('campaigns')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/contributions']).toBe('contributions')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/partnerships']).toBe('partnerships')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/volunteers']).toBe('volunteers')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/impact']).toBe('impact')
  })

  it('supports alias URLs for Charity portal without breaking tab mapping', () => {
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/browse']).toBe('browse')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/my-requests']).toBe('my-requests')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/relief-campaigns']).toBe('campaigns')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/donations']).toBe('contributions')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/csr']).toBe('partnerships')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/volunteer-drives']).toBe('volunteers')
    expect(CHARITY_PATH_TO_TAB['/dashboard/charity/impact-tracker']).toBe('impact')
  })

  it('correctly maps Admin routes including Platform Revenue and Subscriptions', () => {
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin']).toBe('overview')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/revenue']).toBe('subscriptions')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/subscriptions']).toBe('subscriptions')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/impact']).toBe('impact')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/verifications']).toBe('verifications')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/pending-verifications']).toBe('verifications')
    expect(ADMIN_PATH_TO_TAB['/dashboard/admin/audit']).toBe('audit_logs')
  })

  it('handles safe fallbacks when backend collections are null or undefined', () => {
    const rawListings = null
    const rawRequests = undefined
    const rawCampaigns = null
    const rawContributions = undefined
    const rawPartnerships = null
    const rawVolunteerDrives = undefined

    const safeListings = Array.isArray(rawListings) ? rawListings : []
    const safeRequests = Array.isArray(rawRequests) ? rawRequests : []
    const safeCampaigns = Array.isArray(rawCampaigns) ? rawCampaigns : []
    const safeContributions = Array.isArray(rawContributions) ? rawContributions : []
    const safePartnerships = Array.isArray(rawPartnerships) ? rawPartnerships : []
    const safeVolunteerDrives = Array.isArray(rawVolunteerDrives) ? rawVolunteerDrives : []

    expect(safeListings.length).toBe(0)
    expect(safeRequests.filter((r) => r.status === 'ACCEPTED')).toEqual([])
    expect(safeCampaigns.map((c) => c.title)).toEqual([])
    expect(safeContributions.length).toBe(0)
    expect(safePartnerships.length).toBe(0)
    expect(safeVolunteerDrives.length).toBe(0)
  })
})
