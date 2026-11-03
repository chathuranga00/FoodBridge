import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Filter,
  Navigation,
  Compass,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingBag,
  Heart,
  Store,
  Shield,
  Utensils,
  Tag,
  AlertCircle,
  X,
  List,
  Map as MapIcon,
  ChevronRight,
  Sparkles,
  Dog,
} from 'lucide-react'
import { mapApi } from '../../api/client'
import { ensureLeafletMarkerCluster } from '../../utils/leafletCluster'
import Button from '../../components/common/Button'
import './ExploreMap.css'

// Sri Lanka District Centroid Coordinates
const DISTRICT_CENTROIDS = {
  Colombo: [6.9271, 79.8612],
  Gampaha: [7.084, 79.9943],
  Kalutara: [6.5854, 79.9607],
  Kandy: [7.2906, 80.6337],
  Matale: [7.4675, 80.6234],
  'Nuwara Eliya': [6.9497, 80.7891],
  Galle: [6.0535, 80.221],
  Matara: [5.9549, 80.555],
  Hambantota: [6.1429, 81.1212],
  Jaffna: [9.6615, 80.0255],
  Kilinochchi: [9.3803, 80.377],
  Mannar: [8.981, 79.9044],
  Vavuniya: [8.7542, 80.4982],
  Mullaitivu: [9.2671, 80.8142],
  Batticaloa: [7.731, 81.6747],
  Ampara: [7.2912, 81.6724],
  Trincomalee: [8.5874, 81.2152],
  Kurunegala: [7.4863, 80.3623],
  Puttalam: [8.0408, 79.8394],
  Anuradhapura: [8.3114, 80.4037],
  Polonnaruwa: [7.9403, 81.0188],
  Badulla: [6.9934, 81.055],
  Monaragala: [6.8728, 81.3507],
  Ratnapura: [6.6828, 80.4037],
  Kegalle: [7.2513, 80.3464],
}

const SRI_LANKA_CENTER = [7.8731, 80.7718]
const DEFAULT_ZOOM = 8

// SVGs for Custom Pins
const PIN_ICONS = {
  FOOD_LISTING: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path>
      <path d="M15 2v12"></path>
      <path d="M12 14v8"></path>
      <path d="M6 2v8a3 3 0 0 0 3 3h0"></path>
      <path d="M9 13v9"></path>
    </svg>`,
  GROCERY_OFFER: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
      <path d="M7 7h.01"></path>
    </svg>`,
  CAMPAIGN: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
    </svg>`,
  BUSINESS: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
      <path d="M2 7h20"></path>
    </svg>`,
  CHARITY: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>`,
  FEEDING_LOCATION: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 11c-1.66 0-3 1.34-3 3 0 1.9 1.7 3.9 3 5.3 1.3-1.4 3-3.4 3-5.3 0-1.66-1.34-3-3-3zm-6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>`,
}

