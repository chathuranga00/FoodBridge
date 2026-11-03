import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Ensure L is on window for leaflet.markercluster if required
if (typeof window !== 'undefined' && !window.L) {
  window.L = L
}

// Safely ensure L.markerClusterGroup is attached
let clusterLoaded = false
export async function ensureLeafletMarkerCluster() {
  if (typeof window !== 'undefined') {
    window.L = L
    if (!L.markerClusterGroup && !clusterLoaded) {
      await import('leaflet.markercluster')
      clusterLoaded = true
    }
  }
  return L
}

export default L
