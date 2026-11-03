import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'

// Public Pages
import Home from './pages/public/Home'
import About from './pages/public/About'
import HowItWorks from './pages/public/HowItWorks'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import BrowseGroceryOffers from './pages/public/BrowseGroceryOffers'
import BrowseCampaigns from './pages/public/BrowseCampaigns'
import CampaignDetail from './pages/public/CampaignDetail'
import ExploreMap from './pages/public/ExploreMap'
import PublicImpact from './pages/public/PublicImpact'
import BrowseBusinesses from './pages/public/BrowseBusinesses'
import BusinessProfile from './pages/public/BusinessProfile'
import BusinessPartnerships from './pages/public/BusinessPartnerships'
import VolunteerActivities from './pages/public/VolunteerActivities'
import NotificationsPage from './pages/public/NotificationsPage'

// Dashboard Shells
import UserDashboard from './pages/dashboards/UserDashboard'
import BusinessDashboard from './pages/dashboards/BusinessDashboard'
import CharityDashboard from './pages/dashboards/CharityDashboard'
import AnimalOrgDashboard from './pages/dashboards/AnimalOrgDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExploreMap />} />
              <Route path="/map" element={<ExploreMap />} />
              <Route path="/impact" element={<PublicImpact />} />
              <Route path="/businesses" element={<BrowseBusinesses />} />
              <Route path="/businesses/:id" element={<BusinessProfile />} />
              <Route path="/business/:id" element={<BusinessProfile />} />
              <Route path="/business-partnerships" element={<BusinessPartnerships />} />
              <Route path="/volunteer" element={<VolunteerActivities />} />
              <Route path="/volunteer-activities" element={<VolunteerActivities />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/grocery-offers" element={<BrowseGroceryOffers />} />
              <Route path="/campaigns" element={<BrowseCampaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* General User Dashboard Shell */}
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <DashboardLayout title="Community User Portal" />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserDashboard />} />
              <Route path="*" element={<UserDashboard />} />
            </Route>

            {/* Business Donor Dashboard Shell (Restaurants & Grocers) */}
            <Route
              path="/dashboard/business"
              element={
                <ProtectedRoute allowedRoles={['RESTAURANT', 'GROCERY', 'ADMIN']}>
                  <DashboardLayout title="Business Donor Portal" />
                </ProtectedRoute>
              }
            >
              <Route index element={<BusinessDashboard />} />
              <Route path="*" element={<BusinessDashboard />} />
            </Route>

            {/* Charity Operations Dashboard Shell */}
            <Route
              path="/dashboard/charity"
              element={
                <ProtectedRoute allowedRoles={['CHARITY', 'ADMIN']}>
                  <DashboardLayout title="Charity Operations Portal" />
                </ProtectedRoute>
              }
            >
              <Route index element={<CharityDashboard />} />
              <Route path="*" element={<CharityDashboard />} />
            </Route>

            {/* Animal Welfare Dashboard Shell */}
            <Route
              path="/dashboard/animal-welfare"
              element={
                <ProtectedRoute allowedRoles={['ANIMAL_ORG', 'ADMIN']}>
                  <DashboardLayout title="Animal Welfare Portal" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AnimalOrgDashboard />} />
              <Route path="*" element={<AnimalOrgDashboard />} />
            </Route>

            {/* Admin Governance Dashboard Shell */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout title="Platform Administration" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="*" element={<AdminDashboard />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