export default function ExploreMap() {
  const navigate = useNavigate()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const clusterGroupRef = useRef(null)
  const markersMapRef = useRef(new Map())
  const userMarkerRef = useRef(null)

  // State
  const [markers, setMarkers] = useState([])
  const [filteredMarkers, setFilteredMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)

  // Filters State
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState('')

  // 1. Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return

      try {
        const L = await ensureLeafletMarkerCluster()
        if (!isMounted || !mapContainerRef.current) return

        const map = L.map(mapContainerRef.current, {
          center: SRI_LANKA_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          minZoom: 6,
          maxZoom: 18,
        })

        // Tile Layers Configuration (OpenStreetMap default + Google Maps if key present)
        const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })

        const baseLayers = {
          'OpenStreetMap': osmLayer,
        }

        let defaultLayer = osmLayer

        if (googleApiKey) {
          const googleRoadmap = L.tileLayer(`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleApiKey}`, {
            attribution: '&copy; Google Maps',
            maxZoom: 20,
          })
          const googleSatellite = L.tileLayer(`https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleApiKey}`, {
            attribution: '&copy; Google Maps Satellite',
            maxZoom: 20,
          })
          const googleTerrain = L.tileLayer(`https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${googleApiKey}`, {
            attribution: '&copy; Google Maps Terrain',
            maxZoom: 20,
          })

          baseLayers['Google Roadmap'] = googleRoadmap
          baseLayers['Google Satellite'] = googleSatellite
          baseLayers['Google Terrain'] = googleTerrain
          defaultLayer = googleRoadmap
        }

        defaultLayer.addTo(map)

        if (Object.keys(baseLayers).length > 1) {
          L.control.layers(baseLayers, null, { position: 'topright' }).addTo(map)
        }

        // Add Zoom Control to bottom-left to leave space for controls
        L.control.zoom({ position: 'bottomleft' }).addTo(map)

        // Initialize Marker Cluster Group with smooth spiderfy
        const clusterGroup = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          disableClusteringAtZoom: 16,
        })
        map.addLayer(clusterGroup)

        mapInstanceRef.current = map
        clusterGroupRef.current = clusterGroup

        // Fetch initial marker data
        fetchMarkerData()
      } catch (err) {
        console.error('Error initializing Leaflet map:', err)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        clusterGroupRef.current = null
      }
    }
  }, [])

  // 2. Fetch Markers from Backend API
  const fetchMarkerData = async (overrides = {}) => {
    setLoading(true)
    try {
      const params = {
        type: overrides.type !== undefined ? overrides.type : (selectedType === 'ALL' ? null : selectedType),
        category: overrides.category !== undefined ? overrides.category : (selectedCategory || null),
        availableOnly: overrides.availableOnly !== undefined ? overrides.availableOnly : (availableOnly || null),
        district: overrides.district !== undefined ? overrides.district : (selectedDistrict || null),
        search: overrides.search !== undefined ? overrides.search : (searchQuery || null),
      }

      if (userLocation) {
        params.userLat = userLocation.lat
        params.userLng = overrides.lng !== undefined ? overrides.lng : userLocation.lng
        if (radiusKm) {
          params.radiusKm = parseFloat(radiusKm)
        }
      }

      const res = await mapApi.getExploreMarkers(params)
      const data = res.data || []
      setMarkers(data)
      setFilteredMarkers(data)
    } catch (err) {
      console.error('Failed to load explore map markers:', err)
    } finally {
      setLoading(false)
    }
  }

  // 3. Render Markers on Map whenever filteredMarkers updates
  useEffect(() => {
    const map = mapInstanceRef.current
    const cluster = clusterGroupRef.current
    if (!map || !cluster || typeof window === 'undefined' || !window.L) return

    const L = window.L

    // Clear existing markers
    cluster.clearLayers()
    markersMapRef.current.clear()

    filteredMarkers.forEach((marker) => {
      if (!marker.latitude || !marker.longitude) return

      // Determine CSS class based on markerType
      let pinClass = 'pin-food'
      if (marker.markerType === 'GROCERY_OFFER') pinClass = 'pin-grocery'
      else if (marker.markerType === 'CAMPAIGN') pinClass = 'pin-campaign'
      else if (marker.markerType === 'BUSINESS') pinClass = 'pin-business'
      else if (marker.markerType === 'CHARITY') pinClass = 'pin-charity'
      else if (marker.markerType === 'FEEDING_LOCATION') pinClass = 'pin-animal'

      const iconHtml = PIN_ICONS[marker.markerType] || PIN_ICONS.FOOD_LISTING

      const customDivIcon = L.divIcon({
        className: 'custom-pin-root',
        html: `
          <div class="custom-pin-wrapper ${pinClass}">
            <div class="pin-bubble">${iconHtml}</div>
            <div class="pin-arrow"></div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -40],
      })

      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon: customDivIcon,
        title: marker.title,
      })

      // Construct Popup Content with strict public-safe safeguard notices
      const popupHtml = buildPopupHtml(marker)
      leafletMarker.bindPopup(popupHtml, {
        maxWidth: 320,
        className: 'custom-leaflet-popup',
      })

      leafletMarker.on('click', () => {
        setSelectedMarker(marker)
      })

      cluster.addLayer(leafletMarker)
      markersMapRef.current.set(marker.id, leafletMarker)
    })
  }, [filteredMarkers])

  // Helper to build HTML for Leaflet Popup
  const buildPopupHtml = (marker) => {
    let typeBadgeLabel = 'Surplus Food'
    let typeBadgeStyle = 'background: #dcfce7; color: #15803d;'
    if (marker.markerType === 'GROCERY_OFFER') {
      typeBadgeLabel = 'Grocery Discount'
      typeBadgeStyle = 'background: #dbeafe; color: #1d4ed8;'
    } else if (marker.markerType === 'CAMPAIGN') {
      typeBadgeLabel = 'Rural Campaign'
      typeBadgeStyle = 'background: #ffe4e6; color: #be123c;'
    } else if (marker.markerType === 'BUSINESS') {
      typeBadgeLabel = 'Verified Business'
      typeBadgeStyle = 'background: #fef3c7; color: #b45309;'
    } else if (marker.markerType === 'CHARITY') {
      typeBadgeLabel = 'Charity Center'
      typeBadgeStyle = 'background: #ede9fe; color: #6d28d9;'
    } else if (marker.markerType === 'FEEDING_LOCATION') {
      typeBadgeLabel = 'Animal Feeding Point'
      typeBadgeStyle = 'background: #ffedd5; color: #c2410c;'
    }

    const campaignSafetyNotice =
      marker.markerType === 'CAMPAIGN'
        ? `<div style="font-size: 0.73rem; color: #64748b; background: #f8fafc; padding: 0.4rem 0.5rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 0.4rem; display: flex; gap: 0.35rem; align-items: center;">
             <span>🛡️ Area-level district location shown to safeguard rural family dignity.</span>
           </div>`
        : ''

    const distanceHtml =
      marker.distanceKm !== null && marker.distanceKm !== undefined
        ? `<div style="font-size: 0.78rem; font-weight: 600; color: #0284c7; margin-top: 0.25rem;">
             📍 ${marker.distanceKm.toFixed(1)} km from your location
           </div>`
        : ''

    const actionText =
      marker.markerType === 'CAMPAIGN'
        ? 'Support Campaign'
        : marker.markerType === 'GROCERY_OFFER'
        ? 'View Offer & Reserve'
        : marker.markerType === 'FOOD_LISTING'
        ? 'View Surplus Details'
        : 'Explore Details'

    return `
      <div class="custom-popup-card">
        <div class="popup-header">
          <span class="popup-badge" style="${typeBadgeStyle}">${typeBadgeLabel}</span>
          ${
            marker.isVerified
              ? `<span style="font-size: 0.72rem; color: #059669; font-weight: 600;">✓ Verified</span>`
              : ''
          }
        </div>
        <div class="popup-body">
          <h4 class="popup-title">${escapeHtml(marker.title || '')}</h4>
          
          ${
            marker.organizationName
              ? `<div class="popup-meta">
                   <strong>${escapeHtml(marker.organizationName)}</strong>
                 </div>`
              : ''
          }

          <div class="popup-meta" style="color: #64748b;">
            <span>📍 ${escapeHtml(marker.district || '')}${marker.city ? ', ' + escapeHtml(marker.city) : ''}</span>
          </div>

          ${
            marker.quantityInfo
              ? `<div style="font-size: 0.82rem; font-weight: 600; color: #0f172a;">
                   📦 ${escapeHtml(marker.quantityInfo)}
                 </div>`
              : ''
          }

          ${
            marker.priceInfo
              ? `<div style="font-size: 0.85rem; font-weight: 700; color: #059669;">
                   ${escapeHtml(marker.priceInfo)}
                 </div>`
              : ''
          }

          ${
            marker.timeWindow
              ? `<div style="font-size: 0.78rem; color: #64748b;">
                   ⏰ ${escapeHtml(marker.timeWindow)}
                 </div>`
              : ''
          }

          ${
            marker.progressPercentage !== null && marker.progressPercentage !== undefined
              ? `<div style="margin-top: 0.35rem;">
                   <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">
                     <span>Goal Progress</span>
                     <span>${marker.progressPercentage}%</span>
                   </div>
                   <div style="height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                     <div style="width: ${Math.min(100, marker.progressPercentage)}%; height: 100%; background: #be123c;"></div>
                   </div>
                 </div>`
              : ''
          }

          ${distanceHtml}
          ${campaignSafetyNotice}

          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
            <a href="${escapeHtml(marker.targetUrl || '/')}" class="popup-action-btn" style="flex: 1; text-align: center;">
              ${actionText} &rarr;
            </a>
            ${
              marker.latitude && marker.longitude
                ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}" target="_blank" rel="noopener noreferrer" class="popup-action-btn" style="background: #0284c7; flex: 0 0 auto; padding: 0.45rem 0.65rem;" title="Get directions in Google Maps">
                     🗺️
                   </a>`
                : ''
            }
          </div>
        </div>
      </div>
    `
  }

  // Basic HTML Escaper for Safety
  const escapeHtml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // 4. Handle "Near Me" GPS Geolocation
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationLoading(false)

        const map = mapInstanceRef.current
        const L = window.L
        if (map && L) {
          // Add or move user GPS marker
          if (!userMarkerRef.current) {
            const userIcon = L.divIcon({
              className: 'user-gps-root',
              html: `
                <div class="user-gps-marker">
                  <div class="user-gps-pulse"></div>
                  <div class="user-gps-core"></div>
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map)
            userMarkerRef.current.bindPopup(
              `<div style="padding: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #0284c7;">
                📍 You are here
               </div>`
            )
          } else {
            userMarkerRef.current.setLatLng([latitude, longitude])
          }

          // Smoothly fly map to user
          map.flyTo([latitude, longitude], 13, { duration: 1.2 })
        }

        // Re-fetch markers with distance calculations
        fetchMarkerData()
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setLocationLoading(false)
        setLocationError('Unable to retrieve your location. Please check location permissions.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // 5. Handle District Pan
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district)
    const map = mapInstanceRef.current
    if (district && DISTRICT_CENTROIDS[district] && map) {
      const coords = DISTRICT_CENTROIDS[district]
      map.flyTo(coords, 11, { duration: 1 })
    }
  }

  // 6. Handle Card Click in Sidebar
  const handleCardClick = (marker) => {
    setSelectedMarker(marker)
    const map = mapInstanceRef.current
    if (!map) return

    map.flyTo([marker.latitude, marker.longitude], 15, { duration: 0.8 })

    // Open Leaflet popup
    const leafletMarker = markersMapRef.current.get(marker.id)
    if (leafletMarker) {
      setTimeout(() => {
        leafletMarker.openPopup()
      }, 500)
    }
  }

  // Trigger search/filter fetch
  const handleApplyFilters = () => {
    fetchMarkerData()
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedType('ALL')
    setSelectedCategory('')
    setAvailableOnly(false)
    setSelectedDistrict('')
    setSearchQuery('')
    setRadiusKm('')
    setUserLocation(null)
    if (userMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }
    const map = mapInstanceRef.current
    if (map) {
      map.flyTo(SRI_LANKA_CENTER, DEFAULT_ZOOM)
    }
    fetchMarkerData({
      type: null,
      category: null,
      availableOnly: null,
      district: null,
      search: null,
    })
  }

  // Type Counts
  const counts = {
    ALL: markers.length,
    FOOD_LISTING: markers.filter((m) => m.markerType === 'FOOD_LISTING').length,
    GROCERY_OFFER: markers.filter((m) => m.markerType === 'GROCERY_OFFER').length,
    CAMPAIGN: markers.filter((m) => m.markerType === 'CAMPAIGN').length,
    BUSINESS: markers.filter((m) => m.markerType === 'BUSINESS').length,
    CHARITY: markers.filter((m) => m.markerType === 'CHARITY').length,
    FEEDING_LOCATION: markers.filter((m) => m.markerType === 'FEEDING_LOCATION').length,
  }

  return (
    <div className="explore-page-wrapper">
      {/* Top Header & Filter Controls Bar */}
      <div className="explore-header-bar">
        {/* Row 1: Search, Near Me, District, Radius, Availability */}
        <div className="explore-controls-row">
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search food, discounts, campaigns, towns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                fontSize: '0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          {/* District Dropdown */}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              handleDistrictChange(e.target.value)
              fetchMarkerData({ district: e.target.value || null })
            }}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.85rem',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            <option value="">All 25 Districts</option>
            {Object.keys(DISTRICT_CENTROIDS).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Near Me GPS Button */}
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locationLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: userLocation ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: userLocation ? '#f0fdf4' : '#ffffff',
              color: userLocation ? 'var(--color-primary)' : 'var(--color-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <Navigation size={16} style={{ color: userLocation ? 'var(--color-primary)' : '#0284c7' }} />
            {locationLoading ? 'Locating...' : userLocation ? 'Near Me (Active)' : 'Near Me'}
          </button>

          {/* Radius Selector (visible when location active) */}
          {userLocation && (
            <select
              value={radiusKm}
              onChange={(e) => {
                setRadiusKm(e.target.value)
                fetchMarkerData()
              }}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <option value="">Any Radius</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>
          )}

          {/* Available Now Only Toggle */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                setAvailableOnly(e.target.checked)
                fetchMarkerData({ availableOnly: e.target.checked || null })
              }}
              style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            Available Now Only
          </label>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset
          </button>
        </div>

        {/* Row 2: Type Filter Pills */}
        <div className="type-pills-container">
          <button
            type="button"
            className={`type-pill ${selectedType === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('ALL')
              fetchMarkerData({ type: null })
            }}
          >
            <Layers size={14} /> All Locations
            <span className="type-pill-count">{counts.ALL}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'FOOD_LISTING' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('FOOD_LISTING')
              fetchMarkerData({ type: 'FOOD_LISTING' })
            }}
          >
            <Utensils size={14} style={{ color: selectedType === 'FOOD_LISTING' ? '#ffffff' : '#059669' }} />
            Surplus Food
            <span className="type-pill-count">{counts.FOOD_LISTING}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'GROCERY_OFFER' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('GROCERY_OFFER')
              fetchMarkerData({ type: 'GROCERY_OFFER' })
            }}
          >
            <Tag size={14} style={{ color: selectedType === 'GROCERY_OFFER' ? '#ffffff' : '#2563eb' }} />
            Grocery Deals
            <span className="type-pill-count">{counts.GROCERY_OFFER}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'CAMPAIGN' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('CAMPAIGN')
              fetchMarkerData({ type: 'CAMPAIGN' })
            }}
          >
            <Heart size={14} style={{ color: selectedType === 'CAMPAIGN' ? '#ffffff' : '#e11d48' }} />
            Rural Campaigns
            <span className="type-pill-count">{counts.CAMPAIGN}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'BUSINESS' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('BUSINESS')
              fetchMarkerData({ type: 'BUSINESS' })
            }}
          >
            <Store size={14} style={{ color: selectedType === 'BUSINESS' ? '#ffffff' : '#d97706' }} />
            Partner Businesses
            <span className="type-pill-count">{counts.BUSINESS}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'CHARITY' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('CHARITY')
              fetchMarkerData({ type: 'CHARITY' })
            }}
          >
            <Shield size={14} style={{ color: selectedType === 'CHARITY' ? '#ffffff' : '#7c3aed' }} />
            Charity Hubs
            <span className="type-pill-count">{counts.CHARITY}</span>
          </button>

          <button
            type="button"
            className={`type-pill ${selectedType === 'FEEDING_LOCATION' ? 'active' : ''}`}
            onClick={() => {
              setSelectedType('FEEDING_LOCATION')
              fetchMarkerData({ type: 'FEEDING_LOCATION' })
            }}
          >
            <Dog size={14} style={{ color: selectedType === 'FEEDING_LOCATION' ? '#ffffff' : '#ea580c' }} />
            Animal Feeding
            <span className="type-pill-count">{counts.FEEDING_LOCATION}</span>
          </button>
        </div>

        {/* Location Error alert if any */}
        {locationError && (
          <div
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              fontSize: '0.8rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={15} />
            <span>{locationError}</span>
            <button
              onClick={() => setLocationError(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area (Map + Results Sidebar) */}
      <div className="explore-content-area">
        {/* Leaflet Map DOM Element */}
        <div ref={mapContainerRef} className="explore-map-view" />

        {/* Interactive Results Sidebar / Drawer */}
        <div className={`explore-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Explore Results
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {filteredMarkers.length} {filteredMarkers.length === 1 ? 'location' : 'locations'} found
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '0.25rem',
              }}
              title="Close Panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Privacy & Safeguard Info Note */}
          <div
            style={{
              margin: '0.75rem 1rem 0 1rem',
              padding: '0.6rem 0.75rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.74rem',
              color: '#64748b',
              lineHeight: 1.4,
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'flex-start',
            }}
          >
            <Shield size={16} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Dignity Guarantee:</strong> Verified rural campaigns display safe area-level district locations
              only. Personal addresses and beneficiary identities are never exposed.
            </span>
          </div>

          {/* List of matching cards */}
          <div className="sidebar-cards-scroll">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e2e8f0',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem auto',
                  }}
                />
                <p style={{ fontSize: '0.85rem' }}>Loading map coordinates...</p>
              </div>
            ) : filteredMarkers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                <MapPin size={36} style={{ margin: '0 auto 0.5rem auto', color: '#cbd5e1' }} />
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text)' }}>No locations found</h4>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>Try adjusting your filters or expanding your search.</p>
                <Button size="sm" variant="outline" onClick={handleResetFilters} style={{ marginTop: '1rem' }}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredMarkers.map((marker) => {
                const isSelected = selectedMarker?.id === marker.id

                let badgeText = 'Surplus Food'
                let badgeClass = 'badge-emerald'
                if (marker.markerType === 'GROCERY_OFFER') {
                  badgeText = 'Grocery Deal'
                  badgeClass = 'badge-sky'
                } else if (marker.markerType === 'CAMPAIGN') {
                  badgeText = 'Rural Campaign'
                  badgeClass = 'badge-rose'
                } else if (marker.markerType === 'BUSINESS') {
                  badgeText = 'Business'
                  badgeClass = 'badge-amber'
                } else if (marker.markerType === 'CHARITY') {
                  badgeText = 'Charity Hub'
                  badgeClass = 'badge-purple'
                } else if (marker.markerType === 'FEEDING_LOCATION') {
                  badgeText = 'Animal Feeding'
                  badgeClass = 'badge-amber'
                }

                return (
                  <div
                    key={marker.id}
                    className={`marker-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCardClick(marker)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.72rem' }}>
                        {badgeText}
                      </span>
                      {marker.distanceKm !== null && marker.distanceKm !== undefined && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>
                          {marker.distanceKm.toFixed(1)} km away
                        </span>
                      )}
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        lineHeight: 1.3,
                      }}
                    >
                      {marker.title}
                    </h4>

                    {marker.organizationName && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {marker.organizationName}
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.76rem',
                        color: '#64748b',
                      }}
                    >
                      <MapPin size={13} />
                      <span>
                        {marker.district}
                        {marker.city ? `, ${marker.city}` : ''}
                      </span>
                    </div>

                    {/* Offer / Listing Specific info */}
                    {marker.quantityInfo && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        📦 {marker.quantityInfo}
                      </div>
                    )}

                    {marker.priceInfo && (
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {marker.priceInfo}
                      </div>
                    )}

                    {/* Progress Bar for Campaigns */}
                    {marker.progressPercentage !== null && marker.progressPercentage !== undefined && (
                      <div style={{ marginTop: '0.2rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            marginBottom: '2px',
                          }}
                        >
                          <span>Progress</span>
                          <span>{marker.progressPercentage}%</span>
                        </div>
                        <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, marker.progressPercentage)}%`,
                              height: '100%',
                              background: '#be123c',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action links */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                      {marker.latitude && marker.longitude ? (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: '0.74rem',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none',
                            fontWeight: 500,
                          }}
                          title="Get directions in Google Maps"
                        >
                          <Navigation size={12} /> Directions
                        </a>
                      ) : <span />}
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        View on Map <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="floating-map-buttons">
          {/* Toggle Results List Button */}
          <button
            type="button"
            className={`map-round-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Hide Results List' : 'Show Results List'}
          >
            {sidebarOpen ? <MapIcon size={20} /> : <List size={20} />}
          </button>

          {/* Near Me Quick Button */}
          <button
            type="button"
            className={`map-round-btn ${userLocation ? 'active' : ''}`}
            onClick={handleNearMe}
            title="Locate Me (GPS)"
          >
            <Compass size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

