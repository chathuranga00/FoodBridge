import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient, { authApi, foodRescueApi, groceryApi, partnershipApi } from '../api/client'

describe('Critical Business Flows Frontend Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    // Mock localStorage
    const storage = {}
    global.localStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => {
        storage[key] = value.toString()
      },
      removeItem: (key) => {
        delete storage[key]
      },
      clear: () => {
        Object.keys(storage).forEach((k) => delete storage[k])
      },
    }
  })

  describe('1. Authentication Flow', () => {
    it('authenticates user and provides bearer credentials', async () => {
      const mockAuthResponse = {
        data: {
          accessToken: 'mock-jwt-access-token-12345',
          refreshToken: 'mock-jwt-refresh-token-67890',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 'user-uuid-1',
            email: 'restaurant@foodbridge.lk',
            fullName: 'Colombo Food Hub',
            role: 'RESTAURANT',
          },
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockAuthResponse)

      const result = await authApi.login({
        email: 'restaurant@foodbridge.lk',
        password: 'SecurePassword123!',
      })

      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(postSpy).toHaveBeenCalledWith('/auth/login', {
        email: 'restaurant@foodbridge.lk',
        password: 'SecurePassword123!',
      })
      expect(result.data.accessToken).toBe('mock-jwt-access-token-12345')
      expect(result.data.user.role).toBe('RESTAURANT')
    })
  })

  describe('2. Food Rescue Request Flow', () => {
    it('submits a food rescue request to /food-rescue/requests', async () => {
      const mockReqResponse = {
        data: {
          id: 'request-uuid-101',
          listingId: 'listing-uuid-202',
          quantityRequested: 15.0,
          status: 'PENDING',
          notes: 'For emergency community kitchen',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockReqResponse)

      const payload = {
        listingId: 'listing-uuid-202',
        quantityRequested: 15.0,
        notes: 'For emergency community kitchen',
      }

      const result = await foodRescueApi.createRequest(payload)

      expect(postSpy).toHaveBeenCalledWith('/food-rescue/requests', payload)
      expect(result.data.status).toBe('PENDING')
      expect(result.data.id).toBe('request-uuid-101')
    })

    it('approves a food rescue request via /food-rescue/requests/:id/decide', async () => {
      const mockDecisionResponse = {
        data: {
          id: 'request-uuid-101',
          status: 'ACCEPTED',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockDecisionResponse)

      const result = await foodRescueApi.decideRequest('request-uuid-101', {
        decision: 'APPROVE',
        reason: 'Pickup scheduled for 3 PM',
      })

      expect(postSpy).toHaveBeenCalledWith('/food-rescue/requests/request-uuid-101/decide', {
        decision: 'APPROVE',
        reason: 'Pickup scheduled for 3 PM',
      })
      expect(result.data.status).toBe('ACCEPTED')
    })
  })

  describe('3. Grocery Coupon Reservation & Redemption Flow', () => {
    it('reserves a grocery discount offer with atomic quantity decrement', async () => {
      const mockReserveResponse = {
        data: {
          id: 'reservation-uuid-501',
          offerId: 'offer-uuid-301',
          redemptionCode: 'FB-889900',
          quantity: 2,
          unitPrice: 400.0,
          totalPrice: 800.0,
          status: 'RESERVED',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockReserveResponse)

      const result = await groceryApi.reserveOffer('offer-uuid-301', { quantity: 2 })

      expect(postSpy).toHaveBeenCalledWith('/grocery/offers/offer-uuid-301/reserve', { quantity: 2 })
      expect(result.data.redemptionCode).toBe('FB-889900')
      expect(result.data.status).toBe('RESERVED')
    })

    it('confirms grocery coupon redemption via /grocery/redemptions/confirm', async () => {
      const mockRedeemResponse = {
        data: {
          id: 'reservation-uuid-501',
          redemptionCode: 'FB-889900',
          status: 'REDEEMED',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockRedeemResponse)

      const result = await groceryApi.confirmRedemption({ redemptionCode: 'FB-889900' })

      expect(postSpy).toHaveBeenCalledWith('/grocery/redemptions/confirm', {
        redemptionCode: 'FB-889900',
      })
      expect(result.data.status).toBe('REDEEMED')
    })
  })

  describe('4. CSR Business-to-Charity Partnership Flow', () => {
    it('proposes partnership terms to campaign charity', async () => {
      const mockPartnershipResponse = {
        data: {
          id: 'partnership-uuid-777',
          campaignId: 'camp-uuid-999',
          businessId: 'biz-uuid-111',
          charityId: 'char-uuid-222',
          contributionType: 'MONETARY_PLEDGE',
          monetaryAmount: 75000.0,
          status: 'PROPOSED',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockPartnershipResponse)

      const proposal = {
        campaignId: 'camp-uuid-999',
        contributionType: 'MONETARY_PLEDGE',
        monetaryAmount: 75000.0,
        requestedRecognition: 'Banner placement and social recognition',
      }

      const result = await partnershipApi.proposePartnership(proposal)

      expect(postSpy).toHaveBeenCalledWith('/partnerships/propose', proposal)
      expect(result.data.status).toBe('PROPOSED')
      expect(result.data.monetaryAmount).toBe(75000.0)
    })

    it('confirms receipt and completes partnership, triggering recognition activation', async () => {
      const mockCompleteResponse = {
        data: {
          id: 'partnership-uuid-777',
          status: 'COMPLETED',
          recognitionActive: true,
          completionNotes: 'Direct bank transfer received and verified by charity board',
        },
      }

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockCompleteResponse)

      const completePayload = {
        completionNotes: 'Direct bank transfer received and verified by charity board',
      }

      const result = await partnershipApi.confirmReceiptAndComplete('partnership-uuid-777', completePayload)

      expect(postSpy).toHaveBeenCalledWith('/partnerships/partnership-uuid-777/complete', completePayload)
      expect(result.data.status).toBe('COMPLETED')
      expect(result.data.recognitionActive).toBe(true)
    })
  })
})
